from django.urls import path
from . import views 

urlpatterns = [
    path("", views.management_portal, name="management_portal"),
    
]