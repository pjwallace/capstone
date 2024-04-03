from django.urls import path
from . import views 

urlpatterns = [
    path("", views.management_portal, name="management_portal"),
    path("add_topic", views.add_topic, name="add_topic"),
    path("delete_topic_form", views.delete_topic_form, name="delete_topic_form"),
    path("delete_topic", views.delete_topic, name="delete_topic"),
    path("add_subtopic", views.add_subtopic, name="add_subtopic"),
    
]