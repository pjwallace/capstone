
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

            // edit question and choices
            if (e.target.id === 'edit-question-form'){
                selectQuestionToEdit();
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
    
    // select subtopics for question
    SelectSubtopicsForQuestion();
    selectQuestionType();

    // add another choice to the AddChoiceForm
    addAnotherChoice();

    // select subtopics for edited question
    selectTopicForQuestionToEdit();

    // select subtopics for edited question
    selectTopicForAllQuestionsToEdit();
        
}); 

let currentOpenMenu = null; // keeps track of currently open sidebar menu

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
                            badge.setAttribute('id', `badge-${subtopic.id}`);
                            badge.textContent = subtopic.question_count;

                            // Append the question icon and badge to the icon span
                            iconSpan.appendChild(questionIcon);
                            iconSpan.appendChild(badge);

                            // Append the icon span to the subtopic link
                            subtopicATag.appendChild(iconSpan);

                            // create the div to hold the sidebar menu options
                            const sidebarMenu = document.createElement('div');
                            sidebarMenu.setAttribute('class', 'sidebar-menu dropdown-menu');
                            sidebarMenu.setAttribute('id', 'sidebarmenu-${subtopic.id');

                            // initially the menu will not be displayed
                            sidebarMenu.style.display = 'none';

                            // add menu options
                            // add a question and answer choices
                            const addQuestionOption = document.createElement('a');
                            addQuestionOption.setAttribute('class', 'dropdown-item');
                            addQuestionOption.setAttribute('id', 'dropdown-add-question');
                            addQuestionOption.setAttribute('href', '#');
                            addQuestionOption.textContent = 'Add Question/Choices';

                            addQuestionOption.addEventListener('click', function(e) {
                                e.preventDefault();
                                addQuestion(topicId, subtopic.id);
                            });

                            // Display edit/review questions menu option if question count > 0
                            let badgeValue = parseInt(badge.textContent, 10);
                            
                            const editQuestionOption = document.createElement('a');
                            editQuestionOption.setAttribute('class', 'dropdown-item');
                            editQuestionOption.setAttribute('id', 'dropdown-edit-question');
                            editQuestionOption.setAttribute('href', '#');
                            editQuestionOption.textContent = 'Edit Question/Choices';

                            editQuestionOption.addEventListener('click', function(e) {
                                e.preventDefault();
                                editQuestion(subtopic.id);
                            });
                            
                            sidebarMenu.appendChild(addQuestionOption);
                            if (badgeValue > 0){
                                sidebarMenu.appendChild(editQuestionOption);
                            }
                            //sidebarMenu.appendChild(deleteQuestionOption);

                            // Append the menu to the subtopic link
                            subtopicATag.appendChild(sidebarMenu);

                            // Add event listener to the subtopic link
                            subtopicATag.addEventListener('click', function(e) {
                                e.preventDefault();

                                 // Check if the clicked menu is the currently open menu
                                if (currentOpenMenu === sidebarMenu) {
                                    sidebarMenu.style.display = 'none';
                                    currentOpenMenu = null; // No menu is currently open
                                } else {
                                    // Hide all other submenus
                                    hideSidebarMenus();

                                    // Show the clicked menu
                                    sidebarMenu.style.display = 'block';
                                    currentOpenMenu = sidebarMenu; // Update the current open menu
                                }
                                
                            });

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

