# Project Overview
This is an end-to-end quiz management app designed for postgraduate surgical trainees (residents) and their program directors. Surgical residents take an annual exam (ABSITE) with the goal of identifying their weaknesses to help prepare them for their written exam after the completion of their training. The written exam is the first of two tests that must be passed for board certification.
Although there are other quiz apps available for residents (SCORE is the most widely used), the uniqueness of my app is that it allows program directors and their designates to create the materials that they would like their trainess to know. This gives training program directors more control over the testing material. Importantly, for each question that they create, program directors can add a detailed explanation of the correct answer and why the other choices were incorrect. This approach allows for more learning than just a standard quiz app. Another advantage is that questions and explanations can be added, deleted, or updated whenever necessary

# Distinctiveness and Complexity
## Distinctiveness
My project bears no resemblance to any of the projects that we completed in the course. It consists primarily of two componenents. The first is a quiz app that allows the trainee to select or resume a quiz from multiple choices. The second component is a database management system that allows a program director to create the topics, subtopics, questions, answer choices, and explanations.

## Complexity
My project consists of three apps: learners, management, and quizes. The learners app consists of two models, the default django AbstractUser model as well as a Profile model. Since this project is designed for multiple users, the password validation is much more robust than what we used in the course projects.
The management app is where the quiz database is created. This app is restricted to a superuser or staff user.This app consists of six models: Topic, Subtopic, QuestionType, Question, Choice, and Explanation. These models are all related to each other via foreign keys. Each topic, subtopic, question and answer choices, and explanation can be added, modified, or deleted from the database. All these actions require a specific form and template. Deletions display a confirmatory modal before proceeding. All of the database actions can be accessed from the top navbar. There is also a sidebar which displays all the database activity in realtime. Also, questions and answer choices can be managed via the sidebar. The sidebar also keeps track of the number of questions for each topic/subtopic combination.. This is a very complicated app. The javascript file is over 2500 lines, the view.py file is over 1100 lines, and there are 34 separate paths in the url.py file.
The quizes app is what the students see once they are logged in. After successful login, the student is taken to a dashboard page. On this page, the student will see a list of available topics. Clicking on a topic will then display a list of available subtopics. A start button will display next to a subtopic if the quiz hasn't been attempted. A resume button will display is the quiz is partially complete. If a quiz is complete, the initial and recent scores will be displayed. The student can also click a review button to review his or her answers. A reset button is also available which will delete the student answers, allowing them to retake the quiz. Once a quiz is started or resumed, the student is taken to the quiz page. This page functions as a single page app. There is a progress bar on the left side of the page which displays if the question is unanswered, answered correctly or answered incorrectly. The student can proceed through the quiz using navigation buttons or by clicking on a question in the progress bar. Once the quiz is complete, the score is displayed. This app consists of two models: Progress and StudentAnswers. The url.py consists of 18 different paths.

# App and File Structure
`capstone`: Main project directory
    `learners`: Application directory that manages user functions
    *   `static/learners`
        -   `styles.css` 
    *   `templates/learners`
        -   `base.html`
            -   base template for the login, logout, registration functions
        -   `index.html`
            -   extends `base.html`
            -   displays the login page
        -   `register.html`
            -   extends `base.html`
            -   displays the registration page
        -   `profile_base.html`
            -   base html for the `edit_profile` page
        -   `profile.html`
            -   displays the `edit_profile` page, which is accessed by clicking on the profile icon on the   dashboard page
    *   `admin.py`: where the User and Profile models are registered
    *   `forms.py`
        -   contains the `ProfileForm`, which alows users to add or modify their first name, last name, preferred name, email, residency program, postgraduate level, and cell phone number
        -   contains functions to validate the entered email address and cell phone number
    *   `models.py`: contains two models
        -   Django's default `AbstractUser` class
        -   `Profile`
            -   `user`: `OneToOneField(User)`
            -   `preferred_name`
            -   `residency_program`
            -   `pg_level`
            -   `cell_phone`
            -   `date_created`
            -   `date_modified`
    *   `urls.py`: contains five paths that each correspond to a python view
    *   `views.py`
        -   contains the functions that manage login, registration, logout, and editing the user profile
    `management`: Application directory that manages the quiz database
        -   restricted to superusers and staff users
        -   on login, a superuser or staff user is directed to the management portal
        `static/management`
        -   `script.js`
            -   handles asynchrounous loading of form dropdown menus. As an example, if a user wants to change an answer choice for a question, they first have to select a topic. Selecting a topic results in the subtopic dropdown then being populated with the available subtopics. After the subtopic is chosen, then the question dropdown menu is populated with the available questions for that particular topic/subtopic combination
            -   handles asynchronous submission for 13 different forms
            -   manages the sidebar functions:
                -   updated in real time after topics, subtopics, and questions are added, changed, or deleted
                -   keeps a running total of the number of questions for each subtopic
                -   most database functions can be managed from the sidebar as well as from the nav bar 
        -   `styles.css`
        -   `admin.py`
            - registration of the `Topic`, `Subtopic`, `Question`, `Choice`, `explanation`, and `QuestionType` models
            -   admin classes for each model  
        -   `forms.py`: 13 forms are defined
            -   `AddTopicForm`
            -   `RenameTopicFor`
            -   `DeleteTopicForm`
            -   `AddSubtopicForm`
            -   `RenameSubtopicForm`
            -   `DeleteSubtopicForm`
            -   `AddQuestionForm`
            -   `AddChoiceForm`
            -   `EditQuestionForm`
            -   `GetAllQuestionsForm`
            -   `EditQuestionTextForm`
            -   `AddExplanationForm`
            -   `EditExplanationForm`
        -   `models.py`: 6 models are defined
