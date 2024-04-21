
document.addEventListener('DOMContentLoaded', function(){
     // form submission event listeners
     document.getElementById('management-container').addEventListener('submit', function(e){
        // Ensure the event is coming from forms that are processed asynchronously
        if (e.target.getAttribute('data-fetch') === 'true') {
            e.preventDefault(); // Prevent the default form submission

            // add topic
            if (e.target.id === 'add-topic-form') {
                add_topic();
            }  
            
            // delete topic
            

            // add subtopic
            if (e.target.id === 'add-subtopic-form'){
                add_subtopic();
            }
            
            // other forms go here
        }
    });

    
    setupSelectTopicToDelete();
    setupTopicToDeleteButton(); 
     
    
});  
   

function add_topic(){
    const route = `/management/portal/add_topic`;

    // Retrieve the django CSRF token from the form
    var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
            name : document.getElementById('new-topic').value,
                
        })
    })
    
    .then(response => response.json())
    .then(data => {
        document.getElementById('add-topic-form').reset(); // reset the form
        if (data.success){          
            
            // display success message
            let add_topic_msg = document.getElementById('add-topic-msg');
            add_topic_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;

        } else {
            // errors
            let add_topic_msg = document.getElementById('add-topic-msg');
            add_topic_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
        }
                             
    })
    .catch(error => console.error('Error loading the form:', error));   

}

function edit_topic(){
    //pass
}

function setupSelectTopicToDelete(){
    // form select menu event listener
    const selectTopicToDelete = document.getElementById('topic-to-delete');
    const deleteTopicButton = document.getElementById('delete-topic-btn');

    // Check if the delete button exists before setting properties
    if (!deleteTopicButton) {
        return;  // Early exit to avoid further errors
    }
    
    // Ensure the delete button is initially disabled
    deleteTopicButton.disabled = true;
    
    if (selectTopicToDelete){
        // at least one valid topic available
        const validOptions = selectTopicToDelete.options.length > 1;

        if (!validOptions) {
            displayMessage('There are no more topics to delete.', 'info');  
            return;  // No further setup needed if there are no valid topics
        }

        selectTopicToDelete.addEventListener('change', function() {
                    
            const selectedTopicId = this.value; // Gets the selected option's value (topic ID)

            if (!selectedTopicId) {
                deleteTopicButton.disabled = true;  // If no valid topic, disable the button
                displayMessage('There are no more topics to delete.', 'info');  
                return; 

            } else {
                // Otherwise, enable the button and set the topic ID
                deleteTopicButton.disabled = false;

                // Update the deleteTopicButton with the topic.id to be deleted
                deleteTopicButton.setAttribute('data-topic-id', selectedTopicId); 
            }
            
        });
    } 

}

function setupTopicToDeleteButton(){
    const deleteTopicButton = document.getElementById('delete-topic-btn');

    // form delete button event listeners
    if (deleteTopicButton) {
        deleteTopicButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent form submission when delete button is clicked

            // data attribute is set in the setupSelectTopicToDelete function
            const topicId = this.getAttribute('data-topic-id');
            
            if (topicId) {
                // display topic delete confirmation screen               
                displayTopicDeleteConfirmation(topicId);
            }
        });
    }   

}

function displayMessage(message, type) {
    const messageContainer = document.querySelector('.error-msg');
    if (messageContainer) {
        messageContainer.insertAdjacentHTML('beforeend', `<div class="alert alert-${type}" role="alert">${message}</div>`);
    }
}

function displayTopicDeleteConfirmation(topicId){
    topicId = parseInt(topicId);  
    const route = `/management/portal/delete_topic_confirmation/${topicId}`;  
    
    fetch(route)
        .then(response => response.text())
        .then(html => {
            const managementContainer = document.getElementById('management-container');
            
            if (managementContainer){
                managementContainer.innerHTML = html;
                managementContainer.style.display = 'block';
                
            } else{
                console.error("delete-topic-confirm-container not found in the document.");
            }                       
        })
        .catch(error => console.error('Error loading the confirmation:', error));
}
         
function add_subtopic(){
    const route = `/management/portal/add_subtopic`;

    // Retrieve the django CSRF token from the form
    var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
            topic : document.getElementById('topic-name').value,
            name : document.getElementById('new-subtopic').value,
                
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success){

            // reset the form
            document.getElementById('add-subtopic-form').reset();

            // display success message
            let add_subtopic_msg = document.getElementById('add-subtopic-msg');
            add_subtopic_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;

        } else {
            // errors
            document.getElementById('new-subtopic').value = ''; // clear out the subtopic name field
            document.getElementById('new-subtopic').focus();
            let add_subtopic_msg = document.getElementById('add-subtopic-msg');
            add_subtopic_msg.innerHTML = ''; // clear out any old messages
            add_subtopic_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;

        }
                             
    })
    .catch(error => console.error('Error loading the form:', error));
}

function edit_subtopic(){
    //pass
}

function delete_subtopic(){
    //pass
}

function add_question(){
    //pass
}

function edit_question(){
    //pass
}

function delete_question(){
    //pass
}

function add_choice(){
    //pass
}

function edit_choice(){
    //pass
}

function delete_choice(){
    //pass
}