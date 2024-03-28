
document.addEventListener('DOMContentLoaded', function () {
  
    document.getElementById('management-container').addEventListener('submit', function(e){
        // Ensure the event is coming from a form within the container
        if (e.target.tagName === 'FORM') {
            e.preventDefault(); // Prevent the default form submission
            
            if(e.target.id === 'add-topic-form') {
                add_topic();
            }

            if(e.target.id === 'add-subtopic-form'){
                add_subtopic();
            }
            
            // other forms go here
        }
    });
    
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

function delete_topic(){
    //pass
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
            let msg_div = document.getElementById('msg-div');
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