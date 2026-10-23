import flask
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.festival import Festival  # noqa: E501
from openapi_server import util


def festivales_get():  # noqa: E501
    """Listar festivales y su escaleta

     # noqa: E501


    :rtype: Union[List[Festival], Tuple[List[Festival], int], Tuple[List[Festival], int, Dict[str, str]]
    """
    return 'do some magic!'
