import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Sparkles, Zap, Trophy, BookOpen } from "lucide-react";
import GameMode from "@/components/GameMode";
import GamePlay from "@/components/GamePlay";
import ReviewMode from "@/components/ReviewMode";
import { useProgress } from "@/hooks/useProgress";

const Index = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);
  const { getIncorrectAnswers } = useProgress();

  const incorrectAnswersCount = getIncorrectAnswers().length;

  const gameModes = [
    {
      id: "present-simple",
      title: "Present Simple",
      icon: "🎯",
      color: "bg-primary",
      description: "I play, you play, he plays",
    },
    {
      id: "past-simple",
      title: "Past Simple",
      icon: "⏰",
      color: "bg-secondary",
      description: "I played, you played",
    },
    {
      id: "present-continuous",
      title: "Present Continuous",
      icon: "🏃",
      color: "bg-success",
      description: "I am playing",
    },
    {
      id: "present-perfect",
      title: "Present Perfect",
      icon: "✨",
      color: "bg-accent",
      description: "I have played",
    },
    {
      id: "big-challenge",
      title: "Big Challenge",
      icon: "🏆",
      color: "bg-gradient-to-br from-primary via-secondary to-accent",
      description: "Mix of all tenses!",
    },
  ];

  if (showReview) {
    return <ReviewMode onBack={() => setShowReview(false)} />;
  }

  if (selectedLevel) {
    return (
      <GamePlay
        levelId={selectedLevel}
        onBack={() => {
          setSelectedLevel(null);
          setSelectedMode(null);
        }}
      />
    );
  }

  if (selectedMode) {
    return (
      <GameMode
        mode={selectedMode}
        onBack={() => setSelectedMode(null)}
        onSelectLevel={(level) => setSelectedLevel(level)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 animate-bounce-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-secondary animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-black text-primary">
              English Verb Bomb
            </h1>
            <Zap className="w-8 h-8 md:w-12 md:h-12 text-accent animate-pulse" />
          </div>
          <p className="text-lg md:text-2xl text-muted-foreground font-semibold">
            Master English verbs through fun games! 🎮
          </p>
        </div>

        {/* Review Mode Card */}
        {incorrectAnswersCount > 0 && (
          <Card
            className="mb-6 overflow-hidden border-4 border-primary hover:scale-105 transition-all duration-300 cursor-pointer animate-bounce-in"
            onClick={() => setShowReview(true)}
          >
            <div className="bg-gradient-to-r from-primary to-secondary p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <BookOpen className="w-12 h-12 text-white" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
                      Review Mode
                    </h2>
                    <p className="text-white/90 text-base md:text-lg font-semibold">
                      Practice your incorrect answers
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center">
                  <span className="text-3xl font-black text-primary">
                    {incorrectAnswersCount}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {gameModes.map((mode, index) => (
            <Card
              key={mode.id}
              className="overflow-hidden border-4 border-border hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer animate-bounce-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedMode(mode.id)}
            >
              <div className={`${mode.color} p-6 md:p-8`}>
                <div className="text-center">
                  <div className="text-6xl md:text-7xl mb-4">{mode.icon}</div>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                    {mode.title}
                  </h2>
                  <p className="text-white/90 text-base md:text-lg font-semibold">
                    {mode.description}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-card">
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-5 h-5 text-secondary fill-secondary" />
                  <Star className="w-5 h-5 text-secondary fill-secondary" />
                  <Star className="w-5 h-5 text-secondary fill-secondary" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-8 md:mt-12 text-center">
          <Card className="inline-block p-4 md:p-6 border-4 border-border">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
                <div className="text-left">
                  <p className="text-xs md:text-sm text-muted-foreground font-semibold">
                    Total Stars
                  </p>
                  <p className="text-xl md:text-2xl font-black text-primary">0</p>
                </div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                <div className="text-left">
                  <p className="text-xs md:text-sm text-muted-foreground font-semibold">
                    Levels Completed
                  </p>
                  <p className="text-xl md:text-2xl font-black text-primary">0</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
