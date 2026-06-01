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
  const [quizQuestions, setQuizQuestions] = useState(questions);
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
    <div className="min-h-screen w-full flex items-center justify-center p-[20px] py-[40px] relative">
      {/* Background isolated container to prevent blob animation from causing document height jitter */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </div>

      <div className={`w-full max-w-[560px] bg-slate-800/70 backdrop-blur-[16px] border border-white/10 rounded-[24px] p-[40px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative z-10 overflow-visible transition-all duration-400 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-5' : 'opacity-100 translate-y-0 animate-fade-in'}`}>
        {quizState === 'start' && (
          <StartScreen
            onStart={startQuiz}
            quizQuestions={quizQuestions}
            setQuizQuestions={setQuizQuestions}
          />
        )}
        {quizState === 'quiz' && (
          <QuizScreen
            questions={quizQuestions}
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
            totalQuestions={quizQuestions.length}
            onRestart={restartQuiz}
          />
        )}
      </div>
    </div>
  );
}

function StartScreen({ onStart, quizQuestions, setQuizQuestions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Clipboard Paste using async/await
  const handlePaste = async () => {
    try {
      setError(null);
      setSuccess(false);
      const text = await navigator.clipboard.readText();
      setJsonText(text);
    } catch (err) {
      setError("Failed to read from clipboard. Please paste manually or grant clipboard permissions.");
    }
  };

  // JSON Loader & Parser using async/await with simulated processing time
  const handleLoad = async () => {
    if (!jsonText.trim()) {
      setError("Please paste some JSON text first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulate asynchronous validation/loading latency (800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const parsed = JSON.parse(jsonText);

      // Validate schema
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array of questions.");
      }
      if (parsed.length === 0) {
        throw new Error("Questions array cannot be empty.");
      }

      parsed.forEach((q, index) => {
        if (typeof q.question !== 'string' || !q.question.trim()) {
          throw new Error(`Question at index ${index} must have a valid 'question' text string.`);
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(`Question at index ${index} ('${q.question.substring(0, 15)}...') must have an 'options' array with at least 2 choices.`);
        }
        q.options.forEach((opt, oIdx) => {
          if (typeof opt !== 'string' || !opt.trim()) {
            throw new Error(`Question at index ${index} option index ${oIdx} must be a valid string.`);
          }
        });
        if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) {
          throw new Error(`Question at index ${index} ('${q.question.substring(0, 15)}...') must have a valid 'answer' index (0 to ${q.options.length - 1}).`);
        }
      });

      // Update quiz questions state
      setQuizQuestions(parsed);
      setSuccess(true);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format. Please check your syntax (quotes, brackets, commas).");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sampleJson = JSON.stringify([
    {
      "question": "What is the capital of France?",
      "options": ["London", "Berlin", "Paris", "Rome"],
      "answer": 2
    },
    {
      "question": "Which planet is known as the Red Planet?",
      "options": ["Earth", "Mars", "Jupiter", "Venus"],
      "answer": 1
    }
  ], null, 2);

  return (
    <div className="text-center">
      <h1 className="text-[2.5rem] font-bold mb-[15px] bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Test Your Knowledge
      </h1>
      <p className="text-slate-400 mb-[25px] text-[1.1rem]">
        Are you ready to take the quiz? ({quizQuestions.length} Questions loaded)
      </p>
      
      <div className="flex justify-center mb-[35px]">
        <button
          onClick={onStart}
          className="bg-indigo-500 text-white border-none py-[14px] px-[32px] text-[1.1rem] font-semibold rounded-[12px] cursor-pointer transition-all duration-300 hover:bg-indigo-600 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] active:translate-y-[1px] pulse-anim shadow-[0_4px_14px_rgba(99,102,241,0.39)]"
        >
          Start Quiz
        </button>
      </div>

      {/* Accordion Toggle */}
      <div className="border border-white/10 rounded-[16px] overflow-hidden bg-white/5 text-left transition-all duration-300">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center py-[14px] px-[20px] font-semibold text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-[0.95rem] border-none focus:outline-none"
        >
          <span className="flex items-center gap-[8px]">
            <svg className="w-[18px] h-[18px] text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7V4" />
            </svg>
            Import Custom Quiz (JSON)
          </span>
          <svg
            className={`w-[18px] h-[18px] text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Collapsible Importer Area */}
        <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[800px] border-t border-white/5 p-[20px]' : 'max-h-0'}`}>
          <div className="mb-[15px]">
            <label className="block text-[0.8rem] font-bold text-slate-400 uppercase tracking-wide mb-[8px]">
              Paste JSON Questions List
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='[{"question": "Example?", "options": ["Yes", "No"], "answer": 0}]'
              rows={5}
              className="w-full bg-black/30 border border-white/10 rounded-[10px] p-[12px] text-slate-100 font-mono text-[0.85rem] focus:outline-none focus:border-indigo-500 transition-colors resize-y min-h-[100px]"
            />
          </div>

          <div className="flex gap-[12px] mb-[15px]">
            <button
              type="button"
              onClick={handlePaste}
              className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-white/5 py-[10px] px-[16px] rounded-[10px] font-semibold text-[0.9rem] transition-all cursor-pointer flex items-center justify-center gap-[6px]"
            >
              <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Paste Clipboard
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleLoad}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white py-[10px] px-[16px] rounded-[10px] font-semibold text-[0.9rem] transition-all cursor-pointer flex items-center justify-center gap-[6px] shadow-[0_4px_10px_rgba(99,102,241,0.2)]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-[16px] w-[16px] text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Load Questions
                </>
              )}
            </button>
          </div>

          {/* Success / Error Banners */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-[12px] rounded-[10px] text-[0.85rem] mb-[15px] flex items-start gap-[8px] animate-fade-in">
              <svg className="w-[16px] h-[16px] shrink-0 mt-[2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-[12px] rounded-[10px] text-[0.85rem] mb-[15px] flex items-start gap-[8px] animate-fade-in">
              <svg className="w-[16px] h-[16px] shrink-0 mt-[2px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Custom quiz questions loaded successfully! Ready to start.</span>
            </div>
          )}

          {/* Example Box */}
          <div className="bg-black/20 rounded-[10px] p-[12px] border border-white/5">
            <span className="block text-[0.75rem] font-bold text-slate-400 uppercase tracking-wide mb-[6px]">Required Format Structure:</span>
            <pre className="text-[0.75rem] text-slate-300 font-mono overflow-auto whitespace-pre p-[8px] bg-black/40 rounded-[6px] max-h-[150px]">
              {sampleJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizScreen({ questions, currentQuestionIndex, setCurrentQuestionIndex, score, setScore, onFinish }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [betType, setBetType] = useState('safe'); // 'safe' or 'double'
  const [showWarning, setShowWarning] = useState(false);
  const [shakeWarning, setShakeWarning] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((selectedOption !== null ? currentQuestionIndex + 1 : currentQuestionIndex) / questions.length) * 100;

  const handleOptionClick = (index) => {
    if (selectedOption !== null) return; // Prevent multiple clicks

    setShowWarning(false);
    setShakeWarning(false);
    setSelectedOption(index);

    if (index === currentQuestion.answer) {
      if (betType === 'safe') {
        setScore(s => s + 1);
      } else {
        setScore(s => s + 2);
      }
    } else {
      if (betType === 'double') {
        setScore(s => Math.max(0, s - 1));
      }
    }
  };

  const handleNext = () => {
    if (selectedOption === null) {
      setShowWarning(true);
      setShakeWarning(true);
      return;
    }

    setSelectedOption(null);
    setBetType('safe');
    setShowWarning(false);
    setShakeWarning(false);

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

      {/* Confidence Meter Section */}
      <div className="mb-[25px] bg-white/5 border border-white/10 rounded-[16px] p-[16px]">
        <div className="flex justify-between items-center mb-[12px]">
          <span className="text-[0.8rem] font-bold tracking-wider text-slate-400 uppercase">Confidence Meter</span>
          {selectedOption !== null && (
            <span className="text-[0.75rem] font-semibold text-indigo-400 flex items-center gap-[4px]">
              <svg className="w-[12px] h-[12px]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
              </svg>
              Bet Locked
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-[12px]">
          {/* Play it Safe Card */}
          <button
            type="button"
            disabled={selectedOption !== null}
            onClick={() => setBetType('safe')}
            className={`flex flex-col items-center justify-center p-[12px] rounded-[12px] border transition-all duration-300 text-center ${
              betType === 'safe'
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-300'
            } ${selectedOption !== null && betType !== 'safe' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-[6px] mb-[4px]">
              <svg className={`w-[18px] h-[18px] ${betType === 'safe' ? 'text-indigo-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span className="font-semibold text-[0.95rem]">Play it Safe</span>
            </div>
            <span className="text-[0.75rem] text-slate-400 font-medium">1x Score (+1 / 0)</span>
          </button>

          {/* Double or Nothing Card */}
          <button
            type="button"
            disabled={selectedOption !== null}
            onClick={() => setBetType('double')}
            className={`flex flex-col items-center justify-center p-[12px] rounded-[12px] border transition-all duration-300 text-center ${
              betType === 'double'
                ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-300'
            } ${selectedOption !== null && betType !== 'double' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-[6px] mb-[4px]">
              <svg className={`w-[18px] h-[18px] ${betType === 'double' ? 'text-amber-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9.879z" />
              </svg>
              <span className="font-semibold text-[0.95rem]">Double or Nothing</span>
            </div>
            <span className="text-[0.75rem] text-slate-400 font-medium">2x if Right / -1 if Wrong</span>
          </button>
        </div>
      </div>

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

      {/* Points Outcome Feedback */}
      {selectedOption !== null && (
        <div className="flex items-center justify-center gap-[8px] py-[12px] px-[16px] rounded-[12px] bg-white/5 border border-white/10 mb-[20px] text-[0.95rem] font-semibold animate-fade-in">
          {selectedOption === currentQuestion.answer ? (
            <>
              <span className="text-emerald-400 flex items-center gap-[6px]">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Correct Answer!
              </span>
              <span className="text-slate-300">
                {betType === 'double' ? '+2 Points Earned!' : '+1 Point Earned!'}
              </span>
            </>
          ) : (
            <>
              <span className="text-red-400 flex items-center gap-[6px]">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Incorrect!
              </span>
              <span className="text-slate-300">
                {betType === 'double' ? '-1 Point Penalty!' : '0 Points Earned.'}
              </span>
            </>
          )}
        </div>
      )}

      {/* Validation Warning Alert */}
      {showWarning && (
        <div
          onAnimationEnd={() => setShakeWarning(false)}
          className={`flex items-center gap-[8px] bg-red-500/15 border border-red-500/30 text-red-400 py-[12px] px-[16px] rounded-[12px] text-[0.95rem] mb-[20px] ${shakeWarning ? 'animate-shake' : ''}`}
        >
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span>Please select an option before moving to the next question.</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className={`border-none py-[14px] px-[32px] text-[1.1rem] font-semibold rounded-[12px] transition-all duration-300 active:translate-y-[1px] ${
            selectedOption !== null
              ? 'bg-indigo-500 text-white cursor-pointer hover:bg-indigo-600 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] shadow-[0_4px_14px_rgba(99,102,241,0.39)]'
              : 'bg-slate-700/30 text-slate-400 border border-white/5 cursor-pointer hover:bg-slate-700/50'
          }`}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Show Results'}
        </button>
      </div>
    </div>
  );
}

function ResultScreen({ score, totalQuestions, onRestart }) {
  const maxScore = totalQuestions * 2;
  const percentage = (score / maxScore) * 100;

  let feedbackText = "";
  if (percentage === 100) {
    feedbackText = "Perfect Score! Master of risk and knowledge!";
  } else if (percentage >= 80) {
    feedbackText = "Amazing! Great strategy and accuracy!";
  } else if (percentage >= 50) {
    feedbackText = "Well done! You balanced your risks nicely.";
  } else {
    feedbackText = "Needs improvement. Try taking more calculated risks next time!";
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
          out of {maxScore} points
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
