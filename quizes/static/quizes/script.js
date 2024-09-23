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
                            
                            console.log(subtopic.subtopic_id);
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
                            let subtopicId = subtopic.subtopic_id;

                            // retrieve user progress data
                            data = getProgressData(subtopicId);

                            // set up the status column
                            statusColumn(subtopicRow, subtopicId, data);

                            // set up the progress column
                            progressColumn(subtopicRow);

                            // set up the score column
                            scoreColumn(subtopicRow);

                            // set up the result column
                            reviewColumn(subtopicRow, subtopicId);

                            subtopicsContainer.appendChild(subtopicRow);
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
    console.log(subtopicId);
    route = `/quizes/home/get_progress_data/${subtopicId}`;
                fetch(route)
                .then(response => response.json())
                .then(data =>{
                    console.log(data.progress_exists);
                    return data;

                }) 
                .catch(error => {
                    console.error('Error fetching progress:', error);
                });   
}

function statusColumn(subtopicRow, subtopicId, data){
    const statusDiv = document.createElement('div');
    statusDiv.classList.add('col-md-2', 'col-sm-2', 'status-column');

    // start button
    //const startButton = document.createElement('button');
    //startButton.type = 'button';
    //startButton.setAttribute('id', `start-${subtopicId}`);
    //startButton.classList.add('btn', 'btn-success');
    //startButton.setAttribute('data-subtopic-id', subtopicId);
    //startButton.textContent = 'Start';
    //statusDiv.append(startButton);
    //subtopicRow.append(statusDiv);

    // add event listener to start button

    // resume button
    //const resumeButton = document.createElement('button');
    //resumeButton.type = 'button';
    //resumeButton.setAttribute('id', `review-${subtopicId}`);
    //resumeButton.classList.add('btn', 'btn-primary');
    //resumeButton.setAttribute('data-subtopic-id', subtopicId);
    //resumeButton.textContent = 'Resume';
    //statusDiv.append(resumeButton);
    //subtopicRow.append(statusDiv);

    // add event listener to resume button

    // complete span
    const completeText = document.createElement('span');
    completeText.textContent = 'Complete';
    statusDiv.appendChild(completeText);
    subtopicRow.append(statusDiv);


}

function progressColumn(subtopicRow, subtopicId){
    const progressDiv = document.createElement('div');
    progressDiv.classList.add('col-md-2', 'col-sm-2', 'progress-column');

    // no progress yet
    const progressDash = document.createElement('span');
    progressDash.textContent = 'Not Started';
    progressDiv.appendChild(progressDash);

    // if progress
    //const progressQuestionsText = document.createElement('div');
    //progressQuestionsText.setAttribute('class', 'questions-text');

    // create the first line 'Questions'
    //const questionLabel = document.createElement('span');
    //questionLabel.textContent = 'Questions';
    //progressQuestionsText.appendChild(questionLabel);

    // create the second line 'number answered of total questions'
    //const questionsProgress = document.createElement('span');
    //const numAnswered = 10;
    //const totalQuestions = 20;
    //questionsProgress.textContent = `${numAnswered} of ${totalQuestions}`;
    //progressQuestionsText.appendChild(questionsProgress);

    //progressDiv.appendChild(progressQuestionsText);

    subtopicRow.appendChild(progressDiv);

}

function scoreColumn(subtopicRow){
    const scoreDiv = document.createElement('div');
    scoreDiv.classList.add('col-md-2', 'col-sm-2', 'score-column');

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
    const initialScorePercent = 50;
    initialScore.textContent = `${initialScorePercent}%`;

    const latestScore = document.createElement('span');
    const latestScorePercent = 100;
    latestScore.textContent = `${latestScorePercent}%`;
    
    scoreResults.appendChild(initialScore);
    scoreResults.appendChild(latestScore);
    scoreText.appendChild(scoreResults);

    scoreDiv.appendChild(scoreText);
    subtopicRow.appendChild(scoreDiv);

}

function reviewColumn(subtopicRow, subtopicId){
    const reviewDiv = document.createElement('div');
    reviewDiv.classList.add('col-md-2', 'col-sm-2', 'review-column');

    // review button
    const reviewButton = document.createElement('button');
    reviewButton.type = 'button';
    reviewButton.classList.add('btn', 'btn-info', 'btn-sm');
    reviewButton.setAttribute('id', `review-${subtopicId}`)
    reviewButton.textContent = 'Review';
    reviewDiv.appendChild(reviewButton);

    // reset button
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.classList.add('btn', 'btn-danger', 'btn-sm');
    resetButton.setAttribute('id', `reset-${subtopicId}`)
    resetButton.textContent = 'Reset';
    reviewDiv.appendChild(resetButton);

    // add event listener to resume button
    subtopicRow.appendChild(reviewDiv);

}