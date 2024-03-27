from django.urls import path
from . import views 

urlpatterns = [
    path("", views.management_portal, name="management_portal"),
    path("add_topic", views.add_topic, name="add_topic"),
    path("add_subtopic", views.add_subtopic, name="add_subtopic"),
    
]