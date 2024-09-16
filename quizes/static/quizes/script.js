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
            let minusIcon = document.getElementById('minus-' + topicId);
            
            // minusIcon won't initially exist on page load so it must be created
            if (!minusIcon){
                minusIcon = document.createElement('i');
                minusIcon.classList.add('fa', 'fa-regular', 'fa-minus');
                minusIcon.setAttribute('id', `minus-${topicId}`);
                minusIcon.style.display = 'none';
            }

            // if subtopics have been loaded, when the div is clicked they shouldn't be displayed
            // and the plus sign should appear
            if (subtopicsContainer.children.length > 0){
                subtopicsContainer.innerHTML = '';
                // hide the subtopics container and display the plus sign
                if (subtopicsContainer.style.display === 'block'){
                    subtopicsContainer.style.display = 'none';
                    minusIcon.style.display = 'none';
                    plusIcon.style.display = 'block';
                    topicDiv.appendChild(plusIcon);
                }
               
            }else{
                // fetch subtopics for the chosen topic
                route = `/quizes/home/get_subtopics_for_quiz/${topicId}`;
                fetch(route)
                .then(response => response.json())
                .then(data =>{
                    if (data.success){
                        subtopicsContainer.innerHTML = '';
                        data.subtopic_data.forEach(subtopic =>{
                            subtopicsContainer.innerHTML = '';                           
                            const subtopicDiv = document.createElement('div');                            
                            subtopicDiv.setAttribute('id', `subtopic-${subtopic.suptopic_id}`);
                            subtopicDiv.classList.add('col-md-3', 'col-sm-3', 'subtopics');
                            subtopicDiv.setAttribute('data-subtopic-id', subtopic.suptopic_id);
                            subtopicDiv.textContent = subtopic.subtopic_name;
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