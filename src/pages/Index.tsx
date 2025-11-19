import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Gamepad2, Sparkles, Star, Trophy, Zap } from "lucide-react";
import AppShell from "@/components/AppShell";
import SectionCard from "@/components/SectionCard";
import GlassPanel from "@/components/GlassPanel";
import { useProgress } from "@/hooks/useProgress";
import { gameModes } from "@/data/modes";
import { getLevelById } from "@/data/levels";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Game Modes", to: "/modes" },
  { label: "Lesson Time", to: "/tutorial" },
  { label: "Review Lab", to: "/review" },
];

const Index = () => {
  const navigate = useNavigate();
  const { progress, incorrectAnswers, lastPlayedLevel } = useProgress();

  const incorrectAnswersCount = incorrectAnswers.length;
  const stats = useMemo(() => {
    const entries = Object.values(progress || {});
    const completedLevels = entries.filter((entry) => entry.completed).length;
    const totalStars = entries.reduce((sum, entry) => sum + (entry.stars || 0), 0);
    const bestScore = entries.reduce((best, entry) => Math.max(best, entry.bestScore || 0), 0);

    return { completedLevels, totalStars, bestScore };
  }, [progress]);

  const handlePlayClick = () => {
    if (lastPlayedLevel && getLevelById(lastPlayedLevel)) {
      navigate(`/play/${lastPlayedLevel}`);
    } else {
      navigate("/modes");
    }
  };

  return (
    <AppShell
      title="Blast through verbs the playful way!"
      subtitle="Play mini-challenges, earn stars, and master every tense with sparkly feedback."
      badge="New modes + review lab"
      navItems={navItems}
      onPlayClick={handlePlayClick}
      actions={
        <Button size="sm" className="rounded-full font-black" onClick={() => navigate("/modes")}>
          Start playing
        </Button>
      }
    >
      <SectionCard
        title="Quick missions"
        description="Jump into a friendly mode to warm up."
        icon={<Gamepad2 className="h-6 w-6" />}
        actions={
          <Button variant="ghost" className="rounded-full" onClick={() => navigate("/modes")}>
            View all modes
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gameModes.slice(0, 3).map((mode) => (
            <button
              key={mode.id}
              onClick={() => navigate(`/levels/${mode.id}`)}
              className="group flex flex-col gap-3 rounded-[calc(var(--radius)+0.5rem)] border-[3px] border-border/70 bg-card/90 p-5 text-left shadow hover:-translate-y-1 hover:border-primary/70 transition"
            >
              <div
                className={`rounded-[1.75rem] bg-gradient-to-br ${mode.gradient} text-5xl p-4 text-center`}
                aria-hidden
              >
                {mode.icon}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-muted-foreground">{mode.difficulty}</p>
                <h3 className="text-2xl font-black">{mode.title}</h3>
                <p className="text-sm text-muted-foreground">{mode.description}</p>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      <GlassPanel className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white/70 p-4 text-center shadow-inner">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Levels cleared</p>
          <p className="text-3xl font-black text-primary">{stats.completedLevels}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 text-center shadow-inner">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stars collected</p>
          <p className="text-3xl font-black text-secondary">{stats.totalStars}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 text-center shadow-inner">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Best score</p>
          <p className="text-3xl font-black text-accent">{stats.bestScore}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 text-center shadow-inner">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Review cards</p>
          <p className="text-3xl font-black text-destructive">{incorrectAnswersCount}</p>
        </div>
      </GlassPanel>

      <SectionCard
        title="Review Lab"
        description="Practice tricky verbs using your saved mistakes."
        icon={<BookOpen className="h-6 w-6" />}
        actions={
          <Button
            className="rounded-full font-black"
            size="sm"
            disabled={incorrectAnswersCount === 0}
            onClick={() => navigate("/review")}
          >
            Start Review
          </Button>
        }
      >
        <div className="flex flex-col gap-4 rounded-[calc(var(--radius)+0.25rem)] border border-dashed border-primary/40 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-muted-foreground">
            {incorrectAnswersCount === 0
              ? "Nice! You have no tricky questions waiting."
              : `You have ${incorrectAnswersCount} cards ready to revisit.`}
          </p>
          <div className="flex items-center gap-3 text-primary">
            <Sparkles className="h-6 w-6" />
            <span className="text-sm font-black uppercase tracking-wide">Smart practice</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Why kids love Verb Bomb"
        description="Made for tablets, giant buttons, and colorful celebrations!"
        icon={<Zap className="h-6 w-6" />}
        compact
      >
        <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <li className="flex items-center gap-2 font-semibold text-foreground">
            <Star className="h-4 w-4 text-secondary" /> Sparkly confetti when you nail questions
          </li>
          <li className="flex items-center gap-2 font-semibold text-foreground">
            <Trophy className="h-4 w-4 text-accent" /> Collect stars and unlock missions
          </li>
          <li className="flex items-center gap-2 font-semibold text-foreground">
            <BookOpen className="h-4 w-4 text-primary" /> Built-in voice support for every prompt
          </li>
          <li className="flex items-center gap-2 font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-secondary" /> Designed for small hands & big imaginations
          </li>
        </ul>
      </SectionCard>

      <footer className="rounded-[calc(var(--radius)+0.25rem)] border border-dashed border-border/80 bg-white/70 p-4 text-center text-xs text-muted-foreground sm:text-sm">
        <p className="font-semibold text-foreground">Feedback: <a href="mailto:cs@bitebite.app" className="text-primary underline">cs@bitebite.app</a></p>
        <p className="mt-1 font-semibold text-foreground">Produced by Merlin Advisory Solution</p>
        <p className="mt-1 text-muted-foreground">© 2025 BiteBite. All rights reserved.</p>
      </footer>
    </AppShell>
  );
};

export default Index;
