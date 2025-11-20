import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/AppShell";
import SectionCard from "@/components/SectionCard";
import GlassPanel from "@/components/GlassPanel";
import { gameModes } from "@/data/modes";
import { Sparkles } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { getLevelById } from "@/data/levels";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Game Modes", to: "/modes" },
  { label: "Lesson Time", to: "/tutorial" },
  { label: "Review Lab", to: "/review" },
];

const Modes = () => {
  const navigate = useNavigate();
  const { lastPlayedLevel } = useProgress();

  const handlePlayClick = () => {
    if (lastPlayedLevel && getLevelById(lastPlayedLevel)) {
      navigate(`/play/${lastPlayedLevel}`);
    } else {
      navigate("/modes");
    }
  };

  return (
    <AppShell
      title="Pick a mode, earn shiny stars"
      subtitle="Each mode focuses on a specific tense so practice stays clear and comfy."
      badge="Choose your adventure"
      navItems={navItems}
      onPlayClick={handlePlayClick}
      actions={
        <Button size="sm" className="rounded-full font-black" onClick={() => navigate("/")}>
          Back Home
        </Button>
      }
    >
      <SectionCard
        title="Match your mood"
        description="Tap a card to jump straight into its level list."
        icon={<Sparkles className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {gameModes.map((mode) => (
            <div
              key={mode.id}
              className="rounded-[calc(var(--radius)+0.5rem)] border-[3px] border-border/70 bg-card p-5 shadow-lg"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center text-6xl">
                  {mode.icon}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{mode.difficulty}</p>
                  <h3 className="text-3xl font-black text-foreground">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
                {mode.recommended && (
                  <div className="rounded-full border border-dashed border-primary/40 px-4 py-1 text-xs font-black uppercase text-primary">
                    {mode.recommended}
                  </div>
                )}
                <Button
                  size="lg"
                  className="rounded-full font-black"
                  onClick={() => navigate(`/levels/${mode.id}`)}
                >
                  See levels
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <GlassPanel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-black text-foreground">Need a hint?</h3>
          <p className="text-sm text-muted-foreground">
            Start with Present Simple and unlock the Big Challenge once you feel confident.
          </p>
        </div>
        <Button variant="secondary" className="rounded-full font-black" onClick={() => navigate("/review")}>
          Practice mistakes
        </Button>
      </GlassPanel>
    </AppShell>
  );
};

export default Modes;

