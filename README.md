# Project Overview
This is an end-to-end quiz management app designed for postgraduate surgical trainees (residents) and their program directors. Surgical residents take an annual exam (ABSITE) with the goal of identifying their weaknesses to help prepare them for their written exam after the completion of their training. The written exam is the first of two tests that must be passed for board certification.
Although there are other quiz apps available for residents (SCORE is the most widely used), the uniqueness of my app is that it allows program directors and their designates to create the materials that they would like their trainess to know. This gives training program directors much more control over the testing material. Importantly, for each question that they create, program directors can add a detailed explanation of the correct answer and why the other choices were incorrect. This approach allows for more learning than just a standard quiz app. Another advantage is that questions and explanations can be added, deleted, or updated whenever necessary

# Distinctiveness and Complexity
## Distinctiveness
My project bears no resemblance to any of the projects that we completed in the course. It consists primarily of two componenents. The first is a quiz app that allows the trainee to select or resume a quiz from multiple choices. The second component is a database management system that allows a program director to create the topics, subtopics, questions, answer choices, and explanations.

## Complexity
My project consists of three apps: learners, management, and quizes. The learners app consists of two models, the default django AbstractUser model as well as a Profile model. Since this project is designed for multiple users, the password validation is much more robust than what we used in the course projects.

The management app is where the quiz database is created. This app is restricted to a superuser or staff user.This app consists of six models: Topic, Subtopic, QuestionType, Question, Choice, and Explanation. These models are all related to each other via foreign keys. Each topic, subtopic, question and answer choices, and explanation can be added, modified, or deleted from the database. All these actions require a specific form and template. Deletions display a confirmatory modal before proceeding. All of the database actions can be accessed from the top navbar. There is also a sidebar which displays all the database activity in realtime. Also, questions and answer choices can be managed via the sidebar. The sidebar also keeps track of the number of questions for each topic/subtopic combination.. This is a very complicated app. The javascript file is over 2500 lines, the view.py file is over 1100 lines, forms.py contains 13 different forms, and there are 29 separate paths in the url.py file.

The quizes app is what the students see once they are logged in. After successful login, the student is taken to a dashboard page. On this page, the student will see a list of available topics. Clicking on a topic will then display a list of available subtopics. A start button will display next to a subtopic if the quiz hasn't been attempted. A resume button will display if the quiz is partially complete. If a quiz is complete, the initial and recent scores will be displayed. The student can also click a review button to review his or her answers when a quiz is complete. A reset button is also available which will delete the student answers, allowing them to retake the quiz. 

Once a quiz is started or resumed, the student is taken to the quiz page. This page functions as a single page app. There is a progress bar on the left side of the page which displays whether the question is unanswered, answered correctly or answered incorrectly. The student can proceed through the quiz using navigation buttons or by clicking on a question in the progress bar. Once the quiz is complete, the score is displayed. This app consists of two models: Progress and StudentAnswers. 

# App and File Structure
`capstone`: Main project directory
- `learners`: Application directory that manages user functions
  - `static/learners`
    - `styles.css` 
  - `templates/learners`
     - `base.html`
       - base template for the login, logout, registration functions
     - `index.html`
       - extends `base.html`
       - displays the login page
     - `register.html`
       - extends `base.html`
       -   displays the registration page
     - `profile_base.html`
       - base html for the `edit_profile` page
     - `profile.html`
       - displays the `edit_profile` page, which is accessed by icon on the dashboard page
  - `admin.py`: where the User and Profile models are registered
  - `forms.py`
     - contains `ProfileForm`, which alows users to add or modify their personal information
     - contains functions to validate the entered email address and cell phone number
  - `models.py`: contains two models
     1.Django's default `AbstractUser` class
     2.`Profile`
      - `user`: `OneToOneField(User)`
      - `preferred_name`
      - `residency_program`
      - `pg_level`
      - `cell_phone`
      - `date_created`
      - `date_modified`
  - `urls.py`: contains five paths that each correspond to a python view
  - `views.py`
    - contains the functions that manage login, registration, logout, and editing the user profile

