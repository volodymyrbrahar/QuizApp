const questions = [
    {
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Preprocessor",
            "Hyper Text Markup Language",
            "Hyper Text Multiple Language",
            "Hyper Tool Multi Language"
        ],
        answer: 1 // Index of correct option
    },
    {
        question: "Which CSS property is used to control the spacing between elements?",
        options: [
            "margin",
            "padding",
            "spacing",
            "border"
        ],
        answer: 0
    },
    {
        question: "What does JavaScript primarily add to a web page?",
        options: [
            "Structure",
            "Styling",
            "Interactivity",
            "Images"
        ],
        answer: 2
    },
    {
        question: "Which keyword is used to declare a block-scoped variable in JavaScript?",
        options: [
            "var",
            "let",
            "function",
            "global"
        ],
        answer: 1
    },
    {
        question: "What is the correct syntax for referring to an external script called 'app.js'?",
        options: [
            "<script href='app.js'>",
            "<script source='app.js'>",
            "<script name='app.js'>",
            "<script src='app.js'>"
        ],
        answer: 3
    }
];

let currentQuestionIndex = 0;
let score = 0;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const currentQuestionNum = document.getElementById('current-question-num');
const totalQuestionsNum = document.getElementById('total-questions-num');
const scoreDisplay = document.getElementById('score');
const progressBar = document.getElementById('progress');

const finalScore = document.getElementById('final-score');
const finalTotal = document.getElementById('final-total');
const feedbackText = document.getElementById('feedback-text');

// Initialize
totalQuestionsNum.textContent = questions.length;
finalTotal.textContent = questions.length;

// Event Listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
});
restartBtn.addEventListener('click', restartQuiz);

function startQuiz() {
    startScreen.classList.remove('active');
    setTimeout(() => {
        quizScreen.classList.add('active');
        loadQuestion();
    }, 400); // Wait for transition
}

function loadQuestion() {
    // Reset state
    nextBtn.classList.add('hidden');
    optionsContainer.innerHTML = '';
    
    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    currentQuestionNum.textContent = currentQuestionIndex + 1;
    
    // Update progress bar
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;

    // Create options
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.textContent = option;
        button.dataset.index = index;
        button.addEventListener('click', selectOption);
        optionsContainer.appendChild(button);
    });
}

function selectOption(e) {
    const selectedBtn = e.target;
    const selectedIndex = parseInt(selectedBtn.dataset.index);
    const correctIndex = questions[currentQuestionIndex].answer;
    
    // Disable all options
    const allOptions = optionsContainer.children;
    for (let option of allOptions) {
        option.disabled = true;
    }
    
    // Check if correct
    if (selectedIndex === correctIndex) {
        selectedBtn.classList.add('correct');
        score++;
        scoreDisplay.textContent = score;
    } else {
        selectedBtn.classList.add('wrong');
        // Highlight correct answer
        allOptions[correctIndex].classList.add('correct');
    }
    
    // Show next button
    nextBtn.classList.remove('hidden');
    // Update progress bar to include current question
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function showResults() {
    quizScreen.classList.remove('active');
    setTimeout(() => {
        resultScreen.classList.add('active');
        finalScore.textContent = score;
        
        // Feedback message based on score
        const percentage = (score / questions.length) * 100;
        if (percentage === 100) {
            feedbackText.textContent = "Perfect Score! You're a genius!";
        } else if (percentage >= 80) {
            feedbackText.textContent = "Great job! Almost perfect!";
        } else if (percentage >= 60) {
            feedbackText.textContent = "Good effort! Keep learning.";
        } else {
            feedbackText.textContent = "Needs improvement. Try again!";
        }
    }, 400);
}

function restartQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    scoreDisplay.textContent = score;
    
    resultScreen.classList.remove('active');
    setTimeout(() => {
        startScreen.classList.add('active');
        progressBar.style.width = '0%';
    }, 400);
}
