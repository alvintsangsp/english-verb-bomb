import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Lock, Trophy, Sparkles } from "lucide-react";
import { getLevelsByMode } from "@/data/levels";
import { useProgress } from "@/hooks/useProgress";
import GlassPanel from "@/components/GlassPanel";
import SectionCard from "@/components/SectionCard";
import { getModeById } from "@/data/modes";
import { cn } from "@/lib/utils";

interface GameModeProps {
  mode: string;
  onBack: () => void;
  onSelectLevel: (level: number) => void;
}

const GameMode = ({ mode, onBack, onSelectLevel }: GameModeProps) => {
  const { isLevelUnlocked, getLevelProgress } = useProgress();
  const levels = getLevelsByMode(mode);
  const modeInfo = getModeById(mode);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--hero-start))] to-[hsl(var(--hero-end))] px-4 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <GlassPanel className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="rounded-full border-2 border-border/80 font-black uppercase tracking-wide"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
              {modeInfo?.difficulty ?? "Mode"}
            </span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-foreground sm:text-4xl">
                {modeInfo?.title || mode.replace("-", " ")}
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                {modeInfo?.description || "Choose a level to keep practicing this tense."}
              </p>
            </div>
            {modeInfo?.icon && (
              <div className="rounded-[2.5rem] bg-white/80 p-6 text-5xl shadow-inner">{modeInfo.icon}</div>
            )}
          </div>
        </GlassPanel>

        <SectionCard
          title="Choose your level"
          description="Bigger cards, clearer info, and no overlapping locks."
          icon={<Sparkles className="h-5 w-5" />}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {levels.map((level) => {
              const unlocked = isLevelUnlocked(level.id, level.unlockRequirement);
              const progress = getLevelProgress(level.id);

              return (
                <button
                  key={level.id}
                  onClick={() => unlocked && onSelectLevel(level.id)}
                  type="button"
                  className={cn(
                    "flex flex-col gap-4 rounded-[calc(var(--radius)+0.5rem)] border-[3px] border-border/70 bg-card/90 p-5 text-left transition",
                    unlocked ? "hover:-translate-y-1 hover:border-primary/80" : "opacity-60 cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Level</p>
                      <h3 className="text-2xl font-black text-foreground">{level.title}</h3>
                    </div>
                    {progress?.completed && <Trophy className="h-6 w-6 text-secondary" />}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-muted-foreground">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest",
                        level.difficulty === "easy"
                          ? "bg-success/20 text-success"
                          : level.difficulty === "medium"
                          ? "bg-secondary/20 text-secondary-foreground"
                          : "bg-accent/20 text-accent-foreground",
                      )}
                    >
                      {level.difficulty}
                    </span>
                    <span>{level.questions.length} questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={`${level.id}-star-${star}`}
                        className={cn(
                          "h-6 w-6",
                          star <= (progress?.stars || 0) ? "text-secondary fill-secondary" : "text-border",
                        )}
                      />
                    ))}
                  </div>
                  {progress && (
                    <p className="text-sm font-semibold text-muted-foreground">
                      Best score: {progress.bestScore}/{level.questions.length}
                    </p>
                  )}
                  {!unlocked && (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/40 px-3 py-2 text-sm font-semibold text-muted-foreground">
                      <Lock className="mr-2 inline h-4 w-4" />
                      Complete Level {level.unlockRequirement} to unlock
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default GameMode;