`management`: Application directory that manages the quiz database
- restricted to superusers and staff users
- on login, a superuser or staff user is directed to the management portal
  - `static/management`
    - `script.js`
      - handles asynchronous loading of form dropdown menus. As an example, if a user wants to change an answer choice for a question, they first have to select a topic. Selecting a topic results in the subtopic dropdown then being populated with the available subtopics. After the subtopic is chosen, then the question dropdown menu is populated with the available questions for that particular topic/subtopic combination
      - handles asynchronous submission for 13 different forms
      - manages the sidebar functions:
        - updated in real time after topics, subtopics, and questions are added, changed, or deleted
        - keeps a running total of the number of questions for each subtopic
        - most database functions can be managed from the sidebar as well as from the nav bar 
  - `styles.css`
  - `admin.py`
    - registration of `Topic`, `Subtopic`, `Question`, `Choice`, `explanation`, and `QuestionType` models 
    - admin classes for each model  
  - `forms.py`: 13 forms are defined
    1.`AddTopicForm`
    2.`RenameTopicFor`
    3.`DeleteTopicForm`
    4.`AddSubtopicForm`
    5.`RenameSubtopicForm`
    6.`DeleteSubtopicForm`
    7.`AddQuestionForm`
    8.`AddChoiceForm`
    9.`EditQuestionForm`
    10.`GetAllQuestionsForm`
    11.`EditQuestionTextForm`
    12.`AddExplanationForm`
    13.`EditExplanationForm`
  -  `models.py`: 6 models are defined
    1.`Topic`: for example: liver, stomach
      - `name`
      - `date_created`
      - `created_by`
      - `date_modified`
      - `modified_by`
      - `is_visible`: Boolean value whether the topic is ready to be displayed to the user
      - `display_order`: Integer value used for topic display order in the sidebar

     2.`Subtopic`: for example: liver/anatomy & physiology, liver/portal hypertension
      - `topic`: `ForeignKey(Topic)`
      - `name`
      - `date_created`
      - `created_by`
      - `date_modified`
      - `modified_by`
      - `is_visible`: Boolean value whether the subtopic is ready to be displayed
      -  `display_order`: Integer value used for subtopic display order

     3.`QuestionType`: Managed on the Django admin page
     - `name`: multiple choice, multiple answer, true/false questions are currently supported

     4.`Question`: Questions are defined for a topic/subtopic combination
      - `subtopic`: `ForeignKey(Subtopic)`
      - `question_type`: `ForeignKey(QuestionType)`
      - `text`: Question text
      - `date_created`
      - `created_by`
      - `date_modified`
      - `modified_by` 

     5.`Choice`: Answer choices are defined for a topic/subtopic/question combination
      - `question`: `ForeignKey(Question)`
      - `text`: Answer choice text
      - `is_correct`: Boolean. Is this answer choice correct or not?
      - `date_created`
      - `created_by`
      - `date_modified`
      - `modified_by`

     6.`Explanation`: A question may have only one explanation
      - `question`: `OneToOneField(Question)`
      - `text`
      - `date_created`
      - `created_by`
      - `date_modified`
      - `modified_by`
    - `urls.py`: consists of 29 paths to python views
    - `validation.py`: validates question and answer choices
    - `views.py`: Updates the database when add, change, and delete forms are submitted

`quizes`: Application directory that manages the user dashboard and quiz pages
- `static/quizes`
  - `script.js`: contains all the Javascript for the dashboard and quiz pages 
  - `styles.css`: Contains the CSS for the dashboard page 
  - `styles_quiz`: contains the CSS for the quiz page
- `templates/quizes`
  -   `dashboard.html`
    - `quiz_layout.html`: base layout for the quiz page. Contains the progress bar html.
    - `quiz.html`: Dynamically inserted into `quiz-container` in `quiz_layout.html`
    - `quiz_score.html`: Dynamically inserted into `quiz-score-container` in `quiz_layout.html`
    - `quiz_explanation.html`: Dynamically inserted into `explanation-container` in `quiz_layout.html`
- `admin.py`
  - registration of 2 models: `Progress` and `StudentAnswer`
  - admin classes for both models
- `models.py`
    1.`Progress`
     - `learner`: `ForeignKey(User)`
     - `subtopic`: `ForeignKey(Subtopic)`
     - `questions_answered`: progress is stored for when an incomplete quiz is resumed
     - `initial_score`: always retained no matter how many times the quiz is attempted
     - `latest_score`: multiple quiz attempts are allowed
     - `last_attempted`

    2.`StudentAnswer`
     - stores the student's answers for a particular quiz
     - allows the student to review previous questions and answers
     - `learner`: `ForeignKey(User)`
     - `subtopic`: `ForeignKey(Subtopic)`
     - `question`: `ForeignKey(Question)`
     - `selected_choices`: `ManyToManyField(Choice)`: Allows for multiple answer questions
     - `is_correct`: Boolean value
     - `date_answered`
- `urls.py`: Contains 15 different paths corresponding to python views
- `views.py`: Contains all the functions to manage the dashboard and quiz page

# Additional Information About this Project
When I took CS50 in 2016, my final project was a website for surgical resident education. That website is still in use and may be viewed at: [basicsurgerycourse](basicsurgerycourse.com). I took CS50W because I wanted to create a website that surgical trainees can use to test and reinforce their knowledge and track their progress through their training. This quiz app is designed to be a more robust tool than the quiz function in my basic surgery course webpage.

There are two websites that I have used throughout my career for my own education and for training surgical residents: SESAP and SCORE. SESAP(Surgical Education and Self-Assessment Program) is an excellent resource, but it is designed for practicing surgeons who have annual continuing medical education requirements for maintaining their board certification and medical license. It is not aimed at the surgical trainee. I have adapted and modified their dashboard page for this project. SCORE (Surgical Council on Resident Education) is a learning platform aimed at surgical trainees. It is widely used in training programs but, in my opinion, falls short on its goals. I view my project as an improvement on SCORE.
# Acknowledgements
As previously described, this is a vey complex project and the knowledge required to complete it went way beyond what was presented in the course lectures and projects. Initially, when I didn't know how to do something, I searched YouTube and Stack Overflow for ideas and answers. This quickly proved to be very time inefficient. I began to explore using ChatGTP 4o. I found this resource to be an excellent tutor and sounding board for my ideas.
# How to Run the Application
This project only requires Python, Django and Javascript to run. I don't use any specialized frameworks. After creating a local environment, django must be installed. Following this, a superuser must be created and the database must be initialized by running `makemigrations.py` and `migrations.py`. After running `manage.py runserver`, you will be directed to the login page. Login as the superuser to begin entering topics, subtopics, questions and answer choices.




