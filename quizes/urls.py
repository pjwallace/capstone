from django.urls import path
from . import views

urlpatterns = [
    path("", views.quizes_home, name="quizes_home"),
    
]