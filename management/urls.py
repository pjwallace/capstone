from django.urls import path
from . import views 

urlpatterns = [
    path("", views.management_portal, name="management_portal"),
    path("add_topic", views.add_topic, name="add_topic"),
    path("delete_topic_form", views.delete_topic_form, name="delete_topic_form"),
    path("delete_topic/<int:topic_id>", views.delete_topic, name="delete_topic"),
    path("delete_topic_confirmation/<int:topic_id>", views.delete_topic_confirmation, 
         name="delete_topic_confirmation"),
    path("delete_topic_cancel", views.delete_topic_cancel, name="delete_topic_cancel"),
    path("add_subtopic", views.add_subtopic, name="add_subtopic"),
    
]