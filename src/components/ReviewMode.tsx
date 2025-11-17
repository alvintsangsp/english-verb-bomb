import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { useProgress, IncorrectAnswer } from "@/hooks/useProgress";
import { getLevelById, Question } from "@/data/levels";
import { audioManager } from "@/utils/audio";
import { toast } from "sonner";
import GlassPanel from "@/components/GlassPanel";
import SectionCard from "@/components/SectionCard";

interface ReviewModeProps {
  onBack: () => void;
}

const ReviewMode = ({ onBack }: ReviewModeProps) => {
  const { getIncorrectAnswers, removeIncorrectAnswer, clearIncorrectAnswers } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<
    Array<{ question: Question; incorrectAnswer: IncorrectAnswer }>
  >([]);

  useEffect(() => {
    const incorrectAnswers = getIncorrectAnswers();
    const questions: Array<{ question: Question; incorrectAnswer: IncorrectAnswer }> = [];

    incorrectAnswers.forEach((incorrect) => {
      const level = getLevelById(incorrect.levelId);
      if (level) {
        const question = level.questions.find((q) => q.id === incorrect.questionId);
        if (question) {
          questions.push({ question, incorrectAnswer: incorrect });
        }
      }
    });

    setReviewQuestions(questions);
  }, []);

  if (reviewQuestions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[hsl(var(--hero-start))] to-[hsl(var(--hero-end))] px-4 py-6">
        <GlassPanel className="max-w-md text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
          <h2 className="text-3xl font-black text-foreground">Great job!</h2>
          <p className="mt-2 text-base text-muted-foreground">
            You have no tricky questions waiting. Keep playing to collect more stars.
          </p>
          <Button onClick={onBack} className="mt-6 rounded-full font-black">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back home
          </Button>
        </GlassPanel>
      </div>
    );
  }

  const currentReview = reviewQuestions[currentIndex];
  const currentQ = currentReview.question;

  const handleAnswerClick = (answerIndex: number) => {
    if (showFeedback) return;

    audioManager.playClick();
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQ.correctAnswer;
    setShowFeedback(true);

    if (correct) {
      audioManager.playSuccess();
      toast.success("🎉 Correct! Well done!", {
        description: "You've mastered this question!",
      });
      
      // Remove from incorrect answers
      removeIncorrectAnswer(currentQ.id, currentReview.incorrectAnswer.levelId);
      
      setTimeout(() => {
        if (currentIndex < reviewQuestions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
        } else {
          toast.success("🏆 Review Complete!");
          setTimeout(() => onBack(), 1500);
        }
      }, 2000);
    } else {
      audioManager.playError();
      toast.error("❌ Not quite!", {
        description: currentQ.explanation,
      });
      
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowFeedback(false);
      }, 2000);
    }
  };

  const handleSpeak = () => {
    audioManager.speakText(currentQ.sentence);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--hero-start))] to-[hsl(var(--hero-end))] px-4 py-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <GlassPanel className="flex flex-wrap items-center justify-between gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="rounded-full border-2 border-border/80 font-black uppercase tracking-wide"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3 rounded-full bg-secondary px-4 py-2 text-secondary-foreground">
            <BookOpen className="h-5 w-5" />
            <span className="text-lg font-black">
              {currentIndex + 1}/{reviewQuestions.length}
            </span>
          </div>
        </GlassPanel>

        <SectionCard
          title="Review question"
          description="Playful spacing keeps everything readable, even on tablets."
          icon={<Sparkles className="h-5 w-5" />}
        >
          <div className="space-y-4 text-center">
            <p className="text-2xl font-black text-foreground md:text-4xl">{currentQ.sentence}</p>
            <Button
              onClick={handleSpeak}
              variant="secondary"
              size="sm"
              className="rounded-full font-black"
            >
              🔊 Listen
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          title="Your previous answer"
          description="See what you chose last time."
          icon={<XCircle className="h-5 w-5 text-destructive" />}
        >
          <div className="rounded-3xl border border-destructive/40 bg-destructive/10 p-4 text-destructive">
            {typeof currentReview.incorrectAnswer.userAnswer === "object"
              ? JSON.stringify(currentReview.incorrectAnswer.userAnswer)
              : currentReview.incorrectAnswer.userAnswer}
          </div>
        </SectionCard>

        {currentQ.type === "multiple-choice" ? (
          <SectionCard
            title="Try again"
            description="Answers stay spaced so tiny fingers can tap confidently."
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  disabled={showFeedback}
                  className={`h-auto rounded-3xl border-3 border-border px-4 py-5 text-xl font-black ${
                    showFeedback
                      ? index === currentQ.correctAnswer
                        ? "bg-success text-success-foreground border-success"
                        : selectedAnswer === index
                        ? "bg-destructive text-destructive-foreground border-destructive"
                        : "opacity-80"
                      : "hover:border-primary hover:-translate-y-1"
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Replay suggestion"
            description="This question type is best practiced inside its level."
          >
            <p className="text-sm text-muted-foreground">
              Head back to the level to retry this interactive question type.
            </p>
          </SectionCard>
        )}
      </div>
    </div>
  );
};

export default ReviewMode;
