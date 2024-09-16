from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("get_subtopics_for_quiz/<int:topic_id>", views.get_subtopics_for_quiz, name="get_subtopics_for_quiz"),
]