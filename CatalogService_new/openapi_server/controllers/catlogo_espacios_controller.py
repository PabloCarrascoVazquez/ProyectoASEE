import flask
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.alquiler_request import AlquilerRequest  # noqa: E501
from openapi_server.models.alquiler_response import AlquilerResponse  # noqa: E501
from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.espacio import Espacio  # noqa: E501
from openapi_server import util


def espacios_id_alquileres_post(id, body):  # noqa: E501
    """Solicitar alquiler de parcela por un proveedor

     # noqa: E501

    :param id: ID del espacio/parcela a alquilar.
    :type id: str
    :type id: str
    :param alquiler_request: 
    :type alquiler_request: dict | bytes

    :rtype: Union[AlquilerResponse, Tuple[AlquilerResponse, int], Tuple[AlquilerResponse, int, Dict[str, str]]
    """
    alquiler_request = body
    if flask.request.is_json:
        alquiler_request = AlquilerRequest.from_dict(flask.request.get_json())  # noqa: E501
    return 'do some magic!'


def festivales_id_festival_espacios_get(id_festival):  # noqa: E501
    """Listar parcelas y mapa del recinto de un festival

     # noqa: E501

    :param id_festival: 
    :type id_festival: str

    :rtype: Union[List[Espacio], Tuple[List[Espacio], int], Tuple[List[Espacio], int, Dict[str, str]]
    """
    return 'do some magic!'
