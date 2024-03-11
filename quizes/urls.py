from django.urls import path
from quizes import views

urlpatterns = [
    path("quizes/", views.home, name="home"),
    
]