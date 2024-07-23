'''
This module validates the question text and answer choices.
if there is an error, an error message will be returned to the calling function.
'''
from .models import Subtopic, Question, QuestionType, Choice


def validate_question_and_choices(subtopic_id, question_type_id, question_text, choice_forms, original_question=None, original_choices=None):
    errors = []
   
     # Make sure the subtopic exists
    try:
        subtopic = Subtopic.objects.get(id=subtopic_id)
    except Subtopic.DoesNotExist:
        errors.append({"message": "Invalid subtopic selected.", "tags": "danger"})
        return errors
        

    # Make sure the question type exists
    try:
        question_type = QuestionType.objects.get(id=question_type_id)
        question_type_name = question_type.name

    except QuestionType.DoesNotExist:
        errors.append({"message": "Invalid question type selected.", "tags": "danger"})
        return errors
        
    if not original_question or original_question.text.lower() != question_text.lower():
       
        # Question can't be blank. 
        if not question_text:
            errors.append({"message": "Please enter a question.", "tags": "danger"})   

        # Question must be at least 10 characters long
        if len(question_text) < 10:
            errors.append({"message": "This question is too short. Please provide more details.", "tags": "danger"})        

        # Question can't be greater than 255 characters
        if len(question_text) > 255:
            errors.append({"message": "This question is too long. Please shorten it.", "tags": "danger"})             
            
        # Subtopic/question text must be unique
        if Question.objects.filter(subtopic=subtopic, text=question_text).exists():
            errors.append({"message": "This subtopic/question combination already exists.", "tags": "danger"})
    
    # validate the choice forms

    # create a list of answer choices
    choice_texts = [choice_form['text'].lower() for choice_form in choice_forms]

    # answer choices can't be blank
    if any(len(choice_text.strip()) == 0 for choice_text in choice_texts):
        errors.append({"message": "Answer choices cannot be empty.", "tags": "danger"})
        
    # each answer choice must be unique       
    if len(choice_texts) != len(set(choice_texts)): # sets don't have duplicate members
        errors.append({"message": "Duplicate answer choices are not allowed.", "tags": "danger"})
    
    # each answer choice must be <= 75 characters
    choice_text_length = [choice_text for choice_text in choice_texts if len(choice_text.strip()) > 75]
        
    if choice_text_length:
        errors.append({"message": "Answer choices must 75 characters or less.", "tags": "danger"})
    
    # validate the is_correct field        
    choice_answers = [choice_form['is_correct'] for choice_form in choice_forms]
            
    # Each question must have at least one correct answer
    if choice_answers.count(False) == len(choice_answers):
        errors.append({"message": "You haven't chosen a correct answer.", "tags": "danger"})
    
    # True/False and multiple choice questions can have only one correct answer checked
    if question_type_name == 'True/False' or question_type_name == 'Multiple Choice':
        if choice_answers.count(True) != 1:
            errors.append({"message": f"{question_type_name} questions can only have one correct answer.", "tags": "danger"})
                               
    # Multiple answer questions must have at least 2 correct answers
    if question_type_name == 'Multiple Answer' and choice_answers.count(True) < 2:
        errors.append({"message": f"{question_type_name} questions must have at least two correct answers.", "tags": "danger"})
    
    return errors
                
          
        
        
        

  


        

    
    
   
    
    