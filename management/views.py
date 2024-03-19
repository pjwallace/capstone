from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
import json
from django.http import JsonResponse
from django.template.loader import render_to_string

#from .models import Topic, Subtopic
from .forms import TopicForm

def management_portal(request):
   
    return render(request, 'management/manage_db.html')

def add_topic(request):
    print(request.GET)
    if request.method == 'GET':
        topic_form = TopicForm()

        # send the html form back to the javascript function for asynchronous processing
        form_html = render_to_string('management/topic_form.html', {'form': topic_form}, request)
        return JsonResponse({'form': form_html})

    #elif request.method == 'POST':
        #topic_form = TopicForm(request.POST)


