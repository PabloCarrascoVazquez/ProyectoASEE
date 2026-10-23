import unittest

from flask import json

from openapi_server.models.artista_favorito_request import ArtistaFavoritoRequest  # noqa: E501
from openapi_server.models.artista_favorito_response import ArtistaFavoritoResponse  # noqa: E501
from openapi_server.models.error import Error  # noqa: E501
from openapi_server.test import BaseTestCase


class TestCatlogoArtistasController(BaseTestCase):
    """CatlogoArtistasController integration test stubs"""

    def test_artistas_favoritos_post(self):
        """Test case for artistas_favoritos_post

        Guardar artista favorito
        """
        artista_favorito_request = {"id_festival":"fest_subsonic_2026","nombre_artista":"Peggy Gou"}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/artistas-favoritos',
            method='POST',
            headers=headers,
            data=json.dumps(artista_favorito_request),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
