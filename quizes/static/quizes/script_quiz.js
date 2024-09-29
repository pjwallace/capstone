// Javascript for the quiz page

function loadQuizLayout(subtopicId, topicId){
    const route = `/quizes/home/load_quiz_layout/${subtopicId}/${topicId}`;   
    fetch(route)
    .then(response => response.json())
    .then(data =>{
        if (data.success){
            console.log('success');
            // Replace the entire document (both <head> and <body>)
            document.documentElement.innerHTML = data.quiz_layout_html;
            loadQuizQuestionAndAnswers(subtopicId);
        }
        else{
            console.error("Failed to load quiz layout");
        }

    })
    .catch(error => console.error('Error loading quiz layout:', error));

}

function loadQuizQuestionsAndAnswers(subtopicId){

}
