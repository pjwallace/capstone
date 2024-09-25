from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from management.models import Topic, Subtopic, Question
from quizes.models import Progress

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

@login_required(login_url='login')
def get_progress_data(request, subtopic_id):
    if request.method == 'GET':
        # retrieve the unique user/subtopic_id progress recor
        try:
            progress = Progress.objects.get(learner=request.user, subtopic_id=subtopic_id)
            progress_data = {
                'questions_answered': progress.questions_answered,
                'initial_score': progress.initial_score if progress.initial_score is not None else 0,
                'latest_score': progress.latest_score if progress.latest_score is not None else 0,
                'progress_exists': 'yes'
            }
        except Progress.DoesNotExist:
            progress_data = {
                'progress_exists': 'no'
            }

        return JsonResponse(progress_data)
    
@login_required(login_url='login')
def load_quiz(request, subtopic_id):
    pass
