import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
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
  const { incorrectAnswers, removeIncorrectAnswer } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gapAnswer, setGapAnswer] = useState("");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<
    { left: string | null; right: string | null }[]
  >([]);
  const [reviewQuestions, setReviewQuestions] = useState<
    Array<{ question: Question; incorrectAnswer: IncorrectAnswer }>
  >([]);

  useEffect(() => {
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
  }, [incorrectAnswers]);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setGapAnswer("");
    setSelectedWords([]);
    setMatchingPairs([]);
  }, [currentIndex, reviewQuestions.length]);

  useEffect(() => {
    if (reviewQuestions.length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex > reviewQuestions.length - 1) {
      setCurrentIndex(reviewQuestions.length - 1);
    }
  }, [reviewQuestions.length, currentIndex]);

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

  const handleCorrect = () => {
    audioManager.playSuccess();
    toast.success("🎉 Correct! Well done!", {
      description: "You've mastered this question!",
    });
    removeIncorrectAnswer(currentQ.id, currentReview.incorrectAnswer.levelId);

    setTimeout(() => {
      if (currentIndex < reviewQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        toast.success("🏆 Review Complete!");
        setTimeout(() => onBack(), 1500);
      }
    }, 1500);
  };

  const handleIncorrect = (message?: string) => {
    audioManager.playError();
    toast.error("❌ Not quite!", {
      description: message || currentQ.explanation,
    });
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setGapAnswer("");
      setSelectedWords([]);
      setMatchingPairs([]);
    }, 1200);
  };

  const handleAnswerClick = (answerIndex: number) => {
    if (showFeedback) return;

    audioManager.playClick();
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQ.correctAnswer;
    setShowFeedback(true);

    if (correct) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  const handleGapFillSubmit = () => {
    if (showFeedback || !gapAnswer) return;
    audioManager.playClick();
    const correct =
      gapAnswer.toLowerCase().trim() ===
      (currentQ.correctAnswer as string).toLowerCase().trim();
    setShowFeedback(true);
    if (correct) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  const handleWordClick = (word: string) => {
    if (showFeedback) return;
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (index: number) => {
    if (showFeedback) return;
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReorderSubmit = () => {
    if (showFeedback || selectedWords.length !== currentQ.options.length) return;
    audioManager.playClick();
    const correct =
      JSON.stringify(selectedWords) === JSON.stringify(currentQ.correctOrder);
    setShowFeedback(true);
    if (correct) {
      handleCorrect();
    } else {
      handleIncorrect(
        `The correct order is: ${currentQ.correctOrder?.join(" ")}`
      );
    }
  };

  const handleMatchingSelect = (item: string, side: "left" | "right") => {
    if (showFeedback) return;

    setMatchingPairs((prev) => {
      const pairs = [...prev];
      const emptyIndex = pairs.findIndex((pair) =>
        side === "left" ? pair.left === null : pair.right === null
      );

      if (emptyIndex !== -1) {
        if (side === "left") {
          pairs[emptyIndex].left = item;
        } else {
          pairs[emptyIndex].right = item;
        }
      } else {
        pairs.push({
          left: side === "left" ? item : null,
          right: side === "right" ? item : null,
        });
      }

      return pairs;
    });
  };

  const handleMatchingSubmit = () => {
    if (showFeedback || matchingPairs.length === 0) return;
    const userAnswers = matchingPairs
      .filter((pair) => pair.left && pair.right)
      .map((pair) => `${pair.left}-${pair.right}`);

    const correctAnswers = currentQ.correctAnswer as string[];
    const correct =
      JSON.stringify(userAnswers.slice().sort()) ===
      JSON.stringify([...correctAnswers].sort());

    setShowFeedback(true);
    if (correct) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  const handleMatchingReset = () => {
    if (showFeedback) return;
    audioManager.playClick();
    setMatchingPairs([]);
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

        {currentQ.type === "multiple-choice" || currentQ.type === "true-false" ? (
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
          <>
            {currentQ.type === "gap-fill" && (
              <SectionCard
                title="Try again"
                description="Tap the best word, then check your answer."
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {currentQ.options.map((option, index) => (
                      <Button
                        key={index}
                        onClick={() => setGapAnswer(option)}
                        disabled={showFeedback}
                        variant={gapAnswer === option ? "default" : "outline"}
                        className={`rounded-3xl border-3 px-4 py-4 text-lg font-black ${
                          showFeedback && option === currentQ.correctAnswer
                            ? "bg-success text-success-foreground border-success"
                            : ""
                        }`}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={handleGapFillSubmit}
                    disabled={!gapAnswer || showFeedback}
                    className="w-full rounded-3xl border-3 border-primary py-4 text-lg font-black"
                  >
                    Check answer
                  </Button>
                </div>
              </SectionCard>
            )}

            {currentQ.type === "sentence-reorder" && (
              <SectionCard
                title="Try again"
                description="Tap each word to rebuild the sentence."
              >
                <div className="space-y-4">
                  {selectedWords.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 rounded-3xl border border-dashed border-border/70 bg-muted/40 p-3">
                      {selectedWords.map((word, index) => (
                        <Button
                          key={`selected-${index}`}
                          onClick={() => handleRemoveWord(index)}
                          size="sm"
                          variant="secondary"
                          className="rounded-full border-2 border-secondary px-3 py-1 text-lg font-black"
                        >
                          {word}
                        </Button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentQ.options
                      .filter((word) => !selectedWords.includes(word))
                      .map((option, index) => (
                        <Button
                          key={index}
                          onClick={() => handleWordClick(option)}
                          disabled={showFeedback}
                          variant="outline"
                          className="rounded-full border-3 border-border px-4 py-3 text-lg font-black"
                        >
                          {option}
                        </Button>
                      ))}
                  </div>
                  <Button
                    onClick={handleReorderSubmit}
                    disabled={
                      selectedWords.length !== currentQ.options.length || showFeedback
                    }
                    className="w-full rounded-3xl border-3 border-primary py-4 text-lg font-black"
                  >
                    Check order
                  </Button>
                </div>
              </SectionCard>
            )}

            {currentQ.type === "matching" && (
              <SectionCard
                title="Try again"
                description="Match each pair to nail the concept."
              >
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Left side
                      </p>
                      {currentQ.pairs?.map((pair, index) => (
                        <Button
                          key={`left-${index}`}
                          onClick={() => handleMatchingSelect(pair.left, "left")}
                          disabled={
                            showFeedback ||
                            matchingPairs.some((p) => p.left === pair.left)
                          }
                          variant={
                            matchingPairs.some((p) => p.left === pair.left)
                              ? "secondary"
                              : "outline"
                          }
                          className="w-full rounded-3xl border-3 border-border px-4 py-3 text-base font-black"
                        >
                          {pair.left}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                        Right side
                      </p>
                      {currentQ.pairs?.map((pair, index) => (
                        <Button
                          key={`right-${index}`}
                          onClick={() => handleMatchingSelect(pair.right, "right")}
                          disabled={
                            showFeedback ||
                            matchingPairs.some((p) => p.right === pair.right)
                          }
                          variant={
                            matchingPairs.some((p) => p.right === pair.right)
                              ? "secondary"
                              : "outline"
                          }
                          className="w-full rounded-3xl border-3 border-border px-4 py-3 text-base font-black"
                        >
                          {pair.right}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {matchingPairs.length > 0 && (
                    <div className="rounded-3xl border border-dashed border-border/80 bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
                      <p className="mb-2 text-xs font-black uppercase tracking-widest">
                        Your matches
                      </p>
                      {matchingPairs.map((pair, index) => (
                        <div key={`pair-${index}`}>
                          {pair.left} → {pair.right}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleMatchingReset}
                      variant="outline"
                      disabled={showFeedback || matchingPairs.length === 0}
                      className="flex-1 rounded-3xl border-3 border-border py-4 text-lg font-black"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleMatchingSubmit}
                      disabled={showFeedback || matchingPairs.length === 0}
                      className="flex-1 rounded-3xl border-3 border-primary py-4 text-lg font-black"
                    >
                      Check matches
                    </Button>
                  </div>
                </div>
              </SectionCard>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewMode;
