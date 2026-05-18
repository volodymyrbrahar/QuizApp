import { useState, useEffect } from 'react';

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

export default function App() {
  const [quizState, setQuizState] = useState('start'); // 'start', 'quiz', 'result'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  // Transition state for animations
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startQuiz = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setQuizState('quiz');
      setIsTransitioning(false);
    }, 400);
  };

  const showResults = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setQuizState('result');
      setIsTransitioning(false);
    }, 400);
  };

  const restartQuiz = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setScore(0);
      setCurrentQuestionIndex(0);
      setQuizState('start');
      setIsTransitioning(false);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-[20px] relative overflow-hidden">
      <div className="blob-1"></div>
      <div className="blob-2"></div>

      <div className={`w-full max-w-[560px] bg-slate-800/70 backdrop-blur-[16px] border border-white/10 rounded-[24px] p-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-400 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0 animate-fade-in'}`}>
        {quizState === 'start' && <StartScreen onStart={startQuiz} />}
        {quizState === 'quiz' && (
          <QuizScreen
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            score={score}
            setScore={setScore}
            onFinish={showResults}
          />
        )}
        {quizState === 'result' && (
          <ResultScreen
            score={score}
            totalQuestions={questions.length}
            onRestart={restartQuiz}
          />
        )}
      </div>
    </div>
  );
}

function StartScreen({ onStart }) {
  return (
    <div className="text-center">
      <h1 className="text-[2.5rem] font-bold mb-[15px] bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Test Your Knowledge
      </h1>
      <p className="text-slate-400 mb-[30px] text-[1.1rem]">
        Are you ready to take the quiz?
      </p>
      <button
        onClick={onStart}
        className="bg-indigo-500 text-white border-none py-[14px] px-[32px] text-[1.1rem] font-semibold rounded-[12px] cursor-pointer transition-all duration-300 hover:bg-indigo-600 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] active:translate-y-[1px] pulse-anim shadow-[0_4px_14px_rgba(99,102,241,0.39)]"
      >
        Start Quiz
      </button>
    </div>
  );
}

function QuizScreen({ questions, currentQuestionIndex, setCurrentQuestionIndex, score, setScore, onFinish }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((selectedOption !== null ? currentQuestionIndex + 1 : currentQuestionIndex) / questions.length) * 100;

  const handleOptionClick = (index) => {
    if (selectedOption !== null) return; // Prevent multiple clicks

    setSelectedOption(index);
    if (index === currentQuestion.answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-[20px] text-[0.95rem] text-slate-400 font-semibold">
        <span>Question <span id="current-question-num">{currentQuestionIndex + 1}</span> of <span id="total-questions-num">{questions.length}</span></span>
        <span>Score: <span id="score">{score}</span></span>
      </div>

      <div className="w-full h-[6px] bg-white/10 rounded-[10px] mb-[30px] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[10px] transition-all duration-400 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <h2 className="text-[1.4rem] font-semibold mb-[30px] leading-[1.4]">
        {currentQuestion.question}
      </h2>

      <div className="flex flex-col gap-[15px] mb-[30px]">
        {currentQuestion.options.map((option, index) => {
          let btnClass = "border py-[16px] px-[20px] rounded-[12px] text-[1rem] text-left transition-all duration-200 flex items-center relative overflow-hidden ";

          if (selectedOption === null) {
            btnClass += "bg-white/5 border-white/10 text-slate-50 hover:bg-white/10 hover:translate-x-[5px] hover:border-white/20 cursor-pointer";
          } else {
            btnClass += "cursor-default opacity-90 ";
            if (index === currentQuestion.answer) {
              btnClass += "bg-emerald-500/15 border-emerald-500 text-emerald-500";
            } else if (index === selectedOption) {
              btnClass += "bg-red-500/15 border-red-500 text-red-500";
            } else {
              btnClass += "bg-white/5 border-white/10 text-slate-50";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              className={btnClass}
              disabled={selectedOption !== null}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className={`bg-indigo-500 text-white border-none py-[14px] px-[32px] text-[1.1rem] font-semibold rounded-[12px] cursor-pointer transition-all duration-300 hover:bg-indigo-600 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] active:translate-y-[1px] shadow-[0_4px_14px_rgba(99,102,241,0.39)] ${selectedOption !== null ? 'block animate-fade-in' : 'hidden'}`}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Show Results'}
        </button>
      </div>
    </div>
  );
}

function ResultScreen({ score, totalQuestions, onRestart }) {
  const percentage = (score / totalQuestions) * 100;

  let feedbackText = "";
  if (percentage === 100) {
    feedbackText = "Perfect Score! You're a genius!";
  } else if (percentage >= 80) {
    feedbackText = "Great job! Almost perfect!";
  } else if (percentage >= 60) {
    feedbackText = "Good effort! Keep learning.";
  } else {
    feedbackText = "Needs improvement. Try again!";
  }

  return (
    <div className="text-center py-5">
      <h1 className="text-[2rem] font-bold mb-[30px]">Quiz Completed!</h1>

      <div className="bg-black/20 rounded-[20px] p-[30px] mb-[25px] border border-white/10">
        <svg className="w-[60px] h-[60px] text-amber-400 mx-auto mb-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
        </svg>
        <div className="text-[4rem] font-bold leading-none bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
          {score}
        </div>
        <p className="text-slate-400 text-[1.2rem] mt-[10px]">
          out of {totalQuestions}
        </p>
      </div>

      <p className="text-[1.2rem] mb-[30px] text-purple-500 font-semibold">
        {feedbackText}
      </p>

      <button
        onClick={onRestart}
        className="bg-indigo-500 text-white border-none py-[14px] px-[32px] text-[1.1rem] font-semibold rounded-[12px] cursor-pointer transition-all duration-300 hover:bg-indigo-600 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] active:translate-y-[1px] shadow-[0_4px_14px_rgba(99,102,241,0.39)] pulse-anim"
      >
        Restart Quiz
      </button>
    </div>
  );
}