function addQuestion(topicId, subtopic_id){
    /*
        This function will load the AddQuestionAndChoices form dynamically.
        The topic and subtopic will be preloaded.
    */

    const route = `/management/portal/add_question_and_choices_dynamically`;

    fetch(route)
    .then(response => response.json())
    .then(data => {
        if (data.success){
            // Insert the form HTML into the management container
            const managementContainer = document.getElementById('management-container');
            managementContainer.innerHTML = data.add_question_and_choices_form_html;

            // populate the topic and subtopic form fields
            document.getElementById('topic-for-question').value = topicId;
            subtopicMenu = document.getElementById('subtopic-for-question');
            getSubtopics(topicId, subtopicMenu, function(){
                // subtopic menu won't be initialized until the menu has finished loading
                subtopicMenu.value = subtopic_id;
            });           

        }else{
            console.error('Failed to load the form.');
        }

    })
    .catch(error => console.error('Error loading the form:', error));
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
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    // Retrieve the add choice forms (must be at least two)
    let choices = [];
    const choiceForms = document.querySelectorAll('.choice-form');
    
    choiceForms.forEach((choiceForm, index) => {
        let choiceTextInput = choiceForm.querySelector(`[name="${index}-text"]`);
        let isCorrectInput = choiceForm.querySelector(`[name="${index}-is_correct"]`);

        // check for disabled forms
        if (!choiceTextInput.disabled && !isCorrectInput.disabled){
            let choiceText = choiceTextInput.value;
            let isCorrect = isCorrectInput.checked;
            choices.push({
                'text': choiceText,
                'is_correct': isCorrect
            });
        }
    });

    fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({
            // question form values
            topic_id : document.getElementById('topic-for-question').value,
            subtopic_id : document.getElementById('subtopic-for-question').value,
            question_text : document.getElementById('new-question').value,  
            question_type : document.getElementById('question-type').value,
            // choice forms
            choices : choices
        })
    })   
    .then(response => response.json())
    .then(data => {
        //document.getElementById('add-question-and-choices-form').reset(); // reset the form
        
        if (data.success){  
            // repopulate the topic, subtopic, and question type fields
            // since it's likely that a user will add multiple questions for the same topic/subtopic combo
            document.getElementById('topic-for-question').value = data.topic_id;
            document.getElementById('subtopic-for-question').value = data.subtopic_id;
            document.getElementById('question-type').value = data.question_type_id;

            // update the sidebar question count
            let badge = document.getElementById('badge-' + data.subtopic_id);
            if (badge){
                // Get the current value of the badge and convert it to an integer
                let badgeValue = parseInt(badge.textContent, 10);

                // Update the question count
                badgeValue += 1;
        
                // Update the badge text content with the new question count
                badge.textContent = badgeValue;
                   
            }         

            // clear out the question field and choice forms
            document.getElementById('new-question').value = '';
            const addChoicesContainer = document.getElementById('add-choices-container');
            addChoicesContainer.innerHTML = '';

            // load blank choice forms
            data.add_choice_forms.forEach(addChoiceForm =>{
                const addChoiceDiv = document.createElement('div');
                addChoiceDiv.innerHTML = addChoiceForm;
                addChoicesContainer.appendChild(addChoiceDiv);
            });
            if (data.question_type_name === 'True/False'){
                    
                // prepopulate the choices with True and False
                // Set the text fields to "True" and "False" and make them read-only
                document.getElementById('id_0-text').value = "True";
                document.getElementById('id_0-text').readOnly = true;
                document.getElementById('id_1-text').value = "False";
                document.getElementById('id_1-text').readOnly = true;

                // hide any other choice forms
                // disable the additional choice fields
                if (document.getElementById('id_2-text')) {
                    document.getElementById('id_2-text').disabled = true;
                    document.getElementById('id_2-is_correct').disabled = true;
                }
                if (document.getElementById('id_3-text')) {
                    document.getElementById('id_3-text').disabled = true;
                    document.getElementById('id_3-is_correct').disabled = true;
                }
            }

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

function selectQuestionType(){
    const questionType = document.getElementById('question-type');
    const addChoiceButton = document.getElementById('add-choice-btn');
    
    if (questionType){

         // add event listeneer for the question type dropdown menu
         questionType.addEventListener('change', function(){
            const selectedQuestionType = questionType.value;

            // save the question type in session storage for use in page reload
            //sessionStorage.setItem('selectedQuestionType', selectedQuestionType);
            const route = `/management/portal/get_question_type_name/${selectedQuestionType}`; 
            
            // get the question type name from the QuestionType table
            fetch(route)
            .then(response => response.json())
            .then(data => {
                if (data.success){
                    const questionTypeName = data.name;
                    
                    if (questionTypeName === 'True/False'){
                        // only 2 choices allowed in the form
                        // prepopulate the choices with True and False
                        // Set the text fields to "True" and "False" and make them read-only
                        document.getElementById('id_0-text').value = "True";
                        document.getElementById('id_0-text').readOnly = true;
                        document.getElementById('id_1-text').value = "False";
                        document.getElementById('id_1-text').readOnly = true;

                        
                        // hide any other choice forms
                        // disable the additional choice fields
                        if (document.getElementById('id_2-text')) {
                            document.getElementById('id_2-text').disabled = true;
                            document.getElementById('id_2-is_correct').disabled = true;
                        }
                        if (document.getElementById('id_3-text')) {
                            document.getElementById('id_3-text').disabled = true;
                            document.getElementById('id_3-is_correct').disabled = true;
                        }
                        
                        // Hide the add choice button
                        addChoiceButton.style.display = 'none';

                    }else{
                        // Clear the text fields and make them editable
                        document.getElementById('id_0-text').value = "";
                        document.getElementById('id_0-text').readOnly = false;
                        document.getElementById('id_1-text').value = "";
                        document.getElementById('id_1-text').readOnly = false;

                        // disable the additional choice fields
                        if (document.getElementById('id_2-text')) {
                            document.getElementById('id_2-text').disabled = false;
                            document.getElementById('id_2-is_correct').disabled = false;
                        }
                        if (document.getElementById('id_3-text')) {
                            document.getElementById('id_3-text').disabled = false;
                            document.getElementById('id_3-is_correct').disabled = false;
                        }

                        // enable the add choice button for the other question types
                        addChoiceButton.style.display = 'block';
                    }

                }else{
                    // errors
                    let add_question_and_choices_msg = document.getElementById('add-question-and-choices-msg');
                    add_question_and_choices_msg.innerHTML = `<div class="alert alert-${data.messages[0].tags}" role="alert">${data.messages[0].message}</div>`;
                }
            
            })
            .catch(error => console.error('Error retrieving questiontype name:', error));
             
        });

    }
}

function addAnotherChoice(){
    const addChoicesContainer = document.getElementById('add-choices-container');
    const addChoiceButton = document.getElementById('add-choice-btn'); 
        
    if (addChoiceButton){
        addChoiceButton.addEventListener('click', function(e){
            e.preventDefault();

            // clone the choice form and get all the fields and labels
            newChoiceForm = addChoicesContainer.firstElementChild.cloneNode(true);
            let choiceFields = newChoiceForm.querySelectorAll('input');
            let choiceLabels = newChoiceForm.querySelectorAll('label');

            let choiceCount = addChoicesContainer.childElementCount;
            console.log(choiceCount);
            // clear the values from the cloned choice form
            choiceFields.forEach(function(field){
                field.value = '';
                if (field.type === 'checkbox'){
                    field.checked = false;
                }
            })
            // create the id for the new choice form
            choiceCount++;
            newChoiceForm.id = 'add-choice-' + choiceCount;
            console.log(newChoiceForm.id);
            // update the form prefix
            const newPrefix = (choiceCount-1).toString();
            
            choiceFields.forEach(function(field){
                if (field.name){
                    field.name = field.name.replace(/\d+/, newPrefix);
                }
                if (field.id){
                    field.id = field.id.replace(/\d+/, newPrefix);
                }
                console.log(field.name);
                console.log(field.id);
            });

            // Update the for attribute of labels
            choiceLabels.forEach(function(label) {
                if (label.htmlFor) {
                    label.htmlFor = label.htmlFor.replace(/\d+/, newPrefix);
                }
                console.log(label.htmlFor);
            });

            addChoicesContainer.appendChild(newChoiceForm);
        });
    }   
}

function selectTopicForQuestionToEdit(){
    const topicMenu = document.getElementById('topic-for-edit-question');
    const subtopicMenu = document.getElementById('subtopic-for-edit-question');
    
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
                         
                getSubtopicsForQuestionToEdit(selectedTopicId, subtopicMenu);
            }

        })
    }

}

