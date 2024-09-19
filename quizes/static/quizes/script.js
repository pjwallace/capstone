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
                            subtopicDiv.setAttribute('id', `subtopic-${subtopic.suptopic_id}`);
                            subtopicDiv.classList.add('col-md-3', 'col-sm-3', 'subtopics');
                            subtopicDiv.setAttribute('data-subtopic-id', subtopic.suptopic_id);
                            subtopicDiv.textContent = subtopic.subtopic_name;
                            subtopicRow.appendChild(subtopicDiv);

                            // set up the status column
                            statusColumn(subtopicRow, subtopic.suptopic_id);

                            // set up the progress column
                            progressColumn(subtopicRow, subtopic.suptopic_id);

                            // set up the score column
                            scoreColumn(subtopicRow, subtopic.suptopic_id);

                            // set up the result column
                            resultColumn(subtopicRow, subtopic.suptopic_id);

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

function statusColumn(subtopicRow, subtopicId){
    const statusDiv = document.createElement('div');
    statusDiv.classList.add('col-md-2', 'col-sm-2', 'status-column');

    // start button
    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.setAttribute('id', `subtopic-${subtopicId}`);
    startButton.classList.add('btn', 'btn-primary');
    startButton.setAttribute('data-subtopic-id', subtopicId);
    startButton.textContent = 'Start';
    statusDiv.append(startButton);
    subtopicRow.append(statusDiv);

    // add event listener


}

function progressColumn(subtopicRow, subtopicId){
    const progressDiv = document.createElement('div');
    progressDiv.classList.add('col-md-2', 'col-sm-2', 'progress-column');
    const progressText = document.createElement('span');
    progressText.textContent = '0%';
    progressDiv.appendChild(progressText);
    subtopicRow.appendChild(progressDiv);

}

function scoreColumn(subtopicRow, subtopicId){
    const scoreDiv = document.createElement('div');
    scoreDiv.classList.add('col-md-2', 'col-sm-2', 'score-column');
    const scoreText = document.createElement('span');
    scoreText.textContent = '100%';
    scoreDiv.appendChild(scoreText);
    subtopicRow.appendChild(scoreDiv);

}

function resultColumn(subtopicRow, subtopicId){
    const reviewDiv = document.createElement('div');
    reviewDiv.classList.add('col-md-3', 'col-sm-3', 'review-column');

    // review button
    const reviewButton = document.createElement('button');
    reviewButton.type = 'button';
    reviewButton.classList.add('btn', 'btn-secondary');
    reviewButton.textContent = 'Review';
    reviewDiv.appendChild(reviewButton);

    // reset button
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.classList.add('btn', 'btn-danger');
    resetButton.textContent = 'Reset';
    reviewDiv.appendChild(resetButton);

    subtopicRow.appendChild(reviewDiv);

}