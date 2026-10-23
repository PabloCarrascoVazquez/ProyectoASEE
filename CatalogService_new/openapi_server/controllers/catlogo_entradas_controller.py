import flask
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.bloqueo_cupo_request import BloqueoCupoRequest  # noqa: E501
from openapi_server.models.bloqueo_cupo_response import BloqueoCupoResponse  # noqa: E501
from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.tipo_entrada import TipoEntrada  # noqa: E501
from openapi_server import util


def festivales_id_festival_entradas_bloquear_post(id_festival, body):  # noqa: E501
    """Bloqueo temporal de cupo (Llamada interna desde Servicio de Compras)

     # noqa: E501

    :param id_festival: 
    :type id_festival: str
    :param bloqueo_cupo_request: 
    :type bloqueo_cupo_request: dict | bytes

    :rtype: Union[BloqueoCupoResponse, Tuple[BloqueoCupoResponse, int], Tuple[BloqueoCupoResponse, int, Dict[str, str]]
    """
    bloqueo_cupo_request = body
    if flask.request.is_json:
        bloqueo_cupo_request = BloqueoCupoRequest.from_dict(flask.request.get_json())  # noqa: E501
    return 'do some magic!'


def festivales_id_festival_entradas_get(id_festival):  # noqa: E501
    """Consultar tarifas y disponibilidad de entradas

     # noqa: E501

    :param id_festival: 
    :type id_festival: str

    :rtype: Union[List[TipoEntrada], Tuple[List[TipoEntrada], int], Tuple[List[TipoEntrada], int, Dict[str, str]]
    """
    return 'do some magic!'


def festivales_id_festival_entradas_liberar_post(id_festival, body):  # noqa: E501
    """Liberar cupo bloqueado tras expiración o fallo de pago

     # noqa: E501

    :param id_festival: 
    :type id_festival: str
    :param bloqueo_cupo_request: 
    :type bloqueo_cupo_request: dict | bytes

    :rtype: Union[None, Tuple[None, int], Tuple[None, int, Dict[str, str]]
    """
    bloqueo_cupo_request = body
    if flask.request.is_json:
        bloqueo_cupo_request = BloqueoCupoRequest.from_dict(flask.request.get_json())  # noqa: E501
    return 'do some magic!'
