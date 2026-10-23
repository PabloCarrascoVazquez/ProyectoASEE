import unittest

from flask import json

from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.festival import Festival  # noqa: E501
from openapi_server.test import BaseTestCase


class TestCatlogoEventosController(BaseTestCase):
    """CatlogoEventosController integration test stubs"""

    def test_festivales_get(self):
        """Test case for festivales_get

        Listar festivales y su escaleta
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/festivales',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
