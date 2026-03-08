import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { generateMockTest } from '../services/gemini';
import { Question, QuizAttempt } from '../types';
import { useStore } from '../store/useStore';
import { Loader2, Clock, Flag, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '../components/ui/card';

const TOTAL_TIME = 120 * 60; // 120 minutes in seconds

export default function MockTest() {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const { addAttempt } = useStore();

  useEffect(() => {
    let timer: number;
    if (testStarted && !testFinished && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, testFinished, timeLeft]);

  const handleStartTest = async () => {
    setLoading(true);
    try {
      const generated = await generateMockTest();
      // Shuffle questions
      const shuffled = [...generated].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setFlagged({});
      setTimeLeft(TOTAL_TIME);
      setTestStarted(true);
      setTestFinished(false);
    } catch (error) {
      console.error(error);
      alert('Failed to generate mock test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers({ ...userAnswers, [currentQuestion.id]: option });
  };

  const toggleFlag = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setFlagged({ ...flagged, [currentQuestion.id]: !flagged[currentQuestion.id] });
  };

  const finishTest = () => {
    const timeSpent = TOTAL_TIME - timeLeft;
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    const sectionScores = {
      Verbal: 0,
      Quantitative: 0,
      Analytical: 0,
    };

    questions.forEach(q => {
      const ans = userAnswers[q.id];
      if (!ans) unattempted++;
      else if (ans === q.correct_answer) {
        correct++;
        if (q.section.includes('Verbal')) sectionScores.Verbal++;
        if (q.section.includes('Quantitative')) sectionScores.Quantitative++;
        if (q.section.includes('Analytical')) sectionScores.Analytical++;
      } else {
        incorrect++;
      }
    });

    const attempt: QuizAttempt = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      type: 'mock',
      difficulty: 'GAT Exam Level',
      score: correct,
      totalQuestions: questions.length,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattemptedQuestions: unattempted,
      sectionScores,
      timeSpent,
      questions,
      userAnswers,
    };

    addAttempt(attempt);
    setTestFinished(true);
    setShowConfirmSubmit(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (testFinished) {
    const verbalTotal = questions.filter(q => q.section.includes('Verbal')).length;
    const quantTotal = questions.filter(q => q.section.includes('Quantitative')).length;
    const analyticalTotal = questions.filter(q => q.section.includes('Analytical')).length;

    const correct = Object.values(userAnswers).filter((ans, i) => ans === questions[i]?.correct_answer).length;
    
    let verbalScore = 0;
    let quantScore = 0;
    let analyticalScore = 0;

    questions.forEach(q => {
      if (userAnswers[q.id] === q.correct_answer) {
        if (q.section.includes('Verbal')) verbalScore++;
        if (q.section.includes('Quantitative')) quantScore++;
        if (q.section.includes('Analytical')) analyticalScore++;
      }
    });

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl">Mock Test Complete</CardTitle>
            <CardDescription>Here is your performance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl font-bold text-indigo-600 mb-2">
                {correct} <span className="text-2xl text-slate-400">/ {questions.length}</span>
              </div>
              <p className="text-slate-500 font-medium">Total Score</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-sm text-slate-500 mb-1">Verbal Reasoning</p>
                <p className="text-2xl font-bold text-slate-900">{verbalScore} <span className="text-sm text-slate-400">/ {verbalTotal}</span></p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-sm text-slate-500 mb-1">Quantitative Reasoning</p>
                <p className="text-2xl font-bold text-slate-900">{quantScore} <span className="text-sm text-slate-400">/ {quantTotal}</span></p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-sm text-slate-500 mb-1">Analytical Reasoning</p>
                <p className="text-2xl font-bold text-slate-900">{analyticalScore} <span className="text-sm text-slate-400">/ {analyticalTotal}</span></p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setTestStarted(false);
                  setTestFinished(false);
                  setQuestions([]);
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testStarted && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const isFlagged = flagged[currentQuestion.id];

    return (
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
        {/* Main Test Area */}
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-slate-900">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-sm font-medium">
                {currentQuestion.section}
              </span>
            </div>
            <div className={cn(
              "flex items-center space-x-2 font-mono text-lg font-bold",
              timeLeft < 300 ? "text-red-600" : "text-slate-900"
            )}>
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <Card className="flex-1 overflow-y-auto">
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-xl font-medium text-slate-900 leading-relaxed">{currentQuestion.question}</h2>
                <button
                  onClick={toggleFlag}
                  className={cn(
                    "p-2 rounded-lg transition-colors ml-4 shrink-0",
                    isFlagged ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400 hover:text-slate-600"
                  )}
                  title="Mark for review"
                >
                  <Flag className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = userAnswers[currentQuestion.id] === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium",
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                          : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span className="inline-block w-6 font-bold text-slate-400 mr-2">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 flex items-center text-slate-600 font-medium disabled:opacity-50 hover:text-slate-900"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Previous
            </button>
            
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Submit Test
            </button>

            <button
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="px-4 py-2 flex items-center text-slate-600 font-medium disabled:opacity-50 hover:text-slate-900"
            >
              Next <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>

        {/* Navigation Panel */}
        <div className="w-full lg:w-80 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-64 lg:h-auto">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Question Navigator</h3>
            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-indigo-600 mr-1"></div> Answered</span>
              <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-slate-200 mr-1"></div> Unanswered</span>
              <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-400 mr-1"></div> Flagged</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!userAnswers[q.id];
                const isCurrent = idx === currentQuestionIndex;
                const isQFlagged = flagged[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={cn(
                      "h-10 rounded-lg text-sm font-medium flex items-center justify-center relative transition-colors",
                      isCurrent ? "ring-2 ring-offset-1 ring-slate-900" : "",
                      isAnswered ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {idx + 1}
                    {isQFlagged && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center space-x-2 text-amber-600 mb-2">
                  <AlertTriangle className="w-6 h-6" />
                  <CardTitle>Submit Test?</CardTitle>
                </div>
                <CardDescription>
                  You have answered {Object.keys(userAnswers).length} out of {questions.length} questions.
                  Are you sure you want to submit?
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={finishTest}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  Yes, Submit
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Full Mock Test</h1>
        <p className="text-slate-500 mt-2">Simulate the real NTS GAT General exam environment.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Total Questions</p>
              <p className="text-2xl font-bold text-slate-900">100</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Time Limit</p>
              <p className="text-2xl font-bold text-slate-900">120 mins</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Difficulty</p>
              <p className="text-2xl font-bold text-slate-900">GAT Level</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Section Breakdown:</h3>
            <ul className="space-y-2 text-slate-600 list-disc pl-5">
              <li><strong>Verbal Reasoning:</strong> 35 Questions (35%)</li>
              <li><strong>Quantitative Reasoning:</strong> 35 Questions (35%)</li>
              <li><strong>Analytical Reasoning:</strong> 30 Questions (30%)</li>
            </ul>
          </div>

          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm">
            <p className="font-semibold mb-1">Important Note:</p>
            <p>Do not refresh the page during the test. Your progress will be lost. You can flag questions to review them later before submitting.</p>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleStartTest}
              disabled={loading}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Generating Test...
                </>
              ) : (
                'Start Mock Test'
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
