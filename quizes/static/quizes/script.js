document.addEventListener('DOMContentLoaded', function(){
    loadSubtopicsForQuizTopic();    
}); 

function loadSubtopicsForQuizTopic(){
    // add event listener to each topic in the sidebar
    document.querySelectorAll('.topics').forEach(topicDiv =>{
        topicDiv.addEventListener('click', function(e){
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
            }else{
                // fetch subtopics for the chosen topic
                route = `/quizes/home/get_subtopics_for_quiz/${topicId}`;
                fetch(route)
                .then(response => response.json())
                .then(data =>{
                    if (data.success){
                        subtopicsContainer.innerHTML = '';
                        minusIcon.style.display = 'block';
                        plusIcon.style.display = 'none';
                        
                        minusIcon.style.display = 'block'; // Show the minus icon
                        plusIcon.style.display = 'none';   // Hide the plus icon
                       
                        data.subtopic_data.forEach(subtopic =>{
                            
                            // Create a Bootstrap row div to hold the subtopic and other columns
                            const subtopicRow = document.createElement('div');
                            subtopicRow.classList.add('row', 'subtopics-row');
                            subtopicRow.setAttribute('id', `subtopicrow-${subtopic.subtopic_id}`);

                            // create div to hold the subtopic                         
                            const subtopicDiv = document.createElement('div');                            
                            subtopicDiv.setAttribute('id', `subtopic-${subtopic.subtopic_id}`);
                            subtopicDiv.classList.add('col-md-4', 'col-sm-4', 'subtopics');
                            subtopicDiv.setAttribute('data-subtopic-id', subtopic.subtopic_id);
                            subtopicDiv.textContent = subtopic.subtopic_name;
                            subtopicRow.appendChild(subtopicDiv);

                            const subtopicId = subtopic.subtopic_id;
                            const questionCount = subtopic.subtopic_question_count;

                            // retrieve user progress data
                            getProgressData(subtopicId)
                                .then(progressData =>{
                                    // set up the status column
                                    statusColumn(subtopicRow, subtopicId, progressData, questionCount, topicId);

                                    // set up the progress column
                                    progressColumn(subtopicRow, progressData, questionCount);

                                    // set up the score column
                                    scoreColumn(subtopicRow, progressData, questionCount);

                                    // set up the review column
                                    reviewColumn(subtopicRow, subtopicId, progressData, questionCount);

                                    subtopicsContainer.appendChild(subtopicRow);
                                })
                                .catch(error => console.error('Error retrieving progress data:', error));                                                                                                        
                        })
                    }else{
                        // errors
                        let dashboard_msg = document.getElementById('dashboard-msg');
                        dashboard_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" 
                            role="alert">${data.messages[0].message}</div>`;
                    }

                })
                .catch(error => console.error('Error retrieving subtopics:', error));
            }
        })
    })    
}

function getProgressData(subtopicId){
    route = `/quizes/home/get_progress_data/${subtopicId}`;
    return fetch(route)
        .then(response => response.json())
        .then(progressData =>{
            return progressData;
        }) 
        .catch(error => {
            console.error('Error fetching progress data:', error);
        });   
}

function statusColumn(subtopicRow, subtopicId, progressData, questionCount, topicId){
    const statusDiv = document.createElement('div');
    statusDiv.classList.add('col-md-2', 'col-sm-2', 'status-column');

    // display start button if a quiz hasn't been attempted yet
    if (progressData.progress_exists == 'no'){
        const startButton = document.createElement('button');
        startButton.type = 'button';
        startButton.setAttribute('id', `start-${subtopicId}`);
        startButton.classList.add('btn', 'btn-success');
        startButton.setAttribute('data-subtopic-id', subtopicId);
        startButton.textContent = 'Start Quiz';
        statusDiv.append(startButton);
        subtopicRow.append(statusDiv);

        // add event listener to start button
        startButton.addEventListener('click', function(e){
            e.preventDefault;
            loadQuizLayout(subtopicId, topicId);
        })

    // resume quiz button
    }else if (progressData.progress_exists == 'yes' && questionCount != progressData.questions_answered){
        const resumeButton = document.createElement('button');
        resumeButton.type = 'button';
        resumeButton.setAttribute('id', `review-${subtopicId}`);
        resumeButton.classList.add('btn', 'btn-primary');
        resumeButton.setAttribute('data-subtopic-id', subtopicId);
        resumeButton.textContent = 'Resume Quiz';
        statusDiv.append(resumeButton);
        subtopicRow.append(statusDiv);

        // add event listener to resume button

    // Display quiz complete text
    }else if (progressData.progress_exists == 'yes' && questionCount == progressData.questions_answered){
        // complete span
        const completeText = document.createElement('span');
        completeText.textContent = 'Complete';
        statusDiv.appendChild(completeText);
        subtopicRow.append(statusDiv);
    }
}

function progressColumn(subtopicRow, progressData, questionCount){
    const progressDiv = document.createElement('div');
    progressDiv.classList.add('col-md-2', 'col-sm-2', 'progress-column');

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
    subtopicRow.appendChild(progressDiv);
}

function scoreColumn(subtopicRow, progressData, questionCount){
    const scoreDiv = document.createElement('div');
    scoreDiv.classList.add('col-md-2', 'col-sm-2', 'score-column');

    if (progressData.progress_exists == 'no' || progressData.questions_answered != questionCount){
        // display 2 minus signs to indicate no score yet
        const scoreDashes = document.createElement('div');
        scoreDashes.setAttribute('class', 'score-dash');

        initialMinus = document.createElement('i');
        initialMinus.classList.add('fa', 'fa-solid', 'fa-minus', 'minus-bigger');
        
        latestMinus = document.createElement('i');
        latestMinus.classList.add('fa', 'fa-solid', 'fa-minus', 'minus-bigger');

        scoreDashes.append(initialMinus);
        scoreDashes.append(latestMinus);
        scoreDiv.append(scoreDashes);

    }else if (progressData.progress_exists == 'yes' && progressData.questions_answered == questionCount ){
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
    subtopicRow.appendChild(scoreDiv);

}

function reviewColumn(subtopicRow, subtopicId, progressData, questionCount){
    const reviewDiv = document.createElement('div');
    reviewDiv.classList.add('col-md-2', 'col-sm-2', 'review-column');

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
        reviewButton.classList.add('btn', 'btn-info', 'btn-sm');
        reviewButton.setAttribute('id', `review-${subtopicId}`)
        reviewButton.textContent = 'Review';
        reviewDiv.appendChild(reviewButton);

        // retake button
        const retakeButton = document.createElement('button');
        retakeButton.type = 'button';
        retakeButton.classList.add('btn', 'btn-danger', 'btn-sm');
        retakeButton.setAttribute('id', `retake-${subtopicId}`)
        retakeButton.textContent = 'Retake';
        reviewDiv.appendChild(retakeButton);
    }

    // add event listener to review button
    subtopicRow.appendChild(reviewDiv);
}

function loadQuizLayout(subtopicId, topicId){
    const route = `/quizes/home/load_quiz_layout/${subtopicId}/${topicId}`;   
    fetch(route)
    .then(response => response.json())
    .then(data =>{
        if (data.success){
            
            // Replace the entire document (both <head> and <body>)
            document.documentElement.innerHTML = data.quiz_layout_html;

            // load the first quiz question
            loadQuizQuestionsAndAnswers(subtopicId, pageNumber=1);
        }
        else{
            console.error("Failed to load quiz layout");
        }

    })
    .catch(error => console.error('Error loading quiz layout:', error));

}

function loadQuizQuestionsAndAnswers(subtopicId, pageNumber){
    quizContainer = document.getElementById('quiz-container');
    if (quizContainer){
        const route = `/quizes/home/load_quiz_questions_and_answers/${subtopicId}?page=${pageNumber}`;   
        fetch(route)
        .then(response => response.json())
        .then(data =>{
            if (data.success){
                const hasNext = data.has_next;
                const hasPrevious = data.has_previous;
                let pageNumber  = data.page_number;
                const totalPages = data.total_pages;

                quizContainer.innerHTML = '';
                quizContainer.innerHTML = data.quiz_html;
                document.getElementById('quizsubtopic-id').value = subtopicId
                
                // if there isn't a previous quiz question, hide the previous button;
                // else display the button and add an event listener              
                previousButton = document.getElementById('previous-button');
                if (previousButton){
                    if (hasPrevious){
                        previousButton.classList.remove('hidden');

                        // remove the old event listener to prevent multiple event listeners for the same button
                        previousButton.removeEventListener('click', previousPageHandler);

                        // define previousPageHandler
                        function previousPageHandler(){
                            previousPage(subtopicId, pageNumber);    
                        }
                        // add the event listener
                        previousButton.addEventListener('click', previousPageHandler);
                    }else{
                        previousButton.classList.add('hidden');
                    }
                }   
                
                // if there isn't a next quiz question, hide the next button;
                // else display the button and add an event listener
                nextButton = document.getElementById('next-button');
                if (nextButton){
                    if (hasNext){
                        nextButton.classList.remove('hidden');

                        // remove the old event listener to prevent multiple event listeners for the same button
                        nextButton.removeEventListener('click', nextPageHandler);

                        // define nextPageHandler
                        function nextPageHandler(){
                            nextPage(subtopicId, pageNumber, totalPages);    
                        }
                         // add the event handler to the next button
                        nextButton.addEventListener('click', nextPageHandler);
                    }else{
                        nextButton.classList.add('hidden');                        
                    }
                }

                // add event listener to the form
                quizContainer.addEventListener('submit', function(e){
                    e.preventDefault();
                    if (e.target && e.target.id === 'quiz'){
                        processQuizQuestion();
                    }
                });
                
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

async function processQuizQuestion(){
    const subtopicId = document.getElementById('quizsubtopic-id').value;
    const questionId = document.getElementById('quizquestion-id').value;
    let rightAnswer = 0;
    let wrongAnswer = 0;

    // retrieve the quiz answers
    let selectedAnswers = [];
    const checkedAnswers = document.querySelectorAll("input[name^='question-']:checked");
    checkedAnswers.forEach((answer) => {
        selectedAnswers.push(answer.value); // value = choice.id
    });
    
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
            }),
        });
        
        const data = await response.json();

        if (data.success) {
            // Handle correct/incorrect answers
            let incorrectAnswer = Object.values(data.results_dict).some(result => !result.is_correct);

            document.getElementById(`circle-${questionId}`).style.display = 'none';
            document.getElementById(`check-${questionId}`).style.display = incorrectAnswer ? 'none' : 'block';
            document.getElementById(`times-${questionId}`).style.display = incorrectAnswer ? 'block' : 'none';

            incorrectAnswer ? wrongAnswer++ : rightAnswer++;

            // Highlight correct/incorrect answers
            highlightAnswers(data.results_dict, data.question_type);

            // Create or update progress record first, then save the student answer for later review
            if (data.progress_data.progress_exists === 'yes') {
            await updateProgressRecord(subtopicId); // Wait for progress record to update
            } else {
                await createProgressRecord(subtopicId); // Wait for progress record to be created
            }

            // save the student answer in the StudentAnswer model
            await saveAnswer(questionId, data.student_answers);

            // Load explanation after progress record is updated/created
            await loadQuizQuestionExplanation(questionId); // Wait for the explanation to load

        } else {
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

async function loadQuizQuestionExplanation(questionId) {
    const explanationContainer = document.getElementById('explanation-container');
        
    try {
        const response = await fetch(`/quizes/home/load_quiz_question_explanation/${questionId}`);
        const data = await response.json();

        if (data.success) {
            explanationContainer.innerHTML = '';
            explanationContainer.innerHTML = data.quiz_explanation_html; 
        } else {
            console.error('There is no explanation for this question:', data.messages);
        }
    } catch (error) {
        console.error('Error loading explanation:', error); 
    }
}