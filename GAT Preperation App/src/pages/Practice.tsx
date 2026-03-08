import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { generateQuestions } from '../services/gemini';
import { Question, QuizAttempt } from '../types';
import { useStore } from '../store/useStore';
import { Loader2, CheckCircle2, XCircle, ArrowRight, RefreshCcw } from 'lucide-react';
import { cn } from '../components/ui/card';

const topics = {
  'Verbal Reasoning': ['Vocabulary', 'Grammar', 'Reading comprehension'],
  'Quantitative Reasoning': ['Arithmetic', 'Algebra', 'Geometry', 'Data processing'],
  'Analytical Reasoning': ['Logical puzzles', 'Deductive reasoning', 'Critical thinking'],
};

export default function Practice() {
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'GAT Exam Level'>('Intermediate');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const { addAttempt } = useStore();

  const handleStartPractice = async () => {
    if (!selectedSection || !selectedTopic) return;
    setLoading(true);
    try {
      const generated = await generateQuestions(selectedSection, selectedTopic, difficulty, 10);
      setQuestions(generated);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setShowExplanation(false);
      setQuizFinished(false);
      setStartTime(Date.now());
    } catch (error) {
      console.error(error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (showExplanation) return;
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers({ ...userAnswers, [currentQuestion.id]: option });
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach(q => {
      const ans = userAnswers[q.id];
      if (!ans) unattempted++;
      else if (ans === q.correct_answer) correct++;
      else incorrect++;
    });

    const attempt: QuizAttempt = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
      type: 'practice',
      topic: selectedTopic,
      difficulty,
      score: correct,
      totalQuestions: questions.length,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      unattemptedQuestions: unattempted,
      timeSpent,
      questions,
      userAnswers,
    };

    addAttempt(attempt);
    setQuizFinished(true);
  };

  if (quizFinished) {
    const correct = Object.values(userAnswers).filter((ans, i) => ans === questions[i]?.correct_answer).length;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Practice Complete!</CardTitle>
            <CardDescription>You scored {correct} out of {questions.length}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setQuestions([]);
                setQuizFinished(false);
              }}
              className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Back to Topics
            </button>
            <button
              onClick={handleStartPractice}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Practice Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswered = showExplanation;
    const isCorrect = userAnswers[currentQuestion.id] === currentQuestion.correct_answer;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between text-sm font-medium text-slate-500">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{selectedTopic} • {difficulty}</span>
        </div>
        
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <Card>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-medium text-slate-900 mb-8">{currentQuestion.question}</h2>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswers[currentQuestion.id] === option;
                const isCorrectOption = option === currentQuestion.correct_answer;
                
                let optionClass = "border-slate-200 hover:border-indigo-600 hover:bg-indigo-50";
                if (isAnswered) {
                  if (isCorrectOption) {
                    optionClass = "border-emerald-500 bg-emerald-50 text-emerald-900";
                  } else if (isSelected) {
                    optionClass = "border-red-500 bg-red-50 text-red-900";
                  } else {
                    optionClass = "border-slate-200 opacity-50";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium flex items-center justify-between",
                      optionClass
                    )}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {isAnswered && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-600" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Explanation</h4>
                <p className="text-slate-700">{currentQuestion.explanation}</p>
              </div>
            )}

            {isAnswered && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Practice Quizzes</h1>
        <p className="text-slate-500 mt-2">Select a topic to generate a 10-question practice quiz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(topics).map(([section, sectionTopics]) => (
          <Card key={section} className={cn("cursor-pointer transition-all", selectedSection === section ? "ring-2 ring-indigo-600" : "")} onClick={() => setSelectedSection(section)}>
            <CardHeader>
              <CardTitle className="text-lg">{section}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sectionTopics.map(topic => (
                  <li key={topic} className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSection(section);
                        setSelectedTopic(topic);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        selectedTopic === topic && selectedSection === section
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {topic}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTopic && (
        <Card className="bg-indigo-50 border-indigo-100">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-indigo-900">Ready to practice {selectedTopic}?</h3>
              <p className="text-sm text-indigo-700 mt-1">10 questions • Untimed • Explanations included</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm font-medium text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="GAT Exam Level">GAT Exam Level</option>
              </select>
              <button
                onClick={handleStartPractice}
                disabled={loading}
                className="flex-1 md:flex-none px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Quiz'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
