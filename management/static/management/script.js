
document.addEventListener('DOMContentLoaded', function(){
    // load subtopics for the chosen topic in the sidebar
    loadSuptopicsForTopic();

    // form submission event listeners
    document.getElementById('management-container').addEventListener('submit', function(e){
        // Ensure the event is coming from forms that are processed asynchronously
        if (e.target.getAttribute('data-fetch') === 'true') {
            e.preventDefault(); // Prevent the default form submission

            // add topic
            if (e.target.id === 'add-topic-form'){
                addTopic();
            }  
            
            // rename topic
            if (e.target.id === 'rename-topic-form'){
                renameTopic();
            }

            // add subtopic
            if (e.target.id === 'add-subtopic-form'){
                addSubtopic();
            }
            
            // rename subtopic
            if (e.target.id === 'rename-subtopic-form'){
                renameSubtopic();
            }

            // add question and choices
            if (e.target.id === 'add-question-and-choices-form'){
                addQuestionAndChoices();
            }
        }
    });

    // delete topic
    setupSelectTopicToDelete();
    setupTopicToDeleteButton(); 

    // rename subtopic
    setupSelectSubtopicToRename();

    // delete subtopic
    deleteSubtopic(); 
    
    // delect subtopic for question
    SelectSubtopicsForQuestion();
    
}); 

function loadSuptopicsForTopic(){
    // add event listener to each topic in the sidebar
    document.querySelectorAll('.topic').forEach(topicATag =>{
        topicATag.addEventListener('click', function(e){
            e.preventDefault();
            const topicId = topicATag.dataset.topicId;
            const subtopicsContainer = document.getElementById('subtopicscontainer-' + topicId);
            let downIcon = document.getElementById('caretdown-' + topicId);
            const upIcon = document.getElementById('caretup-' + topicId);

            // downIcon won't exist if there are no subtopics yet for the chosen topic
            if (!downIcon){
                downIcon = document.createElement('i');
                downIcon.classList.add('fa', 'fa-caret-down');
                downIcon.setAttribute('id', `caretdown-${topicId}`);
                downIcon.style.display = 'none';
            }
           
            // check if subtopics have already been loaded for the chosen topic
            if (subtopicsContainer.children.length > 0){
                subtopicsContainer.innerHTML = '';
                // hide the subtopics container and display the down caret
                if (subtopicsContainer.style.display === 'block'){
                    subtopicsContainer.style.display = 'none';
                    downIcon.style.display = 'block';
                    upIcon.style.display = 'none';
                    topicATag.appendChild(downIcon);
                }
               
            }else{
                // fetch subtopics for the chosen topic
                route = `/management/portal/subtopics_for_topic/${topicId}`;
                fetch(route)
                .then(response => response.json())
                .then(data =>{
                    if (data.success){
                        subtopicsContainer.innerHTML = '';
                        data.subtopics.forEach(subtopic =>{
                            const subtopicATag = document.createElement('a');
                            subtopicATag.setAttribute('href', '#');
                            subtopicATag.setAttribute('id', `subtopic-${subtopic.id}`);
                            subtopicATag.setAttribute('class', 'subtopic');
                            subtopicATag.setAttribute('data-subtopic-id', subtopic.id);
                            subtopicATag.textContent = subtopic.name;

                            // create a span for the question icon and badge.
                            // This will display the number of questions for each subtopic
                            const iconSpan = document.createElement('span');
                            iconSpan.setAttribute('class', 'icon-with-badge');

                            // create the question mark icon
                            const questionIcon = document.createElement('i');
                            questionIcon.setAttribute('class', 'fas fa-question-circle');

                            // Create the badge element to display the number of questions
                            const badge = document.createElement('span');
                            badge.setAttribute('class', 'badge');
                            badge.textContent = subtopic.question_count;

                            // Append the question icon and badge to the icon span
                            iconSpan.appendChild(questionIcon);
                            iconSpan.appendChild(badge);

                            // Append the icon span to the subtopic link
                            subtopicATag.appendChild(iconSpan);
                            
                            subtopicsContainer.appendChild(subtopicATag); 
                        });
                        subtopicsContainer.style.display = 'block';

                        // toggle the caret icons
                        downIcon.style.display = 'none';
                        upIcon.style.display = 'block';

                    }else{
                        alert('This topic has no subtopics yet.');
                    }
                })
                .catch(error => console.error('Error loading the form:', error));
            }
        })

    })
}   