function getSubtopicsForQuestionToEdit(selectedTopicId, subtopicMenu){
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
                let edit_question_msg = document.getElementById('edit-question-msg');
                if (edit_question_msg){
                    edit_question_msg.innerHTML = '';
                }
                clearMessages();
                displayMessage('There are no available subtopics for the chosen topic', 'info');
                return;
            }else{
                // add event listener to subtopic menu
                subtopicMenu.addEventListener('change', function(){
                    const selectedSubtopicId = subtopicMenu.value;
                    loadQuestionsToEdit(selectedSubtopicId);
                }) 
            }
                
        }else{
            let edit_question_msg = document.getElementById('edit-question-msg');
            if (edit_question_msg){
                edit_question_msg.innerHTML = '';
            }
            clearMessages();
            displayMessage('There are no available subtopics for the chosen topic', 'info');
            return;    
        } 
    })
}

function loadQuestionsToEdit(selectedSubtopicId){
    const questionMenu = document.getElementById('question-to-edit');
    
    // get all the questions for the chosen subtopic
    const route = `/management/portal/load_questions/${selectedSubtopicId}`;

    fetch(route)
    .then(response => response.json())
    .then(data =>{
        if (data.success){
            // clear the existing question menu options
            questionMenu.innerHTML = '';

            // load the new questions, including the placeholder option
            questionMenu.innerHTML = '<option value="" selected ="">--------</option>';
            data.questions.forEach(question => {
                const option = document.createElement('option');
                option.value = question.id;
                option.textContent = question.text;
                questionMenu.appendChild(option);
            }); 
            
            const validQuestionOptions = questionMenu.options.length > 1;

            if (!validQuestionOptions){
                let edit_question_msg = document.getElementById('edit-question-msg');
                if (edit_question_msg){
                    edit_question_msg.innerHTML = '';
                }
                clearMessages();
                displayMessage('There are no available questions for the chosen subtopic', 'info');
                return;
            }

        }else{
            let edit_question_msg = document.getElementById('edit-question-msg');
            if (edit_question_msg){
                edit_question_msg.innerHTML = '';
            }
            clearMessages();
            displayMessage('There are no available question for the chosen subtopic', 'info');
            return;    
        } 

    })
}

