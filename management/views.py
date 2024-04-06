from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
import json
from django.http import JsonResponse
from django.template.loader import render_to_string

from .models import Topic, Subtopic
from .forms import AddTopicForm, DeleteTopicForm, AddSubtopicForm

def management_portal(request): 
    return render(request, 'management/layout.html')

@login_required(login_url='login')  
def add_topic(request):
    if request.method == 'GET':
        add_topic_form = AddTopicForm()
        return render(request, 'management/add_topic.html', { 
            'add_topic_form' : add_topic_form,
        })

    elif request.method == 'POST':
        data = json.loads(request.body)
        name = data.get("name", "").strip().title()
               
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
            
       
        return JsonResponse({"success": True, 
            "messages": [{"message": f"{name} has been successfully added.", "tags": "success"}]})
    
@login_required(login_url='login')
def delete_topic_form(request):
    if request.method == 'GET':
        delete_topic_form = DeleteTopicForm()
        return render(request, 'management/delete_topic_form.html', { 
            'delete_topic_form' : delete_topic_form,
        })
    
@login_required(login_url='login')
def delete_topic(request, topic_id):
    print(topic_id)
    try:
        topic = Topic.objects.get(pk=topic_id)
    except Topic.DoesNotExist:
        return JsonResponse({"success": False, 
            "messages": [{"message": "Topic not found.", "tags": "danger"}]}, status=400)
        
    if request.method == 'DELETE':
        try:
            topic.delete()                
            return JsonResponse({"success": True, 
                "messages": [{"message": f"{topic} has been successfully deleted.", "tags": "success"}]},
                status=200)
        
        except Exception as e:
            # Catch any other exceptions and return a generic error response
            return JsonResponse({"success": False,  
                "messages": [{"message": "An error occurred while deleting this topic.", "tags": "danger"}]},
                status=500)

    
@login_required(login_url='login')  
def add_subtopic(request):
    if request.method == 'GET':
        add_subtopic_form = AddSubtopicForm()
        return render(request, 'management/add_subtopic.html', { 
            'add_subtopic_form' : add_subtopic_form,
        })
    
    elif request.method == 'POST':
        data = json.loads(request.body)
        topic_id = int(data.get("topic", ""))
        name = data.get("name", "").strip().title()

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
            return JsonResponse({"success": True, 
                "messages": [{"message": f"{name} has been successfully added.", "tags": "success"}]})
            
        except IntegrityError:
            return JsonResponse({"success": False,  
                "messages": [{"message": "An error occurred while saving this subtopic. Please try again.", "tags": "danger"}]}, status=500)

     
            