function addTopic(){
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
            // update the sidebar with the new topic 
            const sidebar = document.querySelector('.sidebar');
            const aTag = document.createElement('a');
            aTag.setAttribute('href', '#');
            aTag.setAttribute('id', `topic-${data.topic_id}`);
            aTag.setAttribute('class', 'topic');
            aTag.setAttribute('data-topic-id', data.topic_id);
            aTag.textContent = data.topic_name;
            sidebar.appendChild(aTag);      
            
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

function renameTopic(){
    const route = `/management/portal/rename_topic`;

    // Retrieve the django CSRF token from the form
    var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(route, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
            old_topic_id : document.getElementById('rename-topic').value,
            new_topic_name : document.getElementById('new-topic-name').value               
        })
    })   
    .then(response => response.json())
    .then(data =>{
        document.getElementById('rename-topic-form').reset(); // reset the form
        
        if (data.success){  
            // update the topic select menu to reflect the name change
            updateTopicSelectMenu(); 
            
            // update the sidebar with the new topic name
            const aTag = document.getElementById(`topic-${data.topic_id}`);
            aTag.textContent = data.renamed_topic;
            
            // display success message
            let rename_topic_msg = document.getElementById('rename-topic-msg');
            rename_topic_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
            
        } else {
            // errors
            let rename_topic_msg = document.getElementById('rename-topic-msg');
            rename_topic_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
        }
        
    })
    .catch(error => console.error('Error loading the form:', error)); 
}

function updateTopicSelectMenu(){
    const route = `/management/portal/get_topics`;
    fetch(route)
    .then(response => response.json())
    .then(data =>{
        
        if (data.success){
            
            const selectTopics = document.getElementById('rename-topic');
            // clear the existing subtopic options
            selectTopics.innerHTML = '',  
            
            // load the new topics menu, including the placeholder option
            selectTopics.innerHTML = '<option value="" selected ="">---------</option>';
            data.topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic.id;
                option.textContent = topic.name;
                selectTopics.appendChild(option);
            }); 
             
        }else{
            // error occurred while retrieving topics
            let rename_topic_msg = document.getElementById('rename-topic-msg');
            rename_topic_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
        }
    })

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
         
function addSubtopic(){
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
            // reset the add subtopic form
            document.getElementById('add-subtopic-form').reset();

            // update the sidebar with the new subtopic
            const topicId = data.topic_id;
            const subtopicsContainer = document.getElementById('subtopicscontainer-' + topicId);
            const topicATag = document.getElementById('topic-' + topicId);
            let upIcon = document.getElementById('caretup-' + topicId);
            let downIcon = document.getElementById('caretdown-' + topicId);            

            // if this is the first subtopic for the topic, enable the subtopics container and up caret
            if (subtopicsContainer.children.length == 0){
                subtopicsContainer.innerHTML = '';
                // enable the subtopics container and display the up caret
                subtopicsContainer.style.display = 'block'; 
                upIcon.style.display = 'block'; 
                downIcon.style.display = 'none';                
            }

            const subtopicATag = document.createElement('a');
            subtopicATag.setAttribute('href', '#');
            subtopicATag.setAttribute('id', `subtopic-${data.subtopic_id}`);
            subtopicATag.setAttribute('class', 'subtopic');
            subtopicATag.setAttribute('data-subtopic-id', data.subtopic_id);
            subtopicATag.textContent = data.subtopic_name;
            subtopicsContainer.appendChild(subtopicATag); 

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

function renameSubtopic(){
    const route = `/management/portal/rename_subtopic`;

    // Retrieve the django CSRF token from the form
    var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(route, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
            subtopic_id : document.getElementById('choose-subtopic-to-rename').value,
            new_subtopic_name : document.getElementById('new-subtopic-name').value               
        })
    })   
    .then(response => response.json())
    .then(data =>{
        document.getElementById('rename-subtopic-form').reset(); // reset the form
        
        if (data.success){  
            clearMessages();

            // update the sidebar
            const subtopicATag = document.getElementById(`subtopic-${data.subtopic_id}`);
            subtopicATag.textContent = data.new_subtopic_name;

            // display success message
            let rename_subtopic_msg = document.getElementById('rename-subtopic-msg');
            rename_subtopic_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
            
        } else {
            // errors
            let rename_subtopic_msg = document.getElementById('rename-subtopic-msg');
            rename_subtopic_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
        }
        
    })
    .catch(error => console.error('Error loading the form:', error)); 
    
}

function deleteSubtopic(){
    setupSelectSubtopicToDelete();
    setupSubtopicToDeleteButton(); 
}



function editQuestionAndChoices(){
    //pass
}

function delete_question(){
    //pass
}