function selectTopicForAllQuestionsToEdit(){
    const topicMenu = document.getElementById('topic-for-edit-all-questions');
    const subtopicMenu = document.getElementById('subtopic-for-edit-all_questions');
    
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
                         
                getSubtopicsForAllQuestionsToEdit(selectedTopicId, subtopicMenu);
            }

        })
    }   
}

function getSubtopicsForAllQuestionsToEdit(selectedTopicId, subtopicMenu){
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
                let edit_all_questions_msg = document.getElementById('edit-all-questions-msg');
                if (edit_all_questions_msg){
                    edit_all_questions_msg.innerHTML = '';
                }
                clearMessages();
                displayMessage('There are no available subtopics for the chosen topic', 'info');
                return;
            }
                
        }else{
            let edit_all_questions_msg = document.getElementById('edit-all-questions-msg');
            if (edit_all_questions_msg){
                edit_all_questions_msg.innerHTML = '';
            }
            clearMessages();
            displayMessage('There are no available subtopics for the chosen topic', 'info');
            return;    
        } 
    })
}

function selectQuestionToEdit(){
    // retrieve the EditQuestionForm values
    topicId = document.getElementById('topic-for-edit-question').value;
    subtopicId = document.getElementById('subtopic-for-edit-question').value;
    questionId = document.getElementById('question-to-edit').value;

    const route = `/management/portal/load_question_to_edit/${questionId}`;
    
    fetch(route)
    .then(response => response.json())
    .then(data =>{
        if (data.success){
            console.log(data.question);
            console.log(data.choices);

            // Insert the form HTML into the management container
            const managementContainer = document.getElementById('management-container');
            managementContainer.innerHTML = data.edit_question_and_choices_form_html;
        }else{

        }

    })  

}



// Helper functions

function getSubtopics(selectedTopicId, subtopicMenu, callback){
    // get the subtopics for the chosen topic to populate the subtopics dropdown menu
    const route = `/management/portal/get_subtopics/${selectedTopicId}`;
    
    fetch(route)
    .then(response => response.json())
    .then(data =>{
        
        if (data.success){
            // clear the existing subtopic options
            subtopicMenu.innerHTML = '';
           
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
                }else{
                    if (callback){
                        callback();
                    }
                }
        }else{
            let add_question_and_choices_msg = document.getElementById('add-question-and-choices-msg');
            if (add_question_and_choices_msg){
                add_question_and_choices_msg.innerHTML = '';
            }
            clearMessages();
            displayMessage('There are no available subtopics for the chosen topic', 'info');
            return;    
        } 
    })

}

function hideSidebarMenus(){
    // This function clears any existing sidebar menus before loading a new one

    const sidebarMenus = document.querySelectorAll('.sidebar-menu');
    if (sidebarMenus.length > 0){
        sidebarMenus.forEach(sidebarMenu =>{
            sidebarMenu.style.display = 'none';
        });
    }
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