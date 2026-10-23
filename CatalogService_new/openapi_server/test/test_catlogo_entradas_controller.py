import unittest

from flask import json

from openapi_server.models.bloqueo_cupo_request import BloqueoCupoRequest  # noqa: E501
from openapi_server.models.bloqueo_cupo_response import BloqueoCupoResponse  # noqa: E501
from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.tipo_entrada import TipoEntrada  # noqa: E501
from openapi_server.test import BaseTestCase


class TestCatlogoEntradasController(BaseTestCase):
    """CatlogoEntradasController integration test stubs"""

    def test_festivales_id_festival_entradas_bloquear_post(self):
        """Test case for festivales_id_festival_entradas_bloquear_post

        Bloqueo temporal de cupo (Llamada interna desde Servicio de Compras)
        """
        bloqueo_cupo_request = {"tipo_entrada":"weekend","cantidad":1}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/festivales/{id_festival}/entradas/bloquear'.format(id_festival='id_festival_example'),
            method='POST',
            headers=headers,
            data=json.dumps(bloqueo_cupo_request),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_festivales_id_festival_entradas_get(self):
        """Test case for festivales_id_festival_entradas_get

        Consultar tarifas y disponibilidad de entradas
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/festivales/{id_festival}/entradas'.format(id_festival='fest_subsonic_2026'),
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_festivales_id_festival_entradas_liberar_post(self):
        """Test case for festivales_id_festival_entradas_liberar_post

        Liberar cupo bloqueado tras expiración o fallo de pago
        """
        bloqueo_cupo_request = {"tipo_entrada":"weekend","cantidad":1}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/festivales/{id_festival}/entradas/liberar'.format(id_festival='id_festival_example'),
            method='POST',
            headers=headers,
            data=json.dumps(bloqueo_cupo_request),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
