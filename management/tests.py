from django.test import TestCase, Client
from django.template.defaultfilters import slugify
from django.contrib.auth.models import User
from .models import Topic, Subtopic

"""
    Basic approach to writing tests:
        1. Setup code
        2.  Logic to test
        3.  Assertions
"""

class TestModels(TestCase):
    def setUp(self):
        """
        Set up before each test
        """
        self.user = User.objects.create_user(username='testuser', password='password')

    def test_model_Topic(self):
        #created_by = User.objects.create_user(username='testuser1', password='password')

        topic1 = Topic.objects.create(
            name = 'Test Topic1',


        )

        self.assertEqual(str(topic1), 'Test Topic1')
        self.assertTrue(isinstance(topic1, Topic))
        self.assertTrue(topic1.slug, slugify(topic1.name))

