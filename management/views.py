from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
import json
from django.http import JsonResponse

from .models import Topic, Subtopic
from .forms import AddTopicForm, DeleteTopicForm, AddSubtopicForm, DeleteSubtopicForm, RenameTopicForm
from .forms import RenameSubtopicForm

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
            
       
        return JsonResponse({"success": True, 
            "messages": [{"message": f"{name} has been successfully added.", "tags": "success"}]})

@login_required(login_url='login')  
def rename_topic(request):
    if request.method == 'GET':
        rename_topic_form = RenameTopicForm()
        return render(request, 'management/rename_topic.html', { 
            'rename_topic_form' : rename_topic_form,
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
                
        return JsonResponse({"success": True, 
            "messages": [{"message": f"{old_topic_name} has been renamed to {new_topic_name}.", "tags": "success"}]})

 
@login_required(login_url='login')
def delete_topic_form(request):
    if request.method == 'GET':
        delete_topic_form = DeleteTopicForm()
        return render(request, 'management/delete_topic_form.html', { 
            'delete_topic_form' : delete_topic_form,
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
        return render(request, 'management/add_subtopic.html', { 
            'add_subtopic_form' : add_subtopic_form,
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
            return JsonResponse({"success": True, 
                "messages": [{"message": f"{name} has been successfully added as a subtopic of {topic}.", "tags": "success"}]})
            
        except IntegrityError:
            return JsonResponse({"success": False,  
                "messages": [{"message": "An error occurred while saving this subtopic. Please try again.", "tags": "danger"}]}, status=500)
        
@login_required(login_url='login')  
def rename_subtopic(request):
    if request.method == 'GET':
        rename_subtopic_form = RenameSubtopicForm()
        return render(request, 'management/rename_subtopic.html', { 
            'rename_subtopic_form' : rename_subtopic_form,
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
                
        return JsonResponse({"success": True, 
            "messages": [{"message": f"{old_subtopic_name} has been renamed to {new_subtopic_name}.", 
                          "tags": "success"}]})
        
@login_required(login_url='login')  
def delete_subtopic_form(request):
    if request.method == 'GET':
        delete_subtopic_form = DeleteSubtopicForm()
        return render(request, 'management/delete_subtopic_form.html', { 
            'delete_subtopic_form' : delete_subtopic_form,
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



     
            



