// Define quizState globally with initial default values
const quizState = {
    hasNext: false,
    hasPrevious: false,
    pageNumber: 1,
    totalPages: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    questionCount: 0,
    questionsAnswered: 0,
};

// reset quizState when leaving the quiz page
window.addEventListener('beforeunload', ()=>{
    initializeQuizState();
});

document.addEventListener('DOMContentLoaded', function(){
    loadSubtopicsForQuizTopic(); 

    // add eventlistener for a clicked button in the subtopics container (start, resume, review, retake)
    document.getElementById('dashboard-container').addEventListener('click', function(e){
        const clickedButton = e.target.closest('button');
        if (!clickedButton) return;

        const subtopicId = clickedButton.dataset.subtopicId;
        if (!subtopicId) return;

        const topicId = clickedButton.dataset.topicId;
        if (!topicId) return;

        const questionCount = clickedButton.dataset.questionCount;

        // process the buttons
        if (clickedButton.classList.contains('start')){
            processStartButton(subtopicId, topicId, questionCount);
        } else if (clickedButton.classList.contains('resume')){
            processResumeButton(subtopicId, topicId, questionCount);
        } else if (clickedButton.classList.contains('review')){
            processReviewButton(subtopicId, topicId);
        } else if (clickedButton.classList.contains('retake')){
            setupRetakeQuizDialog(subtopicId, topicId, questionCount);
        }
    });
    document.getElementById('dashboard-container').addEventListener('click', function(e){
        if (e.target.tagName === 'BUTTON' && e.target.id === 'cancel-button'){
            cancelRetakeQuizDialog();
        }
        if (e.target.tagName === 'BUTTON' && e.target.id === 'confirm-quiz-retake-button'){
            processRetakeButton();
        }
    });
}); 

