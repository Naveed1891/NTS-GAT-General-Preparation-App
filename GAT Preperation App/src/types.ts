export interface Question {
  id: string;
  section: string;
  topic: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  date: string;
  type: 'practice' | 'mock';
  topic?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'GAT Exam Level';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedQuestions: number;
  sectionScores?: {
    Verbal: number;
    Quantitative: number;
    Analytical: number;
  };
  timeSpent: number; // in seconds
  questions: Question[];
  userAnswers: Record<string, string>;
}

export interface UserProgress {
  totalQuizzesAttempted: number;
  totalMockTestsAttempted: number;
  averageScore: number;
  history: QuizAttempt[];
  topicPerformance: Record<string, { attempted: number; correct: number }>;
}
