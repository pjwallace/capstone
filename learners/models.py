from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Profile(models.Model):
    name = models.OneToOneField(User, to_field='username', on_delete=models.CASCADE)
    nickname = models.CharField(max_length=50, blank=True, null=True)
    pg_level = models.CharField(max_length =10, blank=True, null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
