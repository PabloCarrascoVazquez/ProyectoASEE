import flask
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.artista_favorito_request import ArtistaFavoritoRequest  # noqa: E501
from openapi_server.models.artista_favorito_response import ArtistaFavoritoResponse  # noqa: E501
from openapi_server.models.error import Error  # noqa: E501
from openapi_server import util


def artistas_favoritos_post(body):  # noqa: E501
    """Guardar artista favorito

     # noqa: E501

    :param artista_favorito_request: 
    :type artista_favorito_request: dict | bytes

    :rtype: Union[ArtistaFavoritoResponse, Tuple[ArtistaFavoritoResponse, int], Tuple[ArtistaFavoritoResponse, int, Dict[str, str]]
    """
    artista_favorito_request = body
    if flask.request.is_json:
        artista_favorito_request = ArtistaFavoritoRequest.from_dict(flask.request.get_json())  # noqa: E501
    return 'do some magic!'
