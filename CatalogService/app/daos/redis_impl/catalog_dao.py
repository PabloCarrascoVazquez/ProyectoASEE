import json
import logging
from typing import Any, List, Optional
import redis
from redis.exceptions import RedisError
from app.daos.interfaces import ICatalogDAO

logger = logging.getLogger(__name__)

# Script Lua atómico en Redis: evita sobreventa ante peticiones concurrentes
LUA_RESERVAR_CUPO = """
local key = KEYS[1]
local stock_mongo = tonumber(ARGV[1])
local cantidad = tonumber(ARGV[2])
local ttl = tonumber(ARGV[3])

local retenidas = tonumber(redis.call('GET', key) or '0')
if (stock_mongo - retenidas) < cantidad then
    return 0
end

redis.call('INCRBY', key, cantidad)
redis.call('EXPIRE', key, ttl)
return 1
"""


class CatalogDAORedis(ICatalogDAO):
    def __init__(
        self,
        wrapped_dao: ICatalogDAO,
        redis_client: redis.Redis,
        cache_ttl: int = 60,
        lock_ttl: int = 660,
    ):
        self.dao = wrapped_dao
        self.redis = redis_client
        self.cache_ttl = cache_ttl
        self.lock_ttl = lock_ttl
        self._reservar_script = self.redis.register_script(LUA_RESERVAR_CUPO)

    # ==========================================
    # HELPERS DE CACHÉ (CACHE-ASIDE)
    # ==========================================
    def _get_json(self, key: str) -> Any:
        try:
            raw = self.redis.get(key)
            return json.loads(raw) if raw else None
        except RedisError as err:
            logger.warning("Redis GET fallo en %s: %s", key, err)
            return None

    def _set_json(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        try:
            self.redis.setex(key, ttl or self.cache_ttl, json.dumps(value, default=str))
        except RedisError as err:
            logger.warning("Redis SETEX fallo en %s: %s", key, err)

    def _invalidate_keys(self, *keys: str) -> None:
        valid_keys = [k for k in keys if k]
        if not valid_keys:
            return
        try:
            self.redis.delete(*valid_keys)
        except RedisError as err:
            logger.warning("Redis DELETE fallo en %s: %s", valid_keys, err)

    # ==========================================
    # FESTIVALES (CACHE-ASIDE + INVALIDACIÓN)
    # ==========================================
    def get_all_festivales(self) -> List[dict]:
        cache_key = "catalog:festivales:all"
        cached = self._get_json(cache_key)
        if cached is not None:
            return cached
        festivales = self.dao.get_all_festivales()
        self._set_json(cache_key, festivales)
        return festivales

    def create_festival(self, festival_data: dict) -> str:
        id_festival = self.dao.create_festival(festival_data)
        self._invalidate_keys("catalog:festivales:all")
        return id_festival

    def update_festival(self, id_festival: str, festival_data: dict) -> bool:
        updated = self.dao.update_festival(id_festival, festival_data)
        if updated:
            self._invalidate_keys(
                "catalog:festivales:all",
                f"catalog:festival:{id_festival}:espacios",
                f"catalog:festival:{id_festival}:entradas",
            )
        return updated

    def delete_festival(self, id_festival: str) -> bool:
        deleted = self.dao.delete_festival(id_festival)
        if deleted:
            self._invalidate_keys(
                "catalog:festivales:all",
                f"catalog:festival:{id_festival}:espacios",
                f"catalog:festival:{id_festival}:entradas",
            )
        return deleted

    # ==========================================
    # ESPACIOS Y ALQUILERES
    # ==========================================
    def get_espacios_by_festival(self, id_festival: str) -> List[dict]:
        cache_key = f"catalog:festival:{id_festival}:espacios"
        cached = self._get_json(cache_key)
        if cached is not None:
            return cached
        espacios = self.dao.get_espacios_by_festival(id_festival)
        self._set_json(cache_key, espacios)
        return espacios

    def create_espacio(self, id_festival: str, espacio_data: dict) -> bool:
        created = self.dao.create_espacio(id_festival, espacio_data)
        if created:
            self._invalidate_keys(f"catalog:festival:{id_festival}:espacios")
        return created

    def create_alquiler(self, alquiler_data: dict) -> bool:
        return self.dao.create_alquiler(alquiler_data)

    # ==========================================
    # ENTRADAS Y RESERVAS TEMPORALES SOLO EN REDIS
    # ==========================================
    def get_entradas_by_festival(self, id_festival: str) -> List[dict]:
        """
        Devuelve los tipos de entrada restando en tiempo real las unidades
        que estén bloqueadas temporalmente en Redis.
        """
        cache_key = f"catalog:festival:{id_festival}:entradas"
        entradas = self._get_json(cache_key)
        if entradas is None:
            entradas = self.dao.get_entradas_by_festival(id_festival)
            self._set_json(cache_key, entradas)

        resultado = []
        for item in entradas:
            entrada = dict(item)
            try:
                ret_key = f"catalog:retenidas:{id_festival}:{entrada['tipo']}"
                retenidas = int(self.redis.get(ret_key) or 0)
                entrada["disponibles"] = max(0, int(entrada["disponibles"]) - retenidas)
            except RedisError as err:
                logger.warning("Redis GET retenidas fallo: %s", err)
            resultado.append(entrada)

        return resultado

    def create_entradas(self, id_festival: str, entradas_data: dict) -> bool:
        created = self.dao.create_entradas(id_festival, entradas_data)
        if created:
            self._invalidate_keys(f"catalog:festival:{id_festival}:entradas")
        return created

    def bloquear_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """
        Reserva el cupo EXCLUSIVAMENTE en Redis con TTL (300s) mediante script Lua atómico.
        No escribe en MongoDB hasta que la compra se confirma.
        """
        entradas_mongo = self.dao.get_entradas_by_festival(id_festival)
        entrada = next((e for e in entradas_mongo if e["tipo"] == tipo_entrada), None)
        if not entrada:
            return False

        stock_mongo = int(entrada["disponibles"])
        ret_key = f"catalog:retenidas:{id_festival}:{tipo_entrada}"

        try:
            ok = self._reservar_script(
                keys=[ret_key],
                args=[stock_mongo, cantidad, self.lock_ttl],
            )
            return bool(ok == 1)
        except RedisError as err:
            logger.warning("Redis fallo en bloquear_cupo, fallback a BD principal: %s", err)
            return self.dao.bloquear_cupo(id_festival, tipo_entrada, cantidad)

    def liberar_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """
        Libera la reserva temporal directamente en Redis sin tocar MongoDB.
        """
        ret_key = f"catalog:retenidas:{id_festival}:{tipo_entrada}"
        try:
            if not self.redis.exists(ret_key):
                return True
            nuevo_valor = self.redis.decrby(ret_key, cantidad)
            if nuevo_valor <= 0:
                self.redis.delete(ret_key)
            return True
        except RedisError as err:
            logger.warning("Redis fallo en liberar_cupo, fallback a BD principal: %s", err)
            return self.dao.liberar_cupo(id_festival, tipo_entrada, cantidad)

    def confirmar_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """
        Consolida la venta definitiva en MongoDB tras el pago y libera la retención en Redis.
        """
        confirmado = self.dao.bloquear_cupo(id_festival, tipo_entrada, cantidad)
        if confirmado:
            self._invalidate_keys(f"catalog:festival:{id_festival}:entradas")
            self.liberar_cupo(id_festival, tipo_entrada, cantidad)
        return confirmado

    # ==========================================
    # ARTISTAS FAVORITOS Y ARTISTAS
    # ==========================================
    def add_artista_favorito(self, user_id: str, id_festival: str, nombre_artista: str) -> bool:
        return self.dao.add_artista_favorito(user_id, id_festival, nombre_artista)

    def create_artista(self, artista_data: dict) -> int:
        return self.dao.create_artista(artista_data)