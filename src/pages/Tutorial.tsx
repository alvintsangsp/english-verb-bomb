import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/AppShell";
import GlassPanel from "@/components/GlassPanel";
import SectionCard from "@/components/SectionCard";
import {
  BookOpen,
  Sparkles,
  Lightbulb,
  GraduationCap,
  PartyPopper,
  Rocket,
  Clock,
} from "lucide-react";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Game Modes", to: "/modes" },
  { label: "Lesson Time", to: "/tutorial" },
  { label: "Review Lab", to: "/review" },
];

const tenseCards = [
  {
    title: "Present Simple",
    emoji: "☀️",
    description: "Use for routines or facts that always stay true.",
    pattern: "Subject + base verb (add s/es with he/she/it)",
    examples: ["I brush my teeth every day.", "She plays piano on Saturdays."],
    tip: "Look for words like every day, always, usually.",
  },
  {
    title: "Present Continuous",
    emoji: "🎨",
    description: "Use for actions happening right now.",
    pattern: "am/is/are + verb-ing",
    examples: ["We are painting a rainbow.", "The dog is wagging its tail."],
    tip: "Listen for now, at the moment, look!",
  },
  {
    title: "Past Simple",
    emoji: "🕰️",
    description: "Use for actions that finished in the past.",
    pattern: "Subject + past verb (played, jumped, went)",
    examples: ["They visited grandma last week.", "I jumped in the puddle yesterday."],
    tip: "Look for yesterday, last week, ago.",
  },
  {
    title: "Future Simple",
    emoji: "🚀",
    description: "Use for plans or guesses about the future.",
    pattern: "will + base verb",
    examples: ["I will build a Lego castle.", "Dad will cook dinner tonight."],
    tip: "Listen for tomorrow, next time, later.",
  },
];

const Tutorial = () => {
  const navigate = useNavigate();

  return (
    <AppShell
      title="Lesson Time"
      subtitle="Friendly explanations to make tricky verb tenses sparkle."
      badge="New! Kid tutorial"
      navItems={navItems}
      onPlayClick={() => navigate("/modes")}
      onReviewClick={() => navigate("/review")}
      hideHeroButtons
      actions={
        <Button size="sm" className="rounded-full font-black" onClick={() => navigate("/modes")}>
          Jump to practice
        </Button>
      }
    >
      <GlassPanel className="space-y-4">
        <div className="flex items-center gap-3 text-primary">
          <BookOpen className="h-6 w-6" />
          <p className="text-base font-black uppercase tracking-widest text-muted-foreground">
            Magical grammar guide
          </p>
        </div>
        <h2 className="text-3xl font-black text-foreground">Start here</h2>
        <p className="text-base text-muted-foreground">
          These notes explain how each tense works in the game. Scan the patterns, read the examples,
          then hop into a level to try them out!
        </p>
      </GlassPanel>

      <GlassPanel className="border-2 border-dashed border-amber-400 bg-amber-50/60 text-amber-950">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-6 w-6 text-amber-500" />
          <div>
            <p className="text-lg font-black">Friendly reminder</p>
            <p className="text-sm font-semibold">
              We&apos;re not certified teachers—just your grammar buddies. We double-check facts, but
              ask a teacher or parent if you&apos;re unsure about something. Learning together is the best!
            </p>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-5 md:grid-cols-2">
          {tenseCards.map((tense) => (
            <SectionCard
              key={tense.title}
              title={`${tense.emoji} ${tense.title}`}
              description={tense.description}
              icon={<Sparkles className="h-5 w-5 text-secondary" />}
            >
              <p className="text-sm font-semibold text-primary">Pattern:</p>
              <p className="mb-2 text-base text-foreground">{tense.pattern}</p>
              <p className="text-sm font-semibold text-secondary">Examples:</p>
              <ul className="mb-3 list-disc space-y-1 pl-5 text-base text-muted-foreground">
                {tense.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
              <div className="rounded-2xl bg-secondary/15 p-3 text-sm font-semibold text-secondary">
                <Lightbulb className="mr-2 inline h-4 w-4" />
                {tense.tip}
              </div>
            </SectionCard>
          ))}
      </div>

      <GlassPanel className="space-y-4">
        <div className="flex items-center gap-3 text-accent">
          <GraduationCap className="h-6 w-6" />
          <p className="text-base font-black uppercase tracking-widest text-muted-foreground">
            How to remember
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <SectionCard
            title="Draw it out"
            description="Sketch a tiny comic showing the action. If it’s happening now, color it bright!"
            compact
          />
          <SectionCard
            title="Time words"
            description="Circle clues like yesterday, today, tomorrow on each question."
            compact
          />
          <SectionCard
            title="Teach a buddy"
            description="Explain the sentence to a friend or toy—if they get it, so will you."
            compact
          />
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-3 border-primary/40 bg-primary/5">
        <div className="flex items-center gap-3 text-primary">
          <PartyPopper className="h-6 w-6" />
          <p className="text-base font-black uppercase tracking-widest text-primary">
            Warm-up ideas
          </p>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Present a “show and tell” sentence about something in the room.</li>
          <li>Mime an action and let someone guess the tense you used.</li>
          <li>Invent a silly future plan with “will” and draw it.</li>
        </ul>
      </GlassPanel>

      <GlassPanel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-black text-foreground">Ready to practise?</h3>
          <p className="text-sm text-muted-foreground">
            Try a level that matches today’s lesson or review tricky cards you saved earlier.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/modes")}
            className="rounded-full border-2 border-primary font-black"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Pick a Level
          </Button>
          <Button onClick={() => navigate("/review")} variant="secondary" className="rounded-full font-black">
            <Clock className="mr-2 h-4 w-4" />
            Review Lab
          </Button>
        </div>
      </GlassPanel>
    </AppShell>
  );
};

export default Tutorial;

