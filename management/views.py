from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError, transaction
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
import json
from django.http import JsonResponse
from django.template.loader import render_to_string

from .models import Topic, Subtopic, Question, QuestionType, Choice, Explanation
from .forms import AddTopicForm, DeleteTopicForm, AddSubtopicForm, DeleteSubtopicForm, RenameTopicForm
from .forms import RenameSubtopicForm, AddQuestionForm, AddChoiceForm, EditQuestionForm

def management_portal(request): 
    # load topics for sidebar
    topics = Topic.objects.all()
    return render(request, 'management/layout.html', {
        'topics' : topics    
    })

@login_required(login_url='login')
def subtopics_for_topic(request, topic_id):
    '''
    Retrieves subtopics for the chosen topic.
    Also returns the number of questions for the subtopic.
    Used for dynamic loading in the sidebar.
    '''
    topic = get_object_or_404(Topic, id=topic_id)
    subtopics = topic.subtopics.filter(is_visible=True)
    if subtopics:
        subtopic_data = []
        for subtopic in subtopics:
            question_count = subtopic.questions.count()
            subtopic_data.append({
                'id': subtopic.id,
                'name': subtopic.name,
                'question_count': question_count
            })

        return JsonResponse({'success' : True, 'subtopics' : subtopic_data})
    else:
        return JsonResponse({"success": False,  
                "messages": [{"message": "Subtopic retrieval failed.", "tags": "danger"}]})

@login_required(login_url='login')  
def add_topic(request):
    if request.method == 'GET':
        add_topic_form = AddTopicForm()
        # load topics for sidebar
        topics = Topic.objects.all()
        return render(request, 'management/add_topic.html', { 
            'add_topic_form' : add_topic_form,
            'topics' : topics,
        })

    elif request.method == 'POST':
        data = json.loads(request.body)
        name = data.get("name", "").strip().title()

        if not name:
            return JsonResponse({"success": False,  
                "messages": [{"message": "Please enter a valid topic name.", "tags": "danger"}]})
               
        try:
            topic = Topic(name = name, created_by = request.user)
            topic.save()
            
        except IntegrityError as e:
            # topic name + slug must be unique
            if 'name' or 'slug' in str(e):
                return JsonResponse({"success": False, 
                    "messages": [{"message": "A topic with this name already exists. Please choose a different name.", "tags": "danger"}]})
            else:
                return JsonResponse({"success": False,  
                    "messages": [{"message": "An error occurred while saving the topic. Please try again.", "tags": "danger"}]})
            
       
        return JsonResponse({"success": True, "topic_id" : topic.id, "topic_name": topic.name,
            "messages": [{"message": f"{name} has been successfully added.", "tags": "success"}]})

@login_required(login_url='login')  
def rename_topic(request):
    if request.method == 'GET':
        rename_topic_form = RenameTopicForm()
         # load topics for sidebar
        topics = Topic.objects.all()
        return render(request, 'management/rename_topic.html', { 
            'rename_topic_form' : rename_topic_form,
            'topics' : topics,
        })
    
    elif request.method == 'PUT':
        data = json.loads(request.body)
        topic_id = data.get("old_topic_id")
        new_topic_name = data.get("new_topic_name", "").strip().title()

        if not new_topic_name:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Please enter a valid topic name.", "tags": "danger"}]}, status=400)   
       
        # create a Topic instance
        try:
            topic = Topic.objects.get(pk=topic_id)
            old_topic_name = topic.name
        except Topic.DoesNotExist:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Invalid topic selected.", "tags": "danger"}]}, status=400)
        
        # Check if the new name is the same as the old name
        if new_topic_name == old_topic_name:
            return JsonResponse({"success": False,
                                 "messages": [{"message": "The new topic name must be different from the current topic name.", 
                                               "tags": "danger"}]}, status=400)
        
        # update topic name, modified_by in Topic model
        try:
            topic.name = new_topic_name
            topic.modified_by = request.user
            topic.save()
        except Exception as e:
            return JsonResponse({"success": False, 
                "messages": [{"message": f"An error occurred: {str(e)}", "tags": "danger"}]}, status=500)
                
        return JsonResponse({"success": True, "renamed_topic": new_topic_name, "topic_id": topic_id,
            "messages": [{"message": f"{old_topic_name} has been renamed to {new_topic_name}.", "tags": "success"}]})

 
