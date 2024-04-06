
document.addEventListener('DOMContentLoaded', function(){
     // form submission event listeners
     document.getElementById('management-container').addEventListener('submit', function(e){
        // Ensure the event is coming from a form within the container
        if (e.target.tagName === 'FORM') {
            e.preventDefault(); // Prevent the default form submission

            // add topic
            if (e.target.id === 'add-topic-form') {
                add_topic();
            }

            // delete topic
            if (e.target.id === 'delete-topic-form'){                                                     
                    delete_topic(topicId);              
            };
        

            // add subtopic
            if (e.target.id === 'add-subtopic-form'){
                add_subtopic();
            }
            
            // other forms go here
        }
    });

    // form select menu event listeners
    const selectTopicToDelete = document.getElementById('topic-to-delete');
    const deleteTopicButton = document.getElementById('delete-topic-btn');

    if (selectTopicToDelete){
         
        selectTopicToDelete.addEventListener('change', function() {
                    
            const selectedTopicId = this.value; // Gets the selected option's value (topic ID)
            // Update the deleteTopicButton with the topic.id to be deleted
            deleteTopicButton.setAttribute('data-topic-id', selectedTopicId); 
            
        });
    }

    // form delete button event listeners
    if (deleteTopicButton) {
        deleteTopicButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent form submission when delete button is clicked
            const topicId = this.getAttribute('data-topic-id');
            
            if (topicId) {
                delete_topic(topicId);
            }
        });
    }   
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
        if (data.success){

            // reset the form
            document.getElementById('add-topic-form').reset();

            // display success message
            let msg_div = document.getElementById('msg-div');
            msg_div.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;

        } else {
            // errors
            let msg_div = document.getElementById('msg-div');
            msg_div.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
        }
                             
    })
    .catch(error => console.error('Error loading the form:', error));   

}

function edit_topic(){
    //pass
}

function delete_topic(topic_id){
    topic_id = parseInt(topic_id);
    
    const route = `/management/portal/delete_topic/${topic_id}`;
    console.log(route);

    // Retrieve the django CSRF token from the form
    var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(route, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
          
      })
      .then(response => response.json())
      .then(data => {
        if (data.success){
           // reset the form
            document.getElementById('delete-topic-form').reset();
            console.log('Topic deleted');
           // display success message
            let msg_div = document.getElementById('msg-div');
            msg_div.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`; 
        } else {
           // errors
            let msg_div = document.getElementById('msg-div');
            msg_div.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`; 
        }
      })
      .catch(error => console.error('Error loading the form:', error));
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
            let msg_div = document.getElementById('msg-div');
            msg_div.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;

        } else {
            // errors
            document.getElementById('new-subtopic').value = ''; // clear out the subtopic name field
            document.getElementById('new-subtopic').focus();
            let msg_div = document.getElementById('msg-div');
            msg_div.innerHTML = ''; // clear out any old messages
            msg_div.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;

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