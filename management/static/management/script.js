document.addEventListener('DOMContentLoaded', function () {

    // Add event listeners to the dropdown menu items on the management portal
    document.getElementById('dropdown-add-topic').addEventListener('click', add_topic);
    document.getElementById('dropdown-edit-topic').addEventListener('click', edit_topic);
    document.getElementById('dropdown-delete-topic').addEventListener('click', delete_topic);

    document.getElementById('dropdown-add-subtopic').addEventListener('click', add_subtopic);
    document.getElementById('dropdown-edit-subtopic').addEventListener('click', edit_subtopic);
    document.getElementById('dropdown-delete-subtopic').addEventListener('click', delete_subtopic);

    document.getElementById('dropdown-add-question').addEventListener('click', add_question);
    document.getElementById('dropdown-edit-question').addEventListener('click', edit_question);
    document.getElementById('dropdown-delete-question').addEventListener('click', delete_question);

    document.getElementById('dropdown-add-choice').addEventListener('click', add_choice);
    document.getElementById('dropdown-edit-choice').addEventListener('click', edit_choice);
    document.getElementById('dropdown-delete-choice').addEventListener('click', delete_choice);

});

function add_topic(){
    const route = `/management/portal/add_topic`;
    console.log(route);

    fetch(route)
    .then(response => response.json())
    .then(data => {
        const management_container = document.getElementById('management-container');
        management_container.innerHTML = ''; // Clear the container
        management_container.innerHTML = data.form; // Insert the new form HTML

        // Update the browser's URL without reloading the page
        window.history.pushState({ path: route }, '', route);
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
    //pass
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