@login_required(login_url='login')
def delete_topic_form(request):
    if request.method == 'GET':
        delete_topic_form = DeleteTopicForm()
        # load topics for sidebar
        topics = Topic.objects.all()
        return render(request, 'management/delete_topic_form.html', { 
            'delete_topic_form' : delete_topic_form,
            'topics' : topics,
        })
    
@login_required(login_url='login')
def delete_topic_confirmation(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    
    return render(request, 'management/delete_topic_confirm.html', {
        'topic': topic,
        'topic_id': topic_id
    })

@login_required(login_url='login')
def delete_topic_cancel(request):
    messages.info(request, "Topic deletion cancelled")
    return redirect('delete_topic_form')
   
@login_required(login_url='login')
def delete_topic(request, topic_id):
    
    if request.method == 'POST':
        topic = get_object_or_404(Topic, pk=topic_id)
            
        try:
            topic.delete()                
            
            messages.success(request, f"{topic} has been successfully deleted.")
            return redirect('delete_topic_form')
        
        except Exception as e:
            
            messages.error(request, "An error occurred while deleting this topic.")
            return redirect('delete_topic_form')
        
    else:
        # Handle non-POST requests 
        messages.error(request, "Invalid request method for deleting a topic.")
        return redirect('delete_topic_form')  
    
@login_required(login_url='login')  
def get_topics(request):
    topics = Topic.objects.all().values('id', 'name')
    if topics:
        return JsonResponse({'success': True, 'topics': list(topics)}, safe=False)
    else:
        return JsonResponse({"success": False,  
                "messages": [{"message": "An error occurred while retrieving topics.", "tags": "info"}]}, status=500)
    
@login_required(login_url='login')  
def add_subtopic(request):
    if request.method == 'GET':
        add_subtopic_form = AddSubtopicForm()
         # load topics for sidebar
        topics = Topic.objects.all()
        return render(request, 'management/add_subtopic.html', { 
            'add_subtopic_form' : add_subtopic_form,
            'topics' : topics,
        })
    
    elif request.method == 'POST':
        data = json.loads(request.body)
        topic_id = int(data.get("topic", ""))
        name = data.get("name", "").strip().title()

        if not name:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Please enter a valid subtopic name.", "tags": "danger"}]}, status=400)

        # Get the Topic using the provided id
        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Invalid topic selected.", "tags": "danger"}]}, status=400)
        
        if Subtopic.objects.filter(topic=topic, name=name).exists():
            return JsonResponse({"success": False, 
                "messages": [{"message": "This topic/subtopic combination already exists. Please choose a different subtopic name.", "tags": "danger"}]}, status=400)
        
        try:
            subtopic = Subtopic(topic=topic, name=name, created_by=request.user)
            subtopic.save()
            return JsonResponse({"success": True, "subtopic_id": subtopic.id, "subtopic_name": subtopic.name, "topic_id": topic_id,
                "messages": [{"message": f"{name} has been successfully added as a subtopic of {topic}.", "tags": "success"}]})
            
        except IntegrityError:
            return JsonResponse({"success": False,  
                "messages": [{"message": "An error occurred while saving this subtopic. Please try again.", "tags": "danger"}]}, status=500)
        
@login_required(login_url='login')  
def rename_subtopic(request):
    if request.method == 'GET':
        rename_subtopic_form = RenameSubtopicForm()
         # load topics for sidebar
        topics = Topic.objects.all()
        return render(request, 'management/rename_subtopic.html', { 
            'rename_subtopic_form' : rename_subtopic_form,
            'topics' : topics,
        })
    
    elif request.method == 'PUT':
        data = json.loads(request.body)
        subtopic_id = data.get("subtopic_id")
        new_subtopic_name = data.get("new_subtopic_name", "").strip().title()

        if not new_subtopic_name:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Please enter a valid subtopic name.", "tags": "danger"}]}, status=400)


        # create a Subtopic instance
        try:
            subtopic = Subtopic.objects.get(pk=subtopic_id)
            old_subtopic_name = subtopic.name
        except Subtopic.DoesNotExist:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Invalid subtopic selected.", "tags": "danger"}]}, status=400)
        
        # Check if the new name is the same as the old name
        if new_subtopic_name == old_subtopic_name:
            return JsonResponse({"success": False,
                                 "messages": [{"message": "The new subtopic name must be different from the current subtopic name.", 
                                               "tags": "danger"}]}, status=400)
        
        # update subtopic name, modified by in Subtopic model
        try:
            subtopic.name = new_subtopic_name
            subtopic.modified_by = request.user
            subtopic.save()
        except Exception as e:
            return JsonResponse({"success": False, 
                "messages": [{"message": f"An error occurred: {str(e)}", "tags": "danger"}]}, status=500)
                
        return JsonResponse({"success": True, "subtopic_id" : subtopic_id, "new_subtopic_name" : new_subtopic_name,
            "messages": [{"message": f"{old_subtopic_name} has been renamed to {new_subtopic_name}.", 
                          "tags": "success"}]})
        
@login_required(login_url='login')  
def delete_subtopic_form(request):
    if request.method == 'GET':
        delete_subtopic_form = DeleteSubtopicForm()
         # load topics for sidebar
        topics = Topic.objects.all()
        return render(request, 'management/delete_subtopic_form.html', { 
            'delete_subtopic_form' : delete_subtopic_form,
            'topics' : topics,
        })
    
@login_required(login_url='login')  
def get_subtopics(request, topic_id):
    subtopics = Subtopic.objects.filter(topic_id=topic_id).values('id', 'name')
    if subtopics:
        return JsonResponse({'success': True, 'subtopics': list(subtopics)}, safe=False)
    else:
        return JsonResponse({"success": False,  
                "messages": [{"message": "An error occurred while retrieving subtopics.", "tags": "info"}]}, status=500)
    
@login_required(login_url='login')
def delete_subtopic_confirmation(request, topic_id, subtopic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    subtopic = get_object_or_404(Subtopic, id=subtopic_id)
    
    return render(request, 'management/delete_subtopic_confirmation.html', {
        'subtopic': subtopic,
        'subtopic_id': subtopic_id,
        'topic_id' : topic_id,
        'topic' : topic
    })

@login_required(login_url='login')
def delete_subtopic_cancel(request):
    messages.info(request, "Subtopic deletion cancelled")
    return redirect('delete_subtopic_form')

@login_required(login_url='login')
def delete_subtopic(request, subtopic_id):
    if request.method == 'POST':
        subtopic = get_object_or_404(Subtopic, pk=subtopic_id)

        # clear old messages
        storage = messages.get_messages(request)
        storage.used = True
            
        try:
            subtopic.delete()                
            
            messages.success(request, f"{subtopic} has been successfully deleted.")
            return redirect('delete_subtopic_form')
        
        except Exception as e:
            
            messages.error(request, "An error occurred while deleting this subtopic.")
            return redirect('delete_subtopic_form')
        
    else:
        # Handle non-POST requests 
        messages.error(request, "Invalid request method for deleting a subtopic.")
        return redirect('delete_subtopic_form')
    
@login_required(login_url='login')
def add_question_and_choices(request):
    if request.method == 'GET':
        add_question_form = AddQuestionForm()

        # Initially,  4 choice forms are loaded. More can be loaded dynamically
        add_choice_forms = [AddChoiceForm(prefix=str(i)) for i in range(4)]  
        
        # load topics for sidebar
        topics = Topic.objects.all()
        
        return render(request, 'management/add_question_and_choices.html', { 
            'add_question_form' : add_question_form,
            'add_choice_forms' : add_choice_forms,
            'topics' : topics,
        })
    elif request.method == 'POST':
        data = json.loads(request.body)
        topic_id = int(data.get("topic_id", ""))
        subtopic_id = int(data.get("subtopic_id", ""))
        question_type_id = int(data.get("question_type", ""))
        question_text = data.get("question_text", "").strip()
        choice_forms = data.get("choices", [])       

        # Make sure the subtopic exists
        try:
            subtopic = Subtopic.objects.get(id=subtopic_id)
        except Subtopic.DoesNotExist:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Invalid subtopic selected.", "tags": "danger"}]}, status=400)
        
        # Make sure the question type exists
        try:
            question_type = QuestionType.objects.get(id=question_type_id)
            question_type_name = question_type.name

        except QuestionType.DoesNotExist:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Invalid question type selected.", "tags": "danger"}]}, status=400)
        
        # Subtopic/question text must be unique
        if Question.objects.filter(subtopic=subtopic, text=question_text).exists():
            return JsonResponse({"success": False, 
                "messages": [{"message": "This subtopic/question combination already exists.", "tags": "danger"}]}, status=400)

        # Question can't be blank. Also must have a minimun length of 10
        if not question_text:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Please enter a question.", "tags": "danger"}]}, status=400)
        
        if len(question_text) < 10:
            return JsonResponse({"success": False, 
                "messages": [{"message": "This question is too short. Please provide more details.", "tags": "danger"}]}, status=400)
        
        # validate the choice forms           

        # every question type must have at least 2 choices
        if len(choice_forms) < 2:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Every question requires two or more answer choices", "tags": "danger"}]},
                 status=400)
        
        # True/False questions can only have 2 answer choices
        if question_type_name == 'True/False' and len(choice_forms) != 2:
            return JsonResponse({"success": False, 
                "messages": [{"message": "True/False questions require 2 answer choices", "tags": "danger"}]},
                 status=400)
        
        # Other question types must have at least 4 answer choices
        if not question_type_name == 'True/False' and len(choice_forms) < 4:
            return JsonResponse({"success": False, 
                "messages": [{"message": f"{question_type_name} questions require 4 or more answer choices", "tags": "danger"}]},
                 status=400)
        
                
        # create a list of answer choices
        choice_texts = [choice_form['text'] for choice_form in choice_forms]

        # answer choices can't be blank
        if any(len(choice_text.strip()) == 0 for choice_text in choice_texts):
            return JsonResponse({"success": False, 
                "messages": [{"message": "Answer choices cannot be empty.", "tags": "danger"}]},
                status=400)

        # each answer choice must be unique
        # Get the choice text from each choice form
        if len(choice_texts) != len(set(choice_texts)): # sets don't have duplicate members
            return JsonResponse({"success": False, 
                "messages": [{"message": "Duplicate answer choices are not allowed.", "tags": "danger"}]},
                 status=400)
        
        # each answer choice must be <= 75 characters
        choice_text_length = [choice_text for choice_text in choice_texts if len(choice_text.strip()) > 75]
        
        if choice_text_length:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Answer choices must 75 characters or less.", "tags": "danger"}]},
                 status=400)
        
        # validate the is_correct field        
        choice_answers = [choice_form['is_correct'] for choice_form in choice_forms]
        
        # Each question must have at least one correct answer
        if choice_answers.count(False) == len(choice_answers):
            return JsonResponse({"success": False, 
                "messages": [{"message": "You haven't chosen a correct answer.", "tags": "danger"}]},
                 status=400)     
        
        # True/False and multiple choice questions can have only one correct answer checked
        if question_type_name == 'True/False' or question_type_name == 'Multiple Choice':
            if choice_answers.count(True) != 1:
                return JsonResponse({"success": False, 
                    "messages": [{"message": f"{question_type_name} questions can only have one correct answer.", "tags": "danger"}]},
                    status=400) 
            
        # Multiple answer questions must have at least 2 correct answers
        if question_type_name == 'Multiple Answer' and choice_answers.count(True) < 2:
            return JsonResponse({"success": False, 
                    "messages": [{"message": f"{question_type_name} questions must have at least two correct answers.", "tags": "danger"}]},
                    status=400)
        
        # after form validation save the data                
        
        try:
            with transaction.atomic():  # if any save operation fails, the database will be rolled back 
            # save the question
                question = Question(subtopic=subtopic, text=question_text, question_type=question_type,
                                    created_by=request.user, modified_by=request.user)
                question.save()

            # save the answer choices
            for choice_form in choice_forms:
                choice = Choice(question=question, text=choice_form['text'], is_correct=choice_form['is_correct'],
                                created_by=request.user, modified_by=request.user)
                choice.save()
                       
        except IntegrityError:
            return JsonResponse({"success": False,  
                "messages": [{"message": "An error occurred while saving this form. Please try again.", "tags": "danger"}]},
                    status=500)
        
        except Exception as e:
            return JsonResponse({"success": False, "messages": [{"message": f"An unexpected error occurred: {str(e)}", "tags": "danger"}]},
                    status=500)
               
        # initialize blank choice forms on form reload
        add_choice_forms = [AddChoiceForm(prefix=str(i)) for i in range(4)]
        add_choice_forms_html = [render_to_string('management/add_choice_form_snippet.html', {'add_choice_form': add_choice_form, 'index': i}) 
                                for i, add_choice_form in enumerate(add_choice_forms)]
              
        return JsonResponse({"success": True, "topic_id": topic_id, "subtopic_id": subtopic_id,
                "question_type_id": question_type_id, "question_type_name": question_type_name, "add_choice_forms": add_choice_forms_html,
                "messages": [{"message": "Question and answer choices have been successfully added.", "tags": "success"}]})

