export interface Question {
  id: number;
  type: "multiple-choice" | "gap-fill" | "sentence-reorder" | "true-false" | "matching";
  sentence: string;
  options: string[];
  correctAnswer: number | string | string[];
  explanation: string;
  correctOrder?: string[];
  pairs?: { left: string; right: string }[];
}

export interface Level {
  id: number;
  title: string;
  mode: string;
  difficulty: "easy" | "medium" | "hard";
  questions: Question[];
  unlockRequirement?: number; // level ID that must be completed to unlock
}

export const levels: Level[] = [
  // Present Simple - Easy
  {
    id: 1,
    title: "Level 1: Basics",
    mode: "present-simple",
    difficulty: "easy",
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        sentence: "She ___ to school every day.",
        options: ["go", "goes", "going", "went"],
        correctAnswer: 1,
        explanation: "Use 'goes' with 'she' in present simple!",
      },
      {
        id: 2,
        type: "true-false",
        sentence: "He play soccer on weekends.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation: "False! It should be 'He plays' - add 's' for he/she/it!",
      },
      {
        id: 3,
        type: "gap-fill",
        sentence: "They ___ English at school.",
        options: ["learn", "learns", "learning", "learned"],
        correctAnswer: "learn",
        explanation: "Use 'learn' with 'they' in present simple!",
      },
    ],
  },
  // Present Simple - Medium
  {
    id: 2,
    title: "Level 2: Practice",
    mode: "present-simple",
    difficulty: "medium",
    unlockRequirement: 1,
    questions: [
      {
        id: 4,
        type: "sentence-reorder",
        sentence: "I eat breakfast every morning.",
        options: ["breakfast", "eat", "I", "every", "morning"],
        correctAnswer: 0,
        correctOrder: ["I", "eat", "breakfast", "every", "morning"],
        explanation: "Great! Remember: Subject + verb + object in present simple!",
      },
      {
        id: 5,
        type: "matching",
        sentence: "Match the subjects with correct verb forms:",
        options: ["I/You/We/They", "He/She/It", "play", "plays"],
        correctAnswer: ["I/You/We/They-play", "He/She/It-plays"],
        explanation: "Perfect! Remember: add 's' for he/she/it!",
        pairs: [
          { left: "I/You/We/They", right: "play" },
          { left: "He/She/It", right: "plays" },
        ],
      },
      {
        id: 6,
        type: "multiple-choice",
        sentence: "We ___ TV in the evening.",
        options: ["watches", "watch", "watching", "watched"],
        correctAnswer: 1,
        explanation: "Use 'watch' with 'we' in present simple!",
      },
    ],
  },
  // Past Simple
  {
    id: 3,
    title: "Level 1: Past Actions",
    mode: "past-simple",
    difficulty: "easy",
    unlockRequirement: 2,
    questions: [
      {
        id: 7,
        type: "gap-fill",
        sentence: "They ___ football yesterday.",
        options: ["play", "plays", "played", "playing"],
        correctAnswer: "played",
        explanation: "Use 'played' for past simple with 'yesterday'!",
      },
      {
        id: 8,
        type: "true-false",
        sentence: "She goed to the park last week.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation: "False! 'Go' is irregular - past form is 'went', not 'goed'!",
      },
      {
        id: 9,
        type: "multiple-choice",
        sentence: "I ___ my homework last night.",
        options: ["do", "does", "did", "doing"],
        correctAnswer: 2,
        explanation: "Use 'did' for past simple!",
      },
    ],
  },
  // Present Continuous
  {
    id: 4,
    title: "Level 1: Right Now",
    mode: "present-continuous",
    difficulty: "easy",
    unlockRequirement: 3,
    questions: [
      {
        id: 10,
        type: "sentence-reorder",
        sentence: "I am doing my homework right now.",
        options: ["homework", "am", "I", "my", "doing", "right", "now"],
        correctAnswer: 0,
        correctOrder: ["I", "am", "doing", "my", "homework", "right", "now"],
        explanation: "Perfect! Subject + am/is/are + verb-ing for present continuous!",
      },
      {
        id: 11,
        type: "multiple-choice",
        sentence: "She ___ a book now.",
        options: ["read", "reads", "is reading", "was reading"],
        correctAnswer: 2,
        explanation: "Use 'is reading' for present continuous with 'she'!",
      },
      {
        id: 12,
        type: "gap-fill",
        sentence: "They ___ to music at the moment.",
        options: ["listen", "listening", "are listening", "listened"],
        correctAnswer: "are listening",
        explanation: "Use 'are listening' for present continuous with 'they'!",
      },
    ],
  },
  // Present Perfect
  {
    id: 5,
    title: "Level 1: Experience",
    mode: "present-perfect",
    difficulty: "medium",
    unlockRequirement: 4,
    questions: [
      {
        id: 13,
        type: "multiple-choice",
        sentence: "I ___ to London twice.",
        options: ["go", "went", "have been", "am going"],
        correctAnswer: 2,
        explanation: "Use 'have been' for present perfect with experience!",
      },
      {
        id: 14,
        type: "true-false",
        sentence: "She has finish her work.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation: "False! It should be 'has finished' - use past participle!",
      },
      {
        id: 15,
        type: "gap-fill",
        sentence: "They ___ already eaten lunch.",
        options: ["are", "have", "has", "had"],
        correctAnswer: "have",
        explanation: "Use 'have' with 'they' in present perfect!",
      },
    ],
  },
  // Big Challenge Mix
  {
    id: 6,
    title: "Challenge 1: Mix",
    mode: "big-challenge",
    difficulty: "hard",
    unlockRequirement: 5,
    questions: [
      {
        id: 16,
        type: "matching",
        sentence: "Match the tenses with examples:",
        options: ["Present Simple", "Past Simple", "I play daily", "I played yesterday"],
        correctAnswer: ["Present Simple-I play daily", "Past Simple-I played yesterday"],
        pairs: [
          { left: "Present Simple", right: "I play daily" },
          { left: "Past Simple", right: "I played yesterday" },
        ],
        explanation: "Great job matching the tenses!",
      },
      {
        id: 17,
        type: "sentence-reorder",
        sentence: "She has been studying English for years.",
        options: ["has", "She", "been", "studying", "English", "for", "years"],
        correctAnswer: 0,
        correctOrder: ["She", "has", "been", "studying", "English", "for", "years"],
        explanation: "Perfect! This is present perfect continuous!",
      },
      {
        id: 18,
        type: "multiple-choice",
        sentence: "Right now, they ___ a test.",
        options: ["take", "are taking", "have taken", "took"],
        correctAnswer: 1,
        explanation: "Use present continuous for actions happening right now!",
      },
    ],
  },
];

export const getLevelsByMode = (mode: string): Level[] => {
  return levels.filter((level) => level.mode === mode);
};

export const getLevelById = (id: number): Level | undefined => {
  return levels.find((level) => level.id === id);
};
