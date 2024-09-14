from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from management.models import Topic, Subtopic, Question

#from .models import User

def dashboard(request):
    # Load topics that have subtopics with questions
    topics = Topic.objects.filter(subtopics__questions__isnull=False).distinct()
    print(topics)
    return render(request, 'quizes/dashboard.html', {
        'topics': topics
    })

