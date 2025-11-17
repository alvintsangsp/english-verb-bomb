import { useState, useEffect } from "react";

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  stars: number;
  bestScore: number;
}

interface ProgressState {
  [levelId: number]: LevelProgress;
}

const STORAGE_KEY = "english-verb-bomb-progress";

export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressState>({});

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load progress:", e);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (newProgress: ProgressState) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  // Update progress for a level
  const updateLevelProgress = (levelId: number, score: number, totalQuestions: number) => {
    const stars = calculateStars(score, totalQuestions);
    const existingProgress = progress[levelId];
    
    const newLevelProgress: LevelProgress = {
      levelId,
      completed: true,
      stars: Math.max(stars, existingProgress?.stars || 0),
      bestScore: Math.max(score, existingProgress?.bestScore || 0),
    };

    saveProgress({
      ...progress,
      [levelId]: newLevelProgress,
    });

    return newLevelProgress;
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
  };
};
