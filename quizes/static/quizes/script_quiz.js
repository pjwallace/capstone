// Javascript for the quiz page

function loadQuizLayout(subtopicId, topicId){
    const route = `/quizes/home/load_quiz_layout/${subtopicId}/${topicId}`;   
    fetch(route)
    .then(response => response.json())
    .then(data =>{
        if (data.success){
            
            // Replace the entire document (both <head> and <body>)
            document.documentElement.innerHTML = data.quiz_layout_html;
            loadQuizQuestionsAndAnswers(subtopicId);
        }
        else{
            console.error("Failed to load quiz layout");
        }

    })
    .catch(error => console.error('Error loading quiz layout:', error));

}

function loadQuizQuestionsAndAnswers(subtopicId){
    quizContainer = document.getElementById('quiz-container');
    const route = `/quizes/home/load_quiz_questions_and_answers/${subtopicId}`;   
    fetch(route)
    .then(response => response.json())
    .then(data =>{
        if (data.success){
            quizContainer.innerHTML = '';
            quizContainer.innerHTML = data.quiz_html;

        }else{
            console.error("Failed to load quiz html");
        }

    })
    .catch(error => console.error('Error loading quiz:', error));
}
