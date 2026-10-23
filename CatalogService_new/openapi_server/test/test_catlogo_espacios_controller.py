import unittest

from flask import json

from openapi_server.models.alquiler_request import AlquilerRequest  # noqa: E501
from openapi_server.models.alquiler_response import AlquilerResponse  # noqa: E501
from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.espacio import Espacio  # noqa: E501
from openapi_server.test import BaseTestCase


class TestCatlogoEspaciosController(BaseTestCase):
    """CatlogoEspaciosController integration test stubs"""

    def test_espacios_id_alquileres_post(self):
        """Test case for espacios_id_alquileres_post

        Solicitar alquiler de parcela por un proveedor
        """
        alquiler_request = {"nombre_negocio":"Burger King Foodtruck","tipo_negocio":"Restauración","necesita_conexion_electrica":True}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/espacios/{id}/alquileres'.format(id=UUID('38400000-8cf0-11bd-b23e-10b96e4ef00d')),
            method='POST',
            headers=headers,
            data=json.dumps(alquiler_request),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_festivales_id_festival_espacios_get(self):
        """Test case for festivales_id_festival_espacios_get

        Listar parcelas y mapa del recinto de un festival
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/festivales/{id_festival}/espacios'.format(id_festival='fest_subsonic_2026'),
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
