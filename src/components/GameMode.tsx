import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Lock, Trophy } from "lucide-react";
import { getLevelsByMode } from "@/data/levels";
import { useProgress } from "@/hooks/useProgress";

interface GameModeProps {
  mode: string;
  onBack: () => void;
  onSelectLevel: (level: number) => void;
}

const GameMode = ({ mode, onBack, onSelectLevel }: GameModeProps) => {
  const { isLevelUnlocked, getLevelProgress } = useProgress();
  const levels = getLevelsByMode(mode);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="mb-6 border-4 border-border hover:border-primary font-bold text-lg"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Modes
        </Button>

        <div className="text-center mb-8 animate-bounce-in">
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-2">
            {mode.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-semibold">
            Choose your level
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {levels.map((level, index) => {
            const unlocked = isLevelUnlocked(level.id, level.unlockRequirement);
            const progress = getLevelProgress(level.id);
            
            return (
              <Card
                key={level.id}
                className={`overflow-hidden border-4 transition-all duration-300 animate-bounce-in ${
                  !unlocked
                    ? "border-border opacity-60 cursor-not-allowed"
                    : "border-border hover:border-primary hover:scale-105 hover:shadow-2xl cursor-pointer"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => unlocked && onSelectLevel(level.id)}
              >
                <div className="p-6 md:p-8 bg-card relative">
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                      <div className="text-center">
                        <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-bold text-muted-foreground">
                          Complete Level {level.unlockRequirement} to unlock
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl md:text-3xl font-black text-primary">
                      {level.title}
                    </h3>
                    {progress?.completed && (
                      <Trophy className="w-6 h-6 text-secondary fill-secondary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        level.difficulty === "easy"
                          ? "bg-success text-success-foreground"
                          : level.difficulty === "medium"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {level.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-8 h-8 ${
                          star <= (progress?.stars || 0)
                            ? "text-secondary fill-secondary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  {progress && (
                    <p className="text-sm text-muted-foreground font-semibold">
                      Best: {progress.bestScore}/{level.questions.length} correct
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameMode;
