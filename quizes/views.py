from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from management.models import Topic, Subtopic, Question

def dashboard(request):
    # Load topics that have subtopics with questions
    topics = Topic.objects.filter(subtopics__questions__isnull=False).distinct()
    print(topics)
    return render(request, 'quizes/dashboard.html', {
        'topics': topics
    })

@login_required(login_url='login')
def get_subtopics_for_quiz(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    subtopics = topic.subtopics.all()
    if subtopics:
        subtopic_data = []
        for subtopic in subtopics:
            if subtopic.questions.count() > 0:
                subtopic_data.append({
                    'subtopic_id': subtopic.id,
                    'subtopic_name': subtopic.name,
                    'subtopic_question_count': subtopic.questions.count()
                })

        return JsonResponse({'success' : True, 'subtopic_data' : subtopic_data})
    else:
        return JsonResponse({"success": False,  
                "messages": [{"message": "Subtopic retrieval failed.", "tags": "danger"}]})
