import { useState, useEffect } from "react";

export interface IncorrectAnswer {
  questionId: number;
  levelId: number;
  question: string;
  userAnswer: string | number | string[];
  correctAnswer: string | number | string[];
  explanation: string;
  timestamp: number;
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  stars: number;
  bestScore: number;
  incorrectAnswers?: number[]; // Array of question IDs answered incorrectly
}

interface ProgressState {
  [levelId: number]: LevelProgress;
}

const STORAGE_KEY = "english-verb-bomb-progress";
const INCORRECT_ANSWERS_KEY = "english-verb-bomb-incorrect-answers";

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressState>({});
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([]);

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedIncorrect = localStorage.getItem(INCORRECT_ANSWERS_KEY);
    
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load progress:", e);
      }
    }
    
    if (savedIncorrect) {
      try {
        setIncorrectAnswers(JSON.parse(savedIncorrect));
      } catch (e) {
        console.error("Failed to load incorrect answers:", e);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (newProgress: ProgressState) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  // Update progress for a level
  const updateLevelProgress = (
    levelId: number, 
    score: number, 
    totalQuestions: number, 
    incorrectQuestionIds?: number[]
  ) => {
    const stars = calculateStars(score, totalQuestions);
    const existingProgress = progress[levelId];
    
    const newLevelProgress: LevelProgress = {
      levelId,
      completed: true,
      stars: Math.max(stars, existingProgress?.stars || 0),
      bestScore: Math.max(score, existingProgress?.bestScore || 0),
      incorrectAnswers: incorrectQuestionIds || [],
    };

    saveProgress({
      ...progress,
      [levelId]: newLevelProgress,
    });

    return newLevelProgress;
  };

  // Add incorrect answer to review list
  const addIncorrectAnswer = (answer: IncorrectAnswer) => {
    const newIncorrectAnswers = [...incorrectAnswers, answer];
    setIncorrectAnswers(newIncorrectAnswers);
    localStorage.setItem(INCORRECT_ANSWERS_KEY, JSON.stringify(newIncorrectAnswers));
  };

  // Get all incorrect answers
  const getIncorrectAnswers = (): IncorrectAnswer[] => {
    return incorrectAnswers;
  };

  // Remove incorrect answer (when answered correctly in review)
  const removeIncorrectAnswer = (questionId: number, levelId: number) => {
    const filtered = incorrectAnswers.filter(
      (ans) => !(ans.questionId === questionId && ans.levelId === levelId)
    );
    setIncorrectAnswers(filtered);
    localStorage.setItem(INCORRECT_ANSWERS_KEY, JSON.stringify(filtered));
  };

  // Clear all incorrect answers
  const clearIncorrectAnswers = () => {
    setIncorrectAnswers([]);
    localStorage.removeItem(INCORRECT_ANSWERS_KEY);
  };

  // Check if a level is unlocked
  const isLevelUnlocked = (levelId: number, unlockRequirement?: number): boolean => {
    if (!unlockRequirement) return true;
    return progress[unlockRequirement]?.completed || false;
  };

  // Get progress for a specific level
  const getLevelProgress = (levelId: number): LevelProgress | null => {
    return progress[levelId] || null;
  };

  // Calculate stars based on score
  const calculateStars = (score: number, total: number): number => {
    const percentage = (score / total) * 100;
    if (percentage === 100) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Reset all progress
  const resetProgress = () => {
    saveProgress({});
  };

  return {
    progress,
    updateLevelProgress,
    isLevelUnlocked,
    getLevelProgress,
    resetProgress,
    addIncorrectAnswer,
    getIncorrectAnswers,
    removeIncorrectAnswer,
    clearIncorrectAnswers,
  };
};