def add_question_and_choices_dynamically(request):
    '''
        This function is called dynamically from the sidebar menu and
        returns the AddQuestionForm and 4 AddChoiceForms
    '''
    if request.method == 'GET':
        add_question_form = AddQuestionForm()

        # Initially,  4 choice forms are loaded. 
        add_choice_forms = [AddChoiceForm(prefix=str(i)) for i in range(4)] 

        context = {
        'add_question_form': add_question_form,
        'add_choice_forms': add_choice_forms,
        }
        
        add_question_and_choices_form_html = render_to_string('management/add_question_and_choices_snippet.html', context, request=request)
        return JsonResponse({"success": True, 
                             'add_question_and_choices_form_html': add_question_and_choices_form_html})
                        
           
def get_question_type_name(request, pk):
    '''
    takes in the question type id from the dropdown menu and returns the question type name
    '''
    try:
        question_type = QuestionType.objects.get(pk=pk)
        return JsonResponse({"success": True, 'name': question_type.name})
    except QuestionType.DoesNotExist:
        return JsonResponse({"success": False,  
                "messages": [{"message": "Question Type not found.", "tags": "danger"}]}, status=404 )

@login_required(login_url='login')    
def get_question_to_edit(request):
    
    if request.method == 'GET':
        edit_question_form = EditQuestionForm()
         # load topics for sidebar
        topics = Topic.objects.all()
        return render(request, 'management/edit_question.html', { 
            'edit_question_form' : edit_question_form,
            'topics' : topics,
        })
    
@login_required(login_url='login')
def load_questions(request, subtopic_id):
    '''
    This function takes in a subtopic id and returns all the questions for this subtopic.
    The response object will be returned to the Javascript function loadQuestionsToEdit.
    '''
    questions = Question.objects.filter(subtopic_id=subtopic_id).values('id', 'text', 'question_type')

    if questions:
        return JsonResponse({"success": True, "questions": list(questions)}, safe=False)
    else:
        return JsonResponse({"success": False,
                "messages": [{"message": "An error occurred while retrieving questions.", "tags": "info"}]})
    



            

     
            