async function loadSubtopicsForQuizTopic(){
    document.getElementById('dashboard-container').addEventListener('click', async function(e){           
            const topicDiv = e.target.closest('.topics');
            if (!topicDiv) return;

            e.preventDefault();

            const topicId = topicDiv.dataset.topicId;
            const subtopicsContainer = document.getElementById('subtopicscontainer-' + topicId);
            const plusIcon = document.getElementById('plus-' + topicId);
            const minusIcon = document.getElementById('minus-' + topicId);
            
            // if subtopics have been loaded, when the div is clicked they shouldn't be displayed
            // and the plus sign should appear
            if (subtopicsContainer.children.length > 0){
                subtopicsContainer.innerHTML = '';
                minusIcon.style.display = 'none';
                plusIcon.style.display = 'block'; 
                return;              
            }

            try {
                // fetch subtopics for the chosen topic
                route = `/quizes/home/get_subtopics_for_quiz/${topicId}`;
                const response = await fetch(route);
                const data = await response.json();
                              
                if (data.success){
                    subtopicsContainer.innerHTML = '';
                    minusIcon.style.display = 'block';
                    plusIcon.style.display = 'none';
                    
                    minusIcon.style.display = 'block'; // Show the minus icon
                    plusIcon.style.display = 'none';   // Hide the plus icon

                    // build the subtopic header columns
                    const subtopicHeader = document.createElement('div');
                    subtopicHeader.classList.add('row', 'column-header')

                    // subtopic name
                    const subtopicName = document.createElement('div');
                    subtopicName.classList.add('col-md-4', 'col-sm-6');
                    subtopicName.setAttribute('id', 'subtopic-header');
                    const subtopicNameSpan = document.createElement('span');
                    subtopicNameSpan.classList.add('header-span');
                    subtopicNameSpan.setAttribute('id', 'subtopic-name');
                    subtopicNameSpan.textContent = 'Subtopic';
                    subtopicName.append(subtopicNameSpan);
                    subtopicHeader.append(subtopicName);

                    // subtopic status
                    const subtopicStatus = document.createElement('div');
                    subtopicStatus.classList.add('col-md-2', 'col-sm-6');
                    subtopicStatus.setAttribute('id', 'status-header');
                    const subtopicStatusSpan = document.createElement('span');
                    subtopicStatusSpan.classList.add('header-span');
                    subtopicStatusSpan.setAttribute('id', 'subtopic-status');
                    subtopicStatusSpan.textContent = 'Status';
                    subtopicStatus.append(subtopicStatusSpan);
                    subtopicHeader.append(subtopicStatus);

                    // subtopic progress
                    const subtopicProgress = document.createElement('div');
                    subtopicProgress.classList.add('col-md-2', 'col-sm-6');
                    subtopicProgress.setAttribute('id', 'progress-header');
                    const subtopicProgressSpan = document.createElement('span');
                    subtopicProgressSpan.classList.add('header-span');
                    subtopicProgressSpan.setAttribute('id', 'subtopic-progress');
                    subtopicProgressSpan.textContent = 'Progress';
                    subtopicProgress.append(subtopicProgressSpan);
                    subtopicHeader.append(subtopicProgress);

                    // subtopic score
                    const subtopicScore = document.createElement('div');
                    subtopicScore.classList.add('col-md-2', 'col-sm-6');
                    subtopicScore.setAttribute('id', 'score-header');
                    const subtopicScoreSpan = document.createElement('span');
                    subtopicScoreSpan.classList.add('header-span');
                    subtopicScoreSpan.setAttribute('id', 'subtopic-score');
                    subtopicScoreSpan.textContent = 'Score';
                    subtopicScore.append(subtopicScoreSpan);
                    subtopicHeader.append(subtopicScore);

                    // review/retake
                    const subtopicReview = document.createElement('div');
                    subtopicReview.classList.add('col-md-2', 'col-sm-6');
                    subtopicReview.setAttribute('id', 'review-header');
                    const subtopicReviewSpan = document.createElement('span');
                    subtopicReviewSpan.classList.add('header-span');
                    subtopicReviewSpan.setAttribute('id', 'subtopic-review');
                    subtopicReviewSpan.textContent = 'Review/Retake';
                    subtopicReview.append(subtopicReviewSpan);
                    subtopicHeader.append(subtopicReview);

                    // for mobile responsiveness, hide the progress and review/retake headers
                    if (window.innerWidth <= 768) {
                        subtopicProgress.style.display = 'none';
                        subtopicReview.style.display = 'none';
                    } else {
                        subtopicProgress.style.display = '';
                        subtopicReview.style.display = '';
                    }

                    subtopicsContainer.append(subtopicHeader);
                    
                    for (const subtopic of data.subtopic_data){
                        
                        // Create a Bootstrap row div to hold the subtopic and other columns
                        const subtopicRow = document.createElement('div');
                        subtopicRow.classList.add('row', 'subtopics-row');
                        subtopicRow.setAttribute('id', `subtopicrow-${subtopic.subtopic_id}`);

                        // create div to hold the subtopic                         
                        const subtopicDiv = document.createElement('div');                            
                        subtopicDiv.setAttribute('id', `subtopic-${subtopic.subtopic_id}`);
                        subtopicDiv.classList.add('col-md-4', 'col-sm-6', 'subtopics');
                        subtopicDiv.setAttribute('data-subtopic-id', subtopic.subtopic_id);
                        subtopicDiv.textContent = subtopic.subtopic_name;
                        subtopicRow.appendChild(subtopicDiv);

                        const subtopicId = subtopic.subtopic_id;
                        const questionCount = subtopic.subtopic_question_count;
                        
                        // retrieve user progress data
                        const progressData = await getProgressData(subtopicId)
                            
                        // set up the status column
                        statusColumn(subtopicRow, subtopicId, progressData, questionCount, topicId);

                        // set up the progress column
                        progressColumn(subtopicRow, progressData, questionCount);

                        // set up the score column
                        scoreColumn(subtopicRow, progressData, questionCount);

                        // set up the review column
                        reviewColumn(subtopicRow, subtopicId, progressData, questionCount, topicId);

                        subtopicsContainer.appendChild(subtopicRow);
                                                                                                                                   
                    }
                    requestAnimationFrame(() => {
                        document.getElementById('dashboard-container').style.display = 'none';
                        document.getElementById('dashboard-container').offsetHeight; // Trigger reflow
                        document.getElementById('dashboard-container').style.display = 'block';
                    });
                    
                }else{
                    // errors
                    let dashboard_msg = document.getElementById('dashboard-msg');
                    dashboard_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" 
                        role="alert">${data.messages[0].message}</div>`;
                }
                
            } catch (error) {
                console.error('Error retrieving subtopics:', error);
            }
        //});
    });    
}

async function getProgressData(subtopicId){
    route = `/quizes/home/get_progress_data/${subtopicId}`;

    try {
        const response = await fetch(route);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();  // This returns the parsed JSON as progressData
    } catch (error) {
        console.error('Error fetching progress data:', error);
        return null;  // Return null so the caller knows there was an error
    } 
}

function statusColumn(subtopicRow, subtopicId, progressData, questionCount, topicId){
    const statusDiv = document.createElement('div');
    statusDiv.classList.add('col-md-2', 'col-sm-6', 'status-column');

    // display start button if a quiz hasn't been attempted yet
    if (progressData.progress_exists == 'no'){
        const startButton = document.createElement('button');
        startButton.type = 'button';
        startButton.setAttribute('id', `start-${subtopicId}`);
        startButton.classList.add('btn', 'btn-success', 'btn-sm', 'start');
        startButton.dataset.subtopicId = subtopicId;
        startButton.dataset.topicId = topicId;
        startButton.dataset.questionCount = questionCount;
        startButton.textContent = 'Start';
        statusDiv.append(startButton);
        subtopicRow.append(statusDiv);

        // add event listener to start button
        //startButton.addEventListener('click', function(e){
        //    e.preventDefault;
        //    quizState.questionCount = questionCount;
        //    let buttonType = 'start';
        //    loadQuizLayout(subtopicId, topicId, buttonType);
        //})

    // resume quiz button
    }else if (progressData.progress_exists == 'yes' && questionCount != progressData.questions_answered){
        const resumeButton = document.createElement('button');
        resumeButton.type = 'button';
        resumeButton.setAttribute('id', `review-${subtopicId}`);
        resumeButton.classList.add('btn', 'btn-primary', 'btn-sm', 'resume');
        resumeButton.dataset.subtopicId = subtopicId;
        resumeButton.dataset.topicId = topicId;
        resumeButton.dataset.questionCount = questionCount;
        resumeButton.textContent = 'Resume';
        statusDiv.append(resumeButton);
        subtopicRow.append(statusDiv);

        //console.log(questionCount);
        //quizState.questionCount = questionCount;
        

    // Display quiz complete text
    }else if (progressData.progress_exists == 'yes' && questionCount == progressData.questions_answered){
        // complete span
        const completeText = document.createElement('span');
        completeText.textContent = 'Complete';
        completeText.id = 'complete-status';
        statusDiv.appendChild(completeText);
        subtopicRow.append(statusDiv);
    }
}

function processStartButton(subtopicId, topicId, questionCount){
    quizState.questionCount = questionCount;
    let buttonType = 'start';
    loadQuizLayout(subtopicId, topicId, buttonType);
}

function processResumeButton(subtopicId, topicId, questionCount){
    quizState.questionCount = questionCount;
    let buttonType = 'resume';
    loadQuizLayout(subtopicId, topicId, buttonType);    
}

function progressColumn(subtopicRow, progressData, questionCount){
    const progressDiv = document.createElement('div');
    progressDiv.classList.add('col-md-2', 'col-sm-6', 'progress-column');

    // Quiz not started yet
    if (progressData.progress_exists == 'no'){
        const progressDash = document.createElement('span');
        progressDash.textContent = 'Not Started';
        progressDiv.appendChild(progressDash);

    // quiz in progress or completed
    }else if (progressData.progress_exists == 'yes'){
        const progressQuestionsText = document.createElement('div');
        progressQuestionsText.setAttribute('class', 'questions-text');

        // create the first line 'Questions'
        const questionLabel = document.createElement('span');
        questionLabel.textContent = 'Questions';
        progressQuestionsText.appendChild(questionLabel);

        // create the second line 'number answered of total questions'
        const questionsProgress = document.createElement('span');
        questionsProgress.setAttribute('id', 'questions-progress');
        questionsProgress.textContent = `${progressData.questions_answered} of ${questionCount}`;
        progressQuestionsText.appendChild(questionsProgress);

        progressDiv.appendChild(progressQuestionsText);
    }

    // For mobile responsiveness, check screen size and hide if necessary
    if (window.innerWidth <= 768) {
        progressDiv.style.display = 'none';
    } else {
        progressDiv.style.display = '';
    }

    subtopicRow.appendChild(progressDiv);
}

function scoreColumn(subtopicRow, progressData, questionCount){
    const scoreDiv = document.createElement('div');
    scoreDiv.classList.add('col-md-2', 'col-sm-6', 'score-column');
    completeSpan = document.getElementById('complete-status');
    
    if (progressData.progress_exists == 'no'){
        // display 2 minus signs to indicate no score yet
        const scoreDashes = document.createElement('div');
        scoreDashes.setAttribute('class', 'score-dash');

        const initialMinus = document.createElement('i');
        initialMinus.classList.add('fa', 'fa-solid', 'fa-minus', 'minus-bigger');
        
        const latestMinus = document.createElement('i');
        latestMinus.classList.add('fa', 'fa-solid', 'fa-minus', 'minus-bigger');

        scoreDashes.append(initialMinus);
        scoreDashes.append(latestMinus);
        scoreDiv.append(scoreDashes);

    }else if (progressData.progress_exists == 'yes'){
        // score container
        const scoreText = document.createElement('div');
        scoreText.setAttribute('class', 'score-text');

        // first line 'inital     Latest'
        const scoreLabel = document.createElement('div');
        scoreLabel.setAttribute('class', 'score-label'); 

        const initialLabel = document.createElement('span');
        initialLabel.textContent = 'Initial';

        const latestLabel = document.createElement('span');
        latestLabel.textContent = 'Latest';

        scoreLabel.appendChild(initialLabel);
        scoreLabel.appendChild(latestLabel);
        scoreText.appendChild(scoreLabel);
        
        // second line
        const scoreResults = document.createElement('div');
        scoreResults.setAttribute('class', 'score-results');

        const initialScore = document.createElement('span');
        const initialScorePercent = progressData.initial_score;
        initialScore.textContent = `${initialScorePercent}%`;

        const latestScore = document.createElement('span');
        const latestScorePercent = progressData.latest_score;
        latestScore.textContent = `${latestScorePercent}%`;

        scoreResults.appendChild(initialScore);
        scoreResults.appendChild(latestScore);
        scoreText.appendChild(scoreResults);

        scoreDiv.appendChild(scoreText);
    }

    // For mobile responsiveness, check screen size and hide if necessary
    if (window.innerWidth <= 576) {
        scoreDiv.style.display = 'none';
    }  else if (window.innerWidth <= 768){
        scoreDiv.style.display = 'flex';
    } else {
        scoreDiv.style.display = '';
    }    

    subtopicRow.appendChild(scoreDiv);
}

function reviewColumn(subtopicRow, subtopicId, progressData, questionCount, topicId){
    const reviewDiv = document.createElement('div');
    reviewDiv.classList.add('col-md-2', 'col-sm-6', 'review-column');

    if (progressData.progress_exists == 'no' || progressData.questions_answered != questionCount){
        const reviewMinus = document.createElement('div');
        reviewMinus.setAttribute('class', 'review-minus');

        const reviewMinusIcon = document.createElement('i');
        reviewMinusIcon.classList.add('fa', 'fa-solid', 'fa-minus', 'minus-bigger');

        reviewMinus.append(reviewMinusIcon);
        reviewDiv.append(reviewMinus);

    }else if (progressData.progress_exists == 'yes' && progressData.questions_answered == questionCount){
        // review button
        const reviewButton = document.createElement('button');
        reviewButton.type = 'button';
        reviewButton.classList.add('btn', 'btn-info', 'btn-sm', 'review');
        reviewButton.setAttribute('id', `review-${subtopicId}`);
        reviewButton.dataset.subtopicId = subtopicId;
        reviewButton.dataset.topicId = topicId;
        reviewButton.textContent = 'Review';
        reviewDiv.appendChild(reviewButton);

        // add event listener to resume button
        //reviewButton.addEventListener('click', function(e){
        //    e.preventDefault();
        //    const buttonType = 'review';
        //    loadQuizLayout(subtopicId, topicId, buttonType);
        //})

        // retake button
        const retakeButton = document.createElement('button');
        retakeButton.type = 'button';
        retakeButton.classList.add('btn', 'btn-danger', 'btn-sm', 'retake');
        retakeButton.setAttribute('id', `retake-${subtopicId}`);
        retakeButton.dataset.subtopicId = subtopicId;
        retakeButton.dataset.topicId = topicId;
        retakeButton.dataset.questionCount = questionCount;
        retakeButton.textContent = 'Retake';
        reviewDiv.appendChild(retakeButton);

        //quizState.questionCount = questionCount;

        //retakeButton.addEventListener('click', function(e){
        //    e.preventDefault();
        //    const retakeConfirmed = confirm('Are you sure you want to retake this quiz? This will delete your current answers.')

        //    if (retakeConfirmed){
        //        quizState.questionCount = questionCount;
        //        retakeQuiz(subtopicId, topicId);   
        //    } else {
        //        return;
        //    }
        //})
        
    }

    // For mobile responsiveness, review/retake only displays on larger screens
    if (window.innerWidth <= 768) {
        reviewDiv.style.display = 'none';
    } else {
        reviewDiv.style.display = '';
    }

    subtopicRow.appendChild(reviewDiv);
}

function processReviewButton(subtopicId, topicId){
    let buttonType = 'review';
    loadQuizLayout(subtopicId, topicId, buttonType);    
}

function setupRetakeQuizDialog(subtopicId, topicId, questionCount){
    const dialogElement = document.getElementById('confirm-retake-quiz-dialog');
    if (!dialogElement){
        console.error('Dialog element with ID confirm-retake-quiz-dialog not found.');
        return;
    }
    // add subtopicId, topicId, and questionCount data attributes to confirm quiz retake button
    confirmQuizRetakeButton = document.getElementById('confirm-quiz-retake-button');
    confirmQuizRetakeButton.dataset.subtopicId = subtopicId;
    confirmQuizRetakeButton.dataset.topicId = topicId;
    confirmQuizRetakeButton.dataset.questionCount = questionCount;
    dialogElement.showModal();
}

function cancelRetakeQuizDialog(){
    const dialogElement = document.getElementById('confirm-retake-quiz-dialog');
    if (!dialogElement){
        console.error('Dialog element with ID confirm-retake-quiz-dialog not found.');
        return;
    }
    dialogElement.close();
}

function processRetakeButton(subtopicId, topicId){
    confirmQuizRetakeButton = document.getElementById('confirm-quiz-retake-button');
    subtopicId = confirmQuizRetakeButton.dataset.subtopicId;
    topicId = confirmQuizRetakeButton.dataset.topicId;  
    questionCount = confirmQuizRetakeButton.dataset.questionCount;
    retakeQuiz(subtopicId, topicId, questionCount); 
}

function loadQuizLayout(subtopicId, topicId, buttonType){
    const route = `/quizes/home/load_quiz_layout/${subtopicId}/${topicId}`;   
    fetch(route)
    .then(response => response.json())
    .then(data =>{
        if (data.success){
                        
            // Replace the entire document (both <head> and <body>)
            document.documentElement.innerHTML = data.quiz_layout_html;

            // update the browser's URL without reloading the page (for the back and forward buttons)
            const quizURL = `/quizes/home/quiz/${subtopicId}/`;
            history.pushState({subtopicId: subtopicId, topicId: topicId}, '', quizURL);

            // attach progress bar event listeners
            attachProgressBarEventListeners();
            
            // load the first quiz question if starting a new quiz
            if (buttonType === 'start' || buttonType === 'retake'){
                loadQuizQuestionsAndAnswers(subtopicId, pageNumber=1);
            } else if (buttonType === 'resume'){
                resumeQuiz(subtopicId);
            } else if (buttonType === 'review'){
                reviewQuiz(subtopicId);
            }
        }
        else{
            console.error("Failed to load quiz layout");
        }

    })
    .catch(error => console.error('Error loading quiz layout:', error));

}

function attachProgressBarEventListeners(){
    const progressContainer = document.getElementById('progress-container');
   
    if (progressContainer){
        const questionLinks = document.querySelectorAll('#progress-container a');

        questionLinks.forEach(link => {
            link.addEventListener('click', function(e){
                e.preventDefault();
                const subtopicId = this.getAttribute('data-subtopic-id');
                const pageNumber = this.getAttribute('data-page');
                loadQuizQuestionsAndAnswers(subtopicId, pageNumber);
            })
        })
    }
}




// manage the browser back and forward buttons
window.onpopstate = function(event){
    // user has visited a quiz page
    if (event.state){
        const subtopicId = event.state.subtopicId;
        const topicId = event.state.topicId;
        console.log(`Returning to quiz with Subtopic ID: ${subtopicId}, Topic ID: ${topicId}`);
        if (window.location.pathname.includes('/quiz/')){
           loadQuizLayout(subtopicId, topicId, 'resume');
        } else {
            window.location.href = '/quizes/home/';
       }

    } else {
        window.location.href = '/quizes/home/';    
   }
}

function loadQuizQuestionsAndAnswers(subtopicId, pageNumber){
    const quizContainer = document.getElementById('quiz-container');
    const quizScoreContainer = document.getElementById('quiz-score-container');
    const explanationContainer = document.getElementById('explanation-container');
   
    if (quizContainer){
        const route = `/quizes/home/load_quiz_questions_and_answers/${subtopicId}?page=${pageNumber}`;   
        fetch(route)
        .then(response => response.json())
        .then(data =>{
            if (data.success){
                quizState.hasNext = data.has_next;
                quizState.hasPrevious = data.has_previous;
                quizState.pageNumber  = data.page_number;
                quizState.totalPages = data.total_pages;

                if (quizScoreContainer){
                    quizScoreContainer.innerHTML = '';    
                }

                if (explanationContainer){
                    explanationContainer.innerHTML = '';    
                }

                quizContainer.innerHTML = '';
                quizContainer.innerHTML = data.quiz_html;
                
                document.getElementById('quizsubtopic-id').value = subtopicId;

               
                // if there isn't a previous quiz question, hide the previous button;
                // else display the button and add an event listener              
                const previousButton = document.getElementById('previous-button');
                if (previousButton){
                    if (quizState.hasPrevious){
                        previousButton.classList.remove('hidden');

                        // remove the old event listener to prevent multiple event listeners for the same button
                        previousButton.removeEventListener('click', previousPageHandler);

                        // define previousPageHandler
                        function previousPageHandler(){
                            previousPage(subtopicId, quizState.pageNumber);    
                        }
                        // add the event listener
                        previousButton.addEventListener('click', previousPageHandler);
                    }else{
                        previousButton.classList.add('hidden');
                    }
                }   
                
                // if there isn't a next quiz question, hide the next button;
                // else display the button and add an event listener
                const nextButton = document.getElementById('next-button');
                if (nextButton){
                    if (quizState.hasNext){
                        nextButton.classList.remove('hidden');

                        // remove the old event listener to prevent multiple event listeners for the same button
                        nextButton.removeEventListener('click', nextPageHandler);

                        // define nextPageHandler
                        function nextPageHandler(){
                            nextPage(subtopicId, quizState.pageNumber, quizState.totalPages);    
                        }
                         // add the event handler to the next button
                        nextButton.addEventListener('click', nextPageHandler);
                    }else{
                        nextButton.classList.add('hidden');                        
                    }
                }

                // check if this question has been previously answered (StudentAnswer record exists).                
                (async () => {
                    const questionId = document.getElementById('quizquestion-id').value;
                    const studentAnswers = await getStudentAnswer(subtopicId, questionId);
                    
                    if (studentAnswers && studentAnswers.length > 0){
                        // disable the submit button
                        const submitButton = document.getElementById('submit-quiz-question');
                        const viewQuizResults = document.getElementById('view-quiz-results');
                        
                        if (submitButton){
                            submitButton.style.display = 'none';
                        }

                        // disable the view quiz results button                        
                        if (viewQuizResults){
                            viewQuizResults.style.display = 'none';
                        } 

                        // mark the choices selected by the student
                        studentAnswers.forEach(choiceId=>{
                            const choiceInput = document.querySelector(`input[value="${choiceId}"]`);
                            if (choiceInput){
                                choiceInput.checked = 'true';
                            }
                        });

                        // disable all input boxes on the form
                        const choiceInputs = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
                        choiceInputs.forEach(input => {
                            input.disabled = 'true';
                        });

                        let previouslyAnswered = true;
                        processQuizQuestion(studentAnswers, previouslyAnswered);
                    }else{
                        // question has not been previously answered
                        // make sure the submit button is displayed
                        const submitButton = document.getElementById('submit-quiz-question');
                        if (submitButton){
                            submitButton.style.display = 'block';
                        }
    
                        // remove any old event listeners for the form submission event
                        quizContainer.removeEventListener('submit', formSubmitHandler);               
    
                        // add the form submit event handler
                        quizContainer.addEventListener('submit', formSubmitHandler);
                    }
                })();

            }else{
                console.error("Failed to load quiz html");
            }

        })
        .catch(error => console.error('Error loading quiz:', error));
    }
}

function previousPage(subtopicId, pageNumber ){
    if (pageNumber > 1){
        pageNumber  --;
        loadQuizQuestionsAndAnswers(subtopicId, pageNumber);
    }
}

function nextPage(subtopicId, pageNumber, totalPages){
    if (pageNumber < totalPages){
        pageNumber ++;
        loadQuizQuestionsAndAnswers(subtopicId, pageNumber);
    }    
}

// add event listener to the form
function formSubmitHandler(e){
    e.preventDefault();
    if (e.target && e.target.id === 'quiz'){
        let previouslyAnswered = false;
        const studentAnswers = [];
        processQuizQuestion(studentAnswers, previouslyAnswered);
    }
};

async function getStudentAnswer(subtopicId, questionId){
    const route = `/quizes/home/get_student_answer/${subtopicId}/${questionId}`;   
    try {
        const response = await fetch(route);
        const data = await response.json();
        
        if (data.success) {
            return data.student_answers_list;
        } else {
            return data.student_answers_list; 
        }
    } catch (error) {
        console.error("Error fetching student answers:", error);
        return null;
    }
}

async function processQuizQuestion(selectedAnswers, previouslyAnswered){
    const subtopicId = document.getElementById('quizsubtopic-id').value;
    const questionId = document.getElementById('quizquestion-id').value;
            
    // retrieve the quiz answers from the form if question not previously answered
    if (!previouslyAnswered){
        selectedAnswers = [];
        
        const checkedAnswers = document.querySelectorAll("input[name^='question-']:checked");
        checkedAnswers.forEach((answer) => {
            selectedAnswers.push(answer.value); // value = choice.id
        });
    }
    
    const route = `/quizes/home/process_quiz_question/${subtopicId}`;

    // Retrieve the django CSRF token from the form
    var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {        
        const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                selected_answers: selectedAnswers,
                question_id: questionId,
                previously_answered: previouslyAnswered
            }),
        });
        
        const data = await response.json();

        if (data.success) {
            // Handle correct/incorrect answers
            
            let incorrectAnswer = false;
            if (data.question_type === 'True/False' || data.question_type === 'Multiple Choice'){
                incorrectAnswer = Object.values(data.results_dict).some(result => !result.is_correct);
            }else if (data.question_type === 'Multiple Answer'){
                // For multiple-answer questions, check if:
                // 1. Any selected answer is incorrect, or
                // 2. Any correct answer was not selected by the student
                incorrectAnswer = Object.values(data.results_dict).some(result => 
                    (!result.is_correct && result.selected_by_student) ||  // Incorrect answer was selected
                    (result.is_correct && !result.selected_by_student)     // Correct answer was not selected
                );
            }

            // update the progress bar
            document.getElementById(`circle-${questionId}`).style.display = 'none';
            document.getElementById(`check-${questionId}`).style.display = incorrectAnswer ? 'none' : 'block';
            document.getElementById(`times-${questionId}`).style.display = incorrectAnswer ? 'block' : 'none';

            // if new question, update right and wrong answer totals
            if (!previouslyAnswered){
                quizState.questionsAnswered ++;
                
                if (incorrectAnswer) {
                    quizState.incorrectAnswers++;
                } else {
                    quizState.correctAnswers++;
                }
            }          

            // make sure the submit button is hidden so the form can't be resubmitted
            const submitButton = document.getElementById('submit-quiz-question');
            if (submitButton){
                submitButton.style.display = 'none';
            }

            // Highlight correct/incorrect answers
            highlightAnswers(data.results_dict, data.question_type); 
            
            // Load explanation           
            //await loadQuizQuestionExplanation(questionId, subtopicId); 

            if (!previouslyAnswered){
                // create a list to hold all the async promises
                const promises = [];

                // Create or update progress record first, then save the student answer for later review
                if (data.progress_data.progress_exists === 'yes') {
                    promises.push(updateProgressRecord(subtopicId)); // Wait for progress record to update
                } else {
                    promises.push(createProgressRecord(subtopicId)); // Wait for progress record to be created
                }

                // save the student answer in the StudentAnswer model
                promises.push(saveAnswer(questionId, data.student_answers));

                // explanation, if it exists
                //promises.push(loadQuizQuestionExplanation(questionId, subtopicId));

                // ensure all database actions are complete before proceeding
                await Promise.all(promises);
            } //else if (previouslyAnswered){
                // Load explanation           
                //await loadQuizQuestionExplanation(questionId, subtopicId);    
            //}

            await loadQuizQuestionExplanation(questionId, subtopicId);          
            

            console.log(`questionsAnswered: ${quizState.questionsAnswered}, questionCount: ${quizState.questionCount}`);
            if (!previouslyAnswered){
                // if the quiz is complete
                if (quizState.questionCount == quizState.questionsAnswered){
                    await processCompletedQuiz(subtopicId);
                }
            }

        } else {
            clearMessages();
            document.getElementById('quiz-msg').innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
        }        
    } catch (error) {        
        console.error('Error processing quiz answers:', error);        
    }
}

function highlightAnswers(results_dict, questionType){    
    // loop over each key, value pair in results_dict
    for (const [choice_id, result] of Object.entries(results_dict)){
        const choiceElement = document.getElementById(`span-${choice_id}`);
        
        if (!choiceElement){
            continue;
        }

        // check if the choice was selected by the student
        if (result.selected_by_student){
            if (result.is_correct){
                choiceElement.style.backgroundColor = "rgba(0, 128, 0, 0.5)";
            }else{
                choiceElement.style.backgroundColor = "rgba(255, 0, 0, 0.5)";    
            }
        }else if(result.is_correct){
            // answer not selected by the student
            if (questionType === 'Multiple Answer'){
                choiceElement.style.backgroundColor = "yellow";
            }else{
                choiceElement.style.backgroundColor = "rgba(0, 128, 0, 0.5)";
            }
        }
    }

}

async function createProgressRecord(subtopicId){
    const route = `/quizes/home/create_progress_record/${subtopicId}`;

    // Retrieve the django CSRF token from the form
    var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
        const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log("Progress record successfully added");
        } else {
            console.error("Error adding progress record:", data.messages[0].message);
        }
    } catch (error) {
        console.error('Error in createProgressRecord:', error);
    }
}

async function updateProgressRecord(subtopicId) {
    const route = `/quizes/home/update_progress_record/${subtopicId}`;
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
        const response = await fetch(route, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log("Progress record successfully updated");
        } else {
            console.error("Error updating progress record:", data.messages[0].message);
        }
    } catch (error) {
        console.error('Error in updateProgressRecord:', error);
    }
}

async function saveAnswer(questionId, studentAnswers){
    const route = `/quizes/home/save_answer/${questionId}`
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    try {
        const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                student_answers: studentAnswers
            }),
        });

        const data = await response.json();

        if (data.success){
            console.log('StudentAnswer record updated or created');
        }else{
            console.error("Error updating or creating StudentAnswer record:", data.messages[0].message);
        }

    } catch (error){
        console.error('Error saving student answer:', error);
    }
}

async function loadQuizQuestionExplanation(questionId, subtopicId) {
    const explanationContainer = document.getElementById('explanation-container');
    explanationContainer.innerHTML = '';
        
    try {
        const response = await fetch(`/quizes/home/load_quiz_question_explanation/${questionId}`);
        const data = await response.json();

        if (data.success) {
            //console.log('Explanation fetched:', data.quiz_explanation_html);

            explanationContainer.innerHTML = data.quiz_explanation_html;
            //explanationContainer.offsetHeight; // Force reflow
            // Delay the insertion of explanation content

            //setTimeout(() => {
            //    explanationContainer.innerHTML = data.quiz_explanation_html;
                // Optional: Force reflow if needed
            //    explanationContainer.offsetHeight; 
            //}, 50); // Adjust the delay as needed (e.g., 50ms)
           
            // add event listeners to the previous and next buttons
            // if there isn't a previous quiz question, hide the previous button;
            // else display the button and add an event listener              
            const previousButtonBottom = document.getElementById('previous-button-bottom');
            if (previousButtonBottom){
                if (quizState.hasPrevious){
                    previousButtonBottom.classList.remove('hidden');

                    // remove the old event listener to prevent multiple event listeners for the same button
                    previousButtonBottom.removeEventListener('click', previousPageHandler);

                    // define previousPageHandler
                    function previousPageHandler(){
                        previousPage(subtopicId, quizState.pageNumber);    
                    }
                    // add the event listener
                    previousButtonBottom.addEventListener('click', previousPageHandler);
                }else{
                    previousButtonBottom.classList.add('hidden');
                }
            }   
                
            // if there isn't a next quiz question, hide the next button;
            // else display the button and add an event listener
            const nextButtonBottom = document.getElementById('next-button-bottom');
            if (nextButtonBottom){
                if (quizState.hasNext){
                    nextButtonBottom.classList.remove('hidden');

                    // remove the old event listener to prevent multiple event listeners for the same button
                    nextButtonBottom.removeEventListener('click', nextPageHandler);

                    // define nextPageHandler
                    function nextPageHandler(){
                        nextPage(subtopicId, quizState.pageNumber, quizState.totalPages);    
                    }
                        // add the event handler to the next button
                    nextButtonBottom.addEventListener('click', nextPageHandler);
                }else{
                    nextButtonBottom.classList.add('hidden');                        
                }
            }
        } else {
            
            console.error('There is no explanation for this question:', data.messages);
        }
    } catch (error) {
        console.error('Error loading explanation:', error); 
    }
}

async function resumeQuiz(subtopicId){
    // get all the previous answers
    const answerQuestionIds = await getPreviousStudentAnswers(subtopicId);
    
    // get the answer choice ids
    for (const questionId of answerQuestionIds){
        let studentAnswers = await getStudentAnswer(subtopicId, questionId);

        await updateProgressBar(subtopicId, questionId, studentAnswers);
        
    }

    // get the first unanswered quiz question
    getFirstUnansweredQuestion();
}

async function reviewQuiz(subtopicId){
    // get all the previous answers
    const answerQuestionIds = await getPreviousStudentAnswers(subtopicId);
    
    // get the answer choice ids
    for (const questionId of answerQuestionIds){
        let studentAnswers = await getStudentAnswer(subtopicId, questionId);

        await updateProgressBar(subtopicId, questionId, studentAnswers);
        
    }

    loadQuizQuestionsAndAnswers(subtopicId, pageNumber=1);
}

async function getPreviousStudentAnswers(subtopicId){
    const route = `/quizes/home/get_previous_student_answers/${subtopicId}`;
    try {
        const response = await fetch(route);
        const data = await response.json();
        if (data.success) {
            return data.answer_question_ids;
        } else {
            // Handle the error case if needed
            return [];
        }
    } catch (error) {
        console.error("Error fetching student answers:", error);
        return [];
    }
}

async function updateProgressBar(subtopicId, questionId, studentAnswers){
    const route = `/quizes/home/get_previous_results/${subtopicId}`;

    try{
        const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify({
                student_answers: studentAnswers,
                question_id: questionId,
            }),
        });
        
        const data = await response.json();
        if (data.success){
            // Handle correct/incorrect answers
            
            let incorrectAnswer = false;
            if (data.question_type === 'True/False' || data.question_type === 'Multiple Choice'){
                incorrectAnswer = Object.values(data.results_dict).some(result => !result.is_correct);
            }else if (data.question_type === 'Multiple Answer'){
                // For multiple-answer questions, check if:
                // 1. Any selected answer is incorrect, or
                // 2. Any correct answer was not selected by the student
                incorrectAnswer = Object.values(data.results_dict).some(result => 
                    (!result.is_correct && result.selected_by_student) ||  // Incorrect answer was selected
                    (result.is_correct && !result.selected_by_student)     // Correct answer was not selected
                );
            }

            // update the progress bar
            document.getElementById(`circle-${questionId}`).style.display = 'none';
            document.getElementById(`check-${questionId}`).style.display = incorrectAnswer ? 'none' : 'block';
            document.getElementById(`times-${questionId}`).style.display = incorrectAnswer ? 'block' : 'none';

            // update the number of correct and incorrect answers
            quizState.questionsAnswered ++;
            if (incorrectAnswer) {
                quizState.incorrectAnswers++;
            } else {
                quizState.correctAnswers++;
            }

        }else{
            clearMessages();
            document.getElementById('quiz-msg').innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
        }

    }catch(error){        
        console.error('Error retrieving previous quiz answers:', error);        
    }

}

function getFirstUnansweredQuestion(){
    const progressContainer = document.getElementById('progress-container');
    
    if (progressContainer){
        const questionLinks = document.querySelectorAll('#progress-container a');
        for (let link of questionLinks){
            const subtopicId = link.getAttribute('data-subtopic-id');
            const questionId = link.getAttribute('data-question-id');
            const circleIcon = document.getElementById(`circle-${questionId}`);

            // if the circle icon is still visible, it is an unanswered question
            if (circleIcon && window.getComputedStyle(circleIcon).display !== 'none') {
                const pageNumber = link.getAttribute('data-page');
                loadQuizQuestionsAndAnswers(subtopicId, pageNumber);
                
                // exit the loop after the first unanswered question is found
                return;
            }

        }
    }
}

async function processCompletedQuiz(subtopicId){
    viewQuizResults = document.getElementById('view-quiz-results');
    const route = `/quizes/home/process_completed_quiz/${subtopicId}`
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    try {
        const response = await fetch(route, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify({
                question_count: quizState.questionCount,
                correct_answers: quizState.correctAnswers,
            }),
        });

        const data = await response.json();

        if (data.success){
            // display the view quiz results button and add an event listener
            if (viewQuizResults){
                viewQuizResults.style.display = 'block';
                viewQuizResults.addEventListener('click', function(e){
                    e.preventDefault();
                    displayQuizScore(data.quiz_score_html);
                })
            }
        }else{
            console.error("Error updating progress record:", data.messages[0].message);
        }

    } catch (error){
        console.error('Error saving quiz scorer:', error);
    }
}

function displayQuizScore(quizScoreHTML){
    // blank out the containers
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';

    const explanationContainer = document.getElementById('explanation-container');
    explanationContainer.innerHTML = '';

    const quizScoreContainer = document.getElementById('quiz-score-container');
    quizScoreContainer.style.display = 'block';
    quizScoreContainer.innerHTML = '';

    quizScoreContainer.innerHTML = quizScoreHTML;

}

function retakeQuiz(subtopicId, topicId, questionCount){
    const route = `/quizes/home/delete_student_answers/${subtopicId}`; 
    const buttonType = 'retake';
    
    // Retrieve the django CSRF token 
    const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success){
            quizState.questionCount = questionCount;
            loadQuizLayout(subtopicId, topicId, buttonType);

        }else{
            clearMessages();
            document.getElementById('quiz-msg').innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
        }

    })
    .catch(error => console.error('Delete Student Answer records failed:', error));
}


function initializeQuizState() {
    quizState.hasNext = false;
    quizState.hasPrevious = false;
    quizState.pageNumber = 1;
    quizState.totalPages = 0;
    quizState.correctAnswers = 0;
    quizState.incorrectAnswers = 0;
    quizState.questionCount = 0;
    quizState.questionsAnswered = 0;
}

function clearMessages(){
    const messageContainer = document.querySelector('.error-msg');
    const messageDiv = document.querySelector('.msg-div');
    if (messageContainer) {
        // Clear any existing messages
        messageContainer.innerHTML = '';
    }
    if (messageDiv) {
        // Clear any existing messages
        messageDiv.innerHTML = '';
    }
}