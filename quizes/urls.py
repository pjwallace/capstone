from django.urls import path
from . import views

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("get_subtopics_for_quiz/<int:topic_id>", views.get_subtopics_for_quiz, name="get_subtopics_for_quiz"),
    path("get_progress_data/<int:subtopic_id>", views.get_progress_data, name="get_progress_data"),
]