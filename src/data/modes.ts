export interface GameModeInfo {
  id: string;
  title: string;
  icon: string;
  description: string;
  gradient: string;
  difficulty: "easy" | "medium" | "hard";
  recommended?: string;
}

export const gameModes: GameModeInfo[] = [
  {
    id: "present-simple",
    title: "Present Simple",
    icon: "🎯",
    description: "Build strong habits with daily routines.",
    gradient: "from-sky-400 to-sky-600",
    difficulty: "easy",
    recommended: "Perfect starting point",
  },
  {
    id: "past-simple",
    title: "Past Simple",
    icon: "⏰",
    description: "Tell stories about what already happened.",
    gradient: "from-orange-400 to-amber-500",
    difficulty: "easy",
  },
  {
    id: "present-continuous",
    title: "Present Continuous",
    icon: "🏃",
    description: "Talk about actions happening right now.",
    gradient: "from-emerald-400 to-emerald-600",
    difficulty: "medium",
  },
  {
    id: "present-perfect",
    title: "Present Perfect",
    icon: "✨",
    description: "Share experiences and results.",
    gradient: "from-fuchsia-400 to-purple-500",
    difficulty: "medium",
  },
  {
    id: "big-challenge",
    title: "Big Challenge",
    icon: "🏆",
    description: "Mix-and-match all tenses!",
    gradient: "from-indigo-400 via-pink-500 to-yellow-400",
    difficulty: "hard",
    recommended: "Unlocks after Level 5",
  },
  {
    id: "future-simple",
    title: "Future Simple",
    icon: "🚀",
    description: "Make predictions and promises for tomorrow.",
    gradient: "from-cyan-400 to-blue-500",
    difficulty: "medium",
    recommended: "Great after Present Perfect",
  },
  {
    id: "past-continuous",
    title: "Past Continuous",
    icon: "🌧️",
    description: "Describe actions that were happening before.",
    gradient: "from-blue-500 to-indigo-500",
    difficulty: "medium",
  },
  {
    id: "lightning-round",
    title: "Lightning Round",
    icon: "⚡",
    description: "60-second speed run across every tense.",
    gradient: "from-rose-400 via-amber-400 to-lime-400",
    difficulty: "hard",
    recommended: "Brand-new game mode",
  },
];

export const getModeById = (modeId: string) => gameModes.find((mode) => mode.id === modeId);

