import { useState, useEffect, useCallback } from "react";

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
  askedQuestions?: number[];
}

interface ProgressState {
  [levelId: number]: LevelProgress;
}

const STORAGE_KEY = "english-verb-bomb-progress";
const INCORRECT_ANSWERS_KEY = "english-verb-bomb-incorrect-answers";
const LAST_PLAYED_LEVEL_KEY = "english-verb-bomb-last-level";

const isBrowser = typeof window !== "undefined";

const readJSON = <T,>(key: string, fallback: T): T => {
  if (!isBrowser) return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}"`, error);
    return fallback;
  }
};

const readNumber = (key: string): number | null => {
  if (!isBrowser) return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
};

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressState>(() =>
    readJSON(STORAGE_KEY, {})
  );
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>(() =>
    readJSON(INCORRECT_ANSWERS_KEY, [])
  );
  const [lastPlayedLevel, setLastPlayedLevel] = useState<number | null>(() =>
    readNumber(LAST_PLAYED_LEVEL_KEY)
  );

  // Save progress to localStorage
  const saveProgress = (newProgress: ProgressState) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  // Update progress for a level
  interface UpdateLevelProgressArgs {
    levelId: number;
    score: number;
    totalQuestions: number;
    incorrectQuestionIds?: number[];
    askedQuestionIds?: number[];
    resetAskedQuestions?: boolean;
  }

  const updateLevelProgress = ({
    levelId,
    score,
    totalQuestions,
    incorrectQuestionIds = [],
    askedQuestionIds = [],
    resetAskedQuestions = false,
  }: UpdateLevelProgressArgs) => {
    const stars = calculateStars(score, totalQuestions);
    const existingProgress = progress[levelId];
    const existingAsked = existingProgress?.askedQuestions || [];
    const askedSet = new Set(
      resetAskedQuestions ? askedQuestionIds : [...existingAsked, ...askedQuestionIds]
    );
    
    const newLevelProgress: LevelProgress = {
      levelId,
      completed: true,
      stars: Math.max(stars, existingProgress?.stars || 0),
      bestScore: Math.max(score, existingProgress?.bestScore || 0),
      incorrectAnswers: incorrectQuestionIds || [],
      askedQuestions: Array.from(askedSet),
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

  const saveLastPlayedLevel = useCallback((levelId: number) => {
    setLastPlayedLevel(levelId);
    if (isBrowser) {
      localStorage.setItem(LAST_PLAYED_LEVEL_KEY, String(levelId));
    }
  }, []);

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
    setLastPlayedLevel(null);
    if (isBrowser) {
      localStorage.removeItem(LAST_PLAYED_LEVEL_KEY);
    }
  };

  return {
    progress,
    incorrectAnswers,
    lastPlayedLevel,
    updateLevelProgress,
    isLevelUnlocked,
    getLevelProgress,
    resetProgress,
    addIncorrectAnswer,
    getIncorrectAnswers,
    removeIncorrectAnswer,
    clearIncorrectAnswers,
    saveLastPlayedLevel,
  };
};
