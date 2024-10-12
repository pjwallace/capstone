from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from django.template import RequestContext
from django.middleware.csrf import get_token
from management.models import Topic, Subtopic, Question, Choice
from quizes.models import Progress
import json
from django.template.loader import render_to_string
from django.core.paginator import Paginator

def dashboard(request):
    # Load topics that have subtopics with questions
    topics = Topic.objects.filter(subtopics__questions__isnull=False).distinct()
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
def load_quiz_layout(request, subtopic_id, topic_id):
    # get topic name for title
    topic = get_object_or_404(Topic, id=topic_id)
    topic_name = topic.name

    # get subtopic name for title
    subtopic = get_object_or_404(Subtopic, id=subtopic_id)
    subtopic_name = subtopic.name

    #get all the questions for the subtopic
    questions = Question.objects.filter(subtopic_id=subtopic_id)
    questions_count = questions.count()

    if  not questions:
        return JsonResponse({"success": False,  
                "messages": [{"message": "An error occurred while retrieving questions.", "tags": "info"}]}, 
                status=500)    

    context = {
        'topic_name': topic_name,
        'subtopic_name': subtopic_name,
        'questions': questions,
        'question_count': questions_count,        
    }

    quiz_layout_html = render_to_string('quizes/quiz_layout.html', context)
    return JsonResponse({"success": True, 'quiz_layout_html': quiz_layout_html})

@login_required(login_url='login')    
def load_quiz_questions_and_answers(request, subtopic_id):
    #get all the questions for the subtopic
    questions = Question.objects.filter(subtopic_id=subtopic_id).order_by('id')

    # set up pagination
    paginator = Paginator(questions, 1) # 1 question/page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'page_number': page_number,
        'paginator': paginator,
        'questions': questions,
    }
    # Use get_token(request) to get the CSRF token
    csrf_token = get_token(request)  
    context['csrf_token'] = csrf_token 

    quiz_html = render_to_string('quizes/quiz.html', context, request=request)
    return JsonResponse({"success": True, 'quiz_html': quiz_html})

@login_required(login_url='login')
def process_quiz_question(request, subtopic_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        student_answers = data.get("selected_answers", [])
        question_id = data.get("question_id", "")

        # must select at least one correct answer
        if not student_answers:
            return JsonResponse({"success": False, 
                "messages": [{"message": "You didn't select an answer.", "tags": "danger"}]}, status=400)
        
        # if multiple answer question, must select at least 2 answers
        question = get_object_or_404(Question, id=question_id)
        if question.question_type.name == 'Multiple Answer' and len(student_answers)< 2:
            return JsonResponse({"success": False, 
                "messages": [{"message": "At least 2 answers are required for this question type.", "tags": "danger"}]}, 
                    status=400)
        # grade the quiz                    
        results_dict = {}
        # get all the correct answers from the Choice model in list form. Using sets allows for easy comparisions
        correct_choices = set(Choice.objects.filter(question=question, is_correct=True).values_list('id', flat=True))

        # create a set of student choices
        student_selected_choices = set()

        for answer in student_answers:
            choice_id = int(answer)
            try:
                choice = get_object_or_404(Choice, id=choice_id)
                results_dict[choice_id] = {
                    "is_correct": choice.is_correct,
                    "selected_by_student": True
                }
                student_selected_choices.add(choice_id)
               
            except Choice.DoesNotExist:
                return JsonResponse({"success": False, 
                    "messages": [{"message": "Choice not found.", "tags": "danger"}]}, status=400)

        # For multiple answer questions, there are 2 edge cases to consider:
        # 1) The student didn't choose all the correct answers
        # 2) The student chose all the correct answers but also chose an additional incorrect answer

        if question.question_type.name == 'Multiple Answer':

            # return choice_id
            missed_correct_answers = correct_choices - student_selected_choices
            extra_incorrect_answers = student_selected_choices - correct_choices

            # add missed correct answers to the results_dict. The student didn't choose all the correct answers
            for choice_id in missed_correct_answers:
                results_dict[choice_id] = {
                    "is_correct": True,
                    "selected_by_student": False
                }

            # Indicate if there is an extra incorrect answer in results_dict
            for choice_id in extra_incorrect_answers:
                # update existing entry to flag it as an extra incorrect answer
                if choice_id in results_dict:
                    results_dict[choice_id]["is_extra_incorrect"] = True
                else:
                    # add to results_dict if not already present
                    results_dict[choice_id] = {
                        "is_correct": False,
                        "selected_by_student": True,
                        "is_extra_incorrect": True
                    }

        print(results_dict)

        # create or update the Progress record

        if question.question_type.name == 'Multiple Answer':
            return JsonResponse({"success": True, "results_dict": results_dict,
                "missed_incorrect_answers": list(missed_correct_answers),
                "extra_incorrect_answers": list(extra_incorrect_answers)
            })
        else:
            return JsonResponse({"success": True, "results_dict": results_dict,
                "student_selected_choices": list(student_selected_choices)
            })

