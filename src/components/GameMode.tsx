import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Lock } from "lucide-react";

interface Level {
  id: number;
  title: string;
  difficulty: "easy" | "hard";
  locked: boolean;
  stars: number;
}

interface GameModeProps {
  mode: string;
  onBack: () => void;
  onSelectLevel: (level: number) => void;
}

const GameMode = ({ mode, onBack, onSelectLevel }: GameModeProps) => {
  const levels: Level[] = [
    { id: 1, title: "Level 1", difficulty: "easy", locked: false, stars: 3 },
    { id: 2, title: "Level 2", difficulty: "easy", locked: false, stars: 2 },
    { id: 3, title: "Level 3", difficulty: "easy", locked: false, stars: 0 },
    { id: 4, title: "Level 4", difficulty: "hard", locked: true, stars: 0 },
    { id: 5, title: "Level 5", difficulty: "hard", locked: true, stars: 0 },
  ];

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
          {levels.map((level, index) => (
            <Card
              key={level.id}
              className={`overflow-hidden border-4 transition-all duration-300 cursor-pointer animate-bounce-in ${
                level.locked
                  ? "border-border opacity-60"
                  : "border-border hover:border-primary hover:scale-105 hover:shadow-2xl"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => !level.locked && onSelectLevel(level.id)}
            >
              <div className="p-6 md:p-8 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl md:text-3xl font-black text-primary">
                    {level.title}
                  </h3>
                  {level.locked && <Lock className="w-6 h-6 text-muted-foreground" />}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      level.difficulty === "easy"
                        ? "bg-success text-success-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {level.difficulty.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={`w-8 h-8 ${
                        star <= level.stars
                          ? "text-secondary fill-secondary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameMode;
