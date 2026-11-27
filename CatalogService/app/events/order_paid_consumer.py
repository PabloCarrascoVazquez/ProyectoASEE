import json
import os
import time
import logging
import threading
import pika
from app.daos.factories import DAOFactory

logger = logging.getLogger(__name__)


def _procesar_mensaje(ch, method, properties, body):
    try:
        payload = json.loads(body.decode("utf-8"))
        # Jackson2JsonMessageConverter serializa el String JSON como cadena JSON
        if isinstance(payload, str):
            payload = json.loads(payload)

        tickets = payload.get("tickets", [])
        if tickets:
            dao = DAOFactory.get_catalog_dao()
            for item in tickets:
                id_festival = item.get("festival_id") or item.get("item_id")
                tipo_entrada = item.get("ticket_type") or "day"
                cantidad = int(item.get("quantity", 1))

                ok = dao.confirmar_cupo(id_festival, tipo_entrada, cantidad)
                logger.info(
                    "Ticket pagado consolidado en MongoDB -> festival=%s, tipo=%s, cant=%s, ok=%s",
                    id_festival, tipo_entrada, cantidad, ok
                )

        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as err:
        logger.error("Error procesando evento de pago en CatalogService: %s", err)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def _consumir_bucle():
    exchange_name = os.getenv("RABBITMQ_EXCHANGE", "subsonic.purchases.exchange")
    exchange_type = os.getenv("RABBITMQ_EXCHANGE_TYPE", "topic")
    routing_key = os.getenv("TICKET_PAID_ROUTING_KEY", "order.ticket")
    queue_name = os.getenv("CATALOG_TICKET_QUEUE", "catalog.ticket_paid.queue")

    while True:
        try:
            credentials = pika.PlainCredentials(
                os.getenv("RABBITMQ_USERNAME", "guest"),
                os.getenv("RABBITMQ_PASSWORD", "guest"),
            )
            params = pika.ConnectionParameters(
                host=os.getenv("RABBITMQ_HOST", "rabbitmq"),
                port=int(os.getenv("RABBITMQ_PORT", 5672)),
                credentials=credentials,
                heartbeat=60,
            )

            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            channel.exchange_declare(exchange=exchange_name, exchange_type=exchange_type, durable=True)
            channel.queue_declare(queue=queue_name, durable=True)
            channel.queue_bind(exchange=exchange_name, queue=queue_name, routing_key=routing_key)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=queue_name, on_message_callback=_procesar_mensaje)

            logger.info(
                "CatalogService escuchando exchange='%s' (routing_key='%s') en cola='%s'",
                exchange_name, routing_key, queue_name
            )
            channel.start_consuming()
        except Exception as err:
            logger.warning("Reintentando conexión RabbitMQ en CatalogService en 5s: %s", err)
            time.sleep(5)


def start_order_paid_consumer():
    if os.getenv("TESTING") == "True":
        return
    hilo = threading.Thread(target=_consumir_bucle, name="OrderPaidConsumer", daemon=True)
    hilo.start()