function setupSelectSubtopicToRename(){
    const renameSubtopicButton = document.getElementById('rename-subtopic-btn');
    const selectTopicForRenamedSubtopic = document.getElementById('topic-for-renamed-subtopic');
    const selectSubtopicToRename = document.getElementById('choose-subtopic-to-rename');
    
    if (selectTopicForRenamedSubtopic){
        // must be at least one valid topic
        const validTopicOptions = selectTopicForRenamedSubtopic.options.length > 1;

        if (!validTopicOptions){
            displayMessage('There are no topics or subtopics to rename.', 'info');
            return;
        }

        // add event listeneer for the topic dropdown menu
        selectTopicForRenamedSubtopic.addEventListener('change', function(){
            const selectedTopicId = selectTopicForRenamedSubtopic.value;
            if (!selectedTopicId){
                displayMessage('There are no topics/subtopics to rename.', 'info');
                return;
            } else{
                
                //renameSubtopicButton.setAttribute('data-topic-id', selectedTopicId);
                getSubtopicsToRename(selectedTopicId, selectSubtopicToRename);
            }

        })
    }

}

function getSubtopicsToRename(selectedTopicId, selectSubtopicToRename){
    // get the subtopics for the chosen topic to populate the subtopics dropdown menu
    const route = `/management/portal/get_subtopics/${selectedTopicId}`;

    fetch(route)
    .then(response => response.json())
    .then(data =>{
        
        if (data.success){
            // clear the existing subtopic options
            selectSubtopicToRename.innerHTML = '',

            // load the new subtopics, including the placeholder option
            selectSubtopicToRename.innerHTML = '<option value="" selected ="">--------</option>';
            data.subtopics.forEach(subtopic => {
                const option = document.createElement('option');
                option.value = subtopic.id;
                option.textContent = subtopic.name;
                selectSubtopicToRename.appendChild(option);
            }); 
            
            const validSubtopicOptions = selectSubtopicToRename.options.length > 1;

                if (!validSubtopicOptions){
                    let rename_subtopic_msg = document.getElementById('rename-subtopic-msg');
                    if (rename_subtopic_msg){
                        rename_subtopic_msg.innerHTML = '';
                    }
                    clearMessages();
                    displayMessage('There are no available subtopics for the chosen topic', 'info');
                    return;
                }
        }else{
            let rename_subtopic_msg = document.getElementById('rename-subtopic-msg');
            if (rename_subtopic_msg){
                rename_subtopic_msg.innerHTML = '';
            }
            clearMessages();
            displayMessage('There are no available subtopics for the chosen topic', 'info');
            return;    
        } 
    })

}

function setupSelectSubtopicToDelete(){
    const deleteSubtopicButton = document.getElementById('delete-subtopic-btn');
    const selectTopic = document.getElementById('topic-to-choose');
    const selectSubtopic = document.getElementById('subtopic-to-choose');
   

    if (selectTopic){
        // must be at least one valid topic
        const validOptions = selectTopic.options.length > 1;

        if (!validOptions){
            displayMessage('There are no topics or subtopics to delete.', 'info');
            return;
        }

        selectTopic.addEventListener('change', function(){
            const selectedTopicId = selectTopic.value;
            
            if (!selectedTopicId){
                deleteSubtopicButton.disabled = true;
                displayMessage('There are no topics to delete.', 'info');
                return;
            } else{
                
                deleteSubtopicButton.setAttribute('data-topic-id', selectedTopicId);
                getSubtopicsToDelete(selectedTopicId, selectSubtopic, deleteSubtopicButton);
            }
        })
        
    }

}

function setupSubtopicToDeleteButton(){
    const deleteSubtopicButton = document.getElementById('delete-subtopic-btn');
    
    // add event listener
    if (deleteSubtopicButton){
        deleteSubtopicButton.addEventListener('click', function(e){
            e.preventDefault();
            const topicId = this.getAttribute('data-topic-id');
            const subtopicId = this.getAttribute('data-subtopic-id');
            displaySubtopicDeleteConfirmation(topicId, subtopicId)
        })
        
    }
}


function getSubtopicsToDelete(selectedTopicId, selectSubtopic, deleteSubtopicButton){
    // get the subtopics for the chosen topic to populate the subtopics dropdown menu
    const route = `/management/portal/get_subtopics/${selectedTopicId}`;

    fetch(route)
    .then(response => response.json())
    .then(data => {
        if (data.success){
            // clear the existing subtopic options
            selectSubtopic.innerHTML = '',

            // load the new subtopics, including the placeholder option
            selectSubtopic.innerHTML = '<option value="" selected ="">--------</option>';
            data.subtopics.forEach(subtopic => {
                const option = document.createElement('option');
                option.value = subtopic.id;
                option.textContent = subtopic.name;
                selectSubtopic.appendChild(option);
            });  
        
            if (selectSubtopic){
                const validSubtopicOptions = selectSubtopic.options.length > 1;

                if (!validSubtopicOptions){
                    displayMessage('There are no available subtopics for the chosen topic', 'info');
                    return;
                }

                // add eventlistener to the subtopic dropdown menu
                selectSubtopic.addEventListener('change', function(){
                    const selectedSubtopicId = this.value;
                    
                    if (!selectedSubtopicId){
                        deleteSubtopicButton.disabled = true;
                        displayMessage('There are no available subtopics for the chosen topic', 'info');
                        return;
                    } else {
                        deleteSubtopicButton.disabled = false;
                        deleteSubtopicButton.setAttribute('data-subtopic-id', selectedSubtopicId);
                    }
                })
            }
        }else{
            displayMessage('There are no available subtopics for the chosen topic', 'info');
            return;    
        }      

    })
}

