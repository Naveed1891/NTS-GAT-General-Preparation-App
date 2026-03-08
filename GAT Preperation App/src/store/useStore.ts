import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizAttempt, UserProgress } from '../types';

interface AppState {
  progress: UserProgress;
  addAttempt: (attempt: QuizAttempt) => void;
  clearHistory: () => void;
}

const initialProgress: UserProgress = {
  totalQuizzesAttempted: 0,
  totalMockTestsAttempted: 0,
  averageScore: 0,
  history: [],
  topicPerformance: {},
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      progress: initialProgress,
      addAttempt: (attempt) =>
        set((state) => {
          const newHistory = [attempt, ...state.progress.history];
          
          let totalScore = 0;
          let totalQuizzes = 0;
          let totalMocks = 0;
          
          newHistory.forEach(h => {
            totalScore += (h.score / h.totalQuestions) * 100;
            if (h.type === 'practice') totalQuizzes++;
            if (h.type === 'mock') totalMocks++;
          });
          
          const averageScore = totalScore / newHistory.length;
          
          const newTopicPerformance = { ...state.progress.topicPerformance };
          
          attempt.questions.forEach(q => {
            if (!newTopicPerformance[q.topic]) {
              newTopicPerformance[q.topic] = { attempted: 0, correct: 0 };
            }
            newTopicPerformance[q.topic].attempted++;
            if (attempt.userAnswers[q.id] === q.correct_answer) {
              newTopicPerformance[q.topic].correct++;
            }
          });

          return {
            progress: {
              totalQuizzesAttempted: totalQuizzes,
              totalMockTestsAttempted: totalMocks,
              averageScore,
              history: newHistory,
              topicPerformance: newTopicPerformance,
            },
          };
        }),
      clearHistory: () => set({ progress: initialProgress }),
    }),
    {
      name: 'nts-gat-storage',
    }
  )
);
