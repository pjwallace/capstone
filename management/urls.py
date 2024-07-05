from django.urls import path
from . import views 

urlpatterns = [
    path("", views.management_portal, name="management_portal"),
    path("subtopics_for_topic/<int:topic_id>", views.subtopics_for_topic, name="subtopics_for_topic"),
    path("add_topic", views.add_topic, name="add_topic"),
    path("rename_topic", views.rename_topic, name="rename_topic"),
    path("get_topics", views.get_topics, name="get_topics"),
    path("delete_topic_form", views.delete_topic_form, name="delete_topic_form"),
    path("delete_topic/<int:topic_id>", views.delete_topic, name="delete_topic"),
    path("delete_topic_confirmation/<int:topic_id>", views.delete_topic_confirmation, 
         name="delete_topic_confirmation"),
    path("delete_topic_cancel", views.delete_topic_cancel, name="delete_topic_cancel"),
    path("add_subtopic", views.add_subtopic, name="add_subtopic"),
    path("rename_subtopic", views.rename_subtopic, name="rename_subtopic"),
    path("delete_subtopic_form", views.delete_subtopic_form, name="delete_subtopic_form"),
    path("get_subtopics/<int:topic_id>", views.get_subtopics, name="get_subtopics"),
    path("delete_subtopic/<int:subtopic_id>", views.delete_subtopic, name="delete_subtopic"),
    path("delete_subtopic_confirmation/<int:topic_id>/<int:subtopic_id>", views.delete_subtopic_confirmation, 
         name="delete_subtopic_confirmation"),
    path("delete_subtopic_cancel", views.delete_subtopic_cancel, name="delete_subtopic_cancel"),
    path("add_question_and_choices", views.add_question_and_choices, name="add_question_and_choices"),
    path("add_question_and_choices_dynamically", views.add_question_and_choices_dynamically, 
         name="add_question_and_choices_dynamically"),
    path("get_question_type_name/<int:pk>", views.get_question_type_name, name="get_question_type_name"),
    path("get_question_to_edit", views.get_question_to_edit, name="get_question_to_edit"),
    path("load_questions/<int:subtopic_id>", views.load_questions, name="load_questions"),
    path("get_all_questions_to_edit", views.get_all_questions_to_edit, name="get_all_questions_to_edit"),
    path("load_question_to_edit/<int:question_id>", views.load_question_to_edit, name="load_question_to_edit"),
]