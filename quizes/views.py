from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from django.template import RequestContext
from django.middleware.csrf import get_token
from django.db import IntegrityError, OperationalError
from management.models import Topic, Subtopic, Question, Choice, Explanation
from quizes.models import Progress, StudentAnswer
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
        # retrieve the unique user/subtopic_id progress record
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
    return JsonResponse({
        "success": True, 
        'quiz_html': quiz_html,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
        'page_number': page_obj.number,
        'total_pages': paginator.num_pages
        })

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
        
        # grade the quiz question                   
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

        # student missed 1 or more correct answers
        missed_correct_answers = correct_choices - student_selected_choices
        # student chose all the correct answers + 1 or more incorrect answers
        extra_incorrect_answers = student_selected_choices - correct_choices

        # add missed correct answers to the results_dict. The student didn't choose all the correct answers
        for choice_id in missed_correct_answers:
            results_dict[choice_id] = {
                "is_correct": True,
                "selected_by_student": False
            }

        # add any extra incorrect answer to results_dict
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
        
        # check if the progress record exists or must be created
        try:
            progress = Progress.objects.get(learner=request.user, subtopic_id=subtopic_id)
            progress_data = {
                'questions_answered': progress.questions_answered,
                'progress_exists': 'yes'
            }
        except Progress.DoesNotExist:
            progress_data = {
                'progress_exists': 'no'
            }
               
        return JsonResponse({"success": True, "student_answers": student_answers, "results_dict": results_dict, 
                'question_id': question_id, "question_type": question.question_type.name,
                'progress_data': progress_data})
                
            
@login_required(login_url='login')
def create_progress_record(request, subtopic_id):
    if request.method == 'POST':
        learner = request.user

        try:
            progress = Progress(learner=learner, subtopic_id=subtopic_id, questions_answered=1)
            progress.save()

        except IntegrityError:
            return JsonResponse({"success": False,  
                "messages": [{"message": "An error occurred while creating this record.", "tags": "danger"}]},
                    status=500)
        
        except Exception as e:
            return JsonResponse({"success": False, "messages": [{"message": f"An unexpected error occurred: {str(e)}", "tags": "danger"}]},
                    status=500)
        
        return JsonResponse({"success": True})
    
@login_required(login_url='login')
def update_progress_record(request, subtopic_id):
    if request.method == 'PUT':
        learner = request.user

         # create a Progress instance
        try:
            progress = Progress.objects.get(learner=learner, subtopic_id=subtopic_id)
            questions_answered = progress.questions_answered
        except Progress.DoesNotExist:
            return JsonResponse({"success": False, 
                "messages": [{"message": "Progress record does not exist.", "tags": "danger"}]}, status=400)
        
        # update number of questions answered
        try:
            progress.questions_answered = questions_answered + 1           
            progress.save()
        except Exception as e:
            return JsonResponse({"success": False, 
                "messages": [{"message": f"An error occurred: {str(e)}", "tags": "danger"}]}, status=500)
        
        return JsonResponse({"success": True})

@login_required(login_url='login')
def save_answer(request, question_id):
    if request.method == 'POST':
        data = json.loads(request.body)
        student_answers = data.get("student_answers", [])
        print(student_answers)
        question = get_object_or_404(Question, id=question_id)
        
        # iterate over the student_answer list and create a StudentAnswer record for each answer
        # each answer is a choice id
        # question type 'Multiple Answer' will have at least 2 answers
        for student_answer in student_answers:
            selected_choices = Choice.objects.get(pk=student_answer)
            # save the student's answers
            try:
                student_answer_obj = StudentAnswer.objects.create(
                    learner = request.user,
                    question = question,
                    subtopic = question.subtopic,
                    is_correct=selected_choices.is_correct                    
                )

                # add the selected_choices many-to-many field using the set() method
                student_answer_obj.selected_choices.set([selected_choices])               

            except Exception as e:
                return JsonResponse({"success": False, 
                "messages": [{"message": f"An error occurred: {str(e)}", "tags": "danger"}]}, status=500)  

        return JsonResponse({"success": True})
    
@login_required(login_url='login')
def get_student_answer(request, subtopic_id, question_id):
    learner = request.user

    try:
        student_answers = StudentAnswer.objects.filter(
        learner=learner,
        subtopic_id=subtopic_id,
        question_id=question_id
        ).prefetch_related('selected_choices')

    except StudentAnswer.DoesNotExist:
        return JsonResponse({"success": False, 
            "messages": [{"message": "PStudentAnswer record does not exist.", "tags": "danger"}]}, status=400)

    # Create a dictionary to store the answers and correctness
    student_answers_dict = {
        'selected_choices': [],
        'correct_choices': []
    }

    for answer in student_answers:
        # Store selected choices
        selected_choices = list(answer.selected_choices.values_list('id', flat=True))
        student_answers_dict['selected_choices'] += selected_choices

        # Check if each selected choice is correct or incorrect
        correct_choices = Choice.objects.filter(question=answer.question, is_correct=True).values_list('id', flat=True)

        # Append correct choices for later use in frontend
        student_answers_dict['correct_choices'] += list(correct_choices)

        print(student_answers_dict)

    return JsonResponse({"success": True, 'student_answers_dict': student_answers_dict})
        
@login_required(login_url='login')
def load_quiz_question_explanation(request, question_id):
    try:
        explanation = Explanation.objects.get(question_id=question_id)
        context = {
            'explanation_text': explanation.text
        }
       
        quiz_explanation_html = render_to_string('quizes/quiz_explanation.html', context)
        
    except Explanation.DoesNotExist:
        return JsonResponse({"success": False})
    
    except Exception as e:
            return JsonResponse({"success": False, 
                "messages": [{"message": f"An error occurred: {str(e)}", "tags": "danger"}]}, status=500)
    
    return JsonResponse({"success": True, "quiz_explanation_html": quiz_explanation_html})