function displaySubtopicDeleteConfirmation(topicId, subtopicId){
    topicId = parseInt(topicId); 
    subtopicId = parseInt(subtopicId);  
    const route = `/management/portal/delete_subtopic_confirmation/${topicId}/${subtopicId}`;  
    
    fetch(route)
        .then(response => response.text())
        .then(html => {
            const managementContainer = document.getElementById('management-container');
            
            if (managementContainer){
                managementContainer.innerHTML = html;
                managementContainer.style.display = 'block';
                
            } else{
                console.error("delete-subtopic-confirm-container not found in the document.");
            }                       
        })
        .catch(error => console.error('Error loading the confirmation:', error));   
}

function addQuestionAndChoices(){
    const route = `/management/portal/add_question_and_choices`;

    // Retrieve the django CSRF token from the form
    var csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
            subtopic_id : document.getElementById('subtopic-for-question').value,
            question_text : document.getElementById('new-question').value,  
            question_type : document.getElementById('question-type').value            
        })
    })   
    .then(response => response.json())
    .then(data => {
        document.getElementById('add-question-and-choices-form').reset(); // reset the form
        console.log(data);
        if (data.success){  
            

            // update the sidebar
            //const subtopicATag = document.getElementById(`subtopic-${data.subtopic_id}`);
            //subtopicATag.textContent = data.new_subtopic_name;

            // display success message
            let add_question_and_choices_msg = document.getElementById('add-question-and-choices-msg');
            add_question_and_choices_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
            
        } else {
            // errors
            let add_question_and_choices_msg = document.getElementById('add-question-and-choices-msg');
            add_question_and_choices_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
        }
    })

}

function SelectSubtopicsForQuestion(){
    //const renameSubtopicButton = document.getElementById('rename-subtopic-btn');
    const topicMenu = document.getElementById('topic-for-question');
    const subtopicMenu = document.getElementById('subtopic-for-question');
    
    if (topicMenu){
        // must be at least one valid topic
        const validTopicOptions = topicMenu.options.length > 1;

        if (!validTopicOptions){
            displayMessage('There are no topics available.', 'info');
            return;
        }

        // add event listeneer for the topic dropdown menu
        topicMenu.addEventListener('change', function(){
            const selectedTopicId = topicMenu.value;
            
            if (!selectedTopicId){
                displayMessage('There are no topics available.', 'info');
                return;
            } else{            
                getSubtopics(selectedTopicId, subtopicMenu);
            }

        })
    }
}

// Helper functions

function getSubtopics(selectedTopicId, subtopicMenu){
    // get the subtopics for the chosen topic to populate the subtopics dropdown menu
    const route = `/management/portal/get_subtopics/${selectedTopicId}`;
    
    fetch(route)
    .then(response => response.json())
    .then(data =>{
        
        if (data.success){
            // clear the existing subtopic options
            subtopicMenu.innerHTML = '',
           
            // load the new subtopics, including the placeholder option
            subtopicMenu.innerHTML = '<option value="" selected ="">--------</option>';
            data.subtopics.forEach(subtopic => {
                const option = document.createElement('option');
                option.value = subtopic.id;
                option.textContent = subtopic.name;
                subtopicMenu.appendChild(option);
            }); 
            
            const validSubtopicOptions = subtopicMenu.options.length > 1;

                if (!validSubtopicOptions){
                    let add_question_and_choices_msg = document.getElementById('add-question-and-choices-msg');
                    if (add_question_and_choices_msg){
                        add_question_and_choices_msg.innerHTML = '';
                    }
                    clearMessages();
                    displayMessage('There are no available subtopics for the chosen topic', 'info');
                    return;
                }
        }else{
            let add_question_and_choices_msg = document.getElementById('rename-subtopic-msg');
            if (add_question_and_choices_msg){
                add_question_and_choices_msg.innerHTML = '';
            }
            clearMessages();
            displayMessage('There are no available subtopics for the chosen topic', 'info');
            return;    
        } 
    })

}

function displayMessage(message, type) {
    const messageContainer = document.querySelector('.error-msg');
    if (messageContainer) {
        // Clear any existing messages
        messageContainer.innerHTML = '';

        // insert the new message
        messageContainer.insertAdjacentHTML('beforeend', `<div class="alert alert-${type}" role="alert">${message}</div>`);
    }
}

function clearMessages(){
    const messageContainer = document.querySelector('.error-msg');
    if (messageContainer) {
        // Clear any existing messages
        messageContainer.innerHTML = '';
    }
}