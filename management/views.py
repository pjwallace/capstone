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
from .forms import AddTopicForm, AddSubtopicForm

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
        name = data.get("name", "").title()

        if not name:  # name can't be blank
            return JsonResponse({"error": "Name is required"}, status=400)
        
        try:
            topic = Topic(name = name, created_by = request.user)
            topic.save()
            #messages.success(request, f'{name} has been successfully added to the Topics database.')

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
def add_subtopic(request):
    if request.method == 'GET':
        add_subtopic_form = AddSubtopicForm()
        return render(request, 'management/add_subtopic.html', { 
            'add_subtopic_form' : add_subtopic_form,
        })
    
    elif request.method == 'POST':
        data = json.loads(request.body)
        topic = data.get("topic", "")
        name = data.get("name", "").title()
     
            



