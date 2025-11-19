import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Star, Sparkles, Volume2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getLevelById, Question } from "@/data/levels";
import { useProgress } from "@/hooks/useProgress";
import { audioManager } from "@/utils/audio";
import GlassPanel from "@/components/GlassPanel";
import SectionCard from "@/components/SectionCard";

interface GamePlayProps {
  levelId: number;
  onBack: () => void;
}

const MAX_SESSION_QUESTIONS = 20;

const shuffleArray = <T,>(items: T[]): T[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const GamePlay = ({ levelId, onBack }: GamePlayProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [gapAnswer, setGapAnswer] = useState("");
  const [matchingPairs, setMatchingPairs] = useState<{ left: string | null; right: string | null }[]>([]);
  const [incorrectQuestionIds, setIncorrectQuestionIds] = useState<number[]>([]);
  const [attemptedQuestionIds, setAttemptedQuestionIds] = useState<number[]>([]);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const {
    progress,
    incorrectAnswers,
    updateLevelProgress,
    addIncorrectAnswer,
    saveLastPlayedLevel,
  } = useProgress();

  useEffect(() => {
    saveLastPlayedLevel(levelId);
  }, [levelId, saveLastPlayedLevel]);

  useEffect(() => {
    return () => {
      audioManager.stopSpeaking();
    };
  }, []);

  const level = getLevelById(levelId);
  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Level not found</p>
      </div>
    );
  }

  const buildSessionQuestions = (resetCycle = false): Question[] => {
    const levelQuestions = level.questions;
    if (!levelQuestions.length) return [];

    const askedHistory = resetCycle ? [] : progress[levelId]?.askedQuestions || [];
    const incorrectMap = new Map<number, Question>();
    incorrectAnswers.forEach((answer) => {
      if (answer.levelId !== levelId) return;
      const question = levelQuestions.find((q) => q.id === answer.questionId);
      if (question) {
        incorrectMap.set(question.id, question);
      }
    });

    const incorrectPool = shuffleArray(Array.from(incorrectMap.values()));
    const desiredCount = Math.min(MAX_SESSION_QUESTIONS, levelQuestions.length);
    const selected: Question[] = [...incorrectPool];

    const availableNew = levelQuestions.filter(
      (question) =>
        !askedHistory.includes(question.id) && !selected.some((chosen) => chosen.id === question.id)
    );

    if (selected.length < desiredCount) {
      selected.push(...shuffleArray(availableNew).slice(0, desiredCount - selected.length));
    }

    if (selected.length < desiredCount) {
      const fallbackPool = levelQuestions.filter(
        (question) => !selected.some((chosen) => chosen.id === question.id)
      );
      selected.push(...shuffleArray(fallbackPool).slice(0, desiredCount - selected.length));
    }

    return selected.slice(0, desiredCount);
  };

  const initializeSession = (resetCycle = false) => {
    const nextQuestions = buildSessionQuestions(resetCycle);
    setSessionQuestions(nextQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setLives(3);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setSelectedWords([]);
    setGapAnswer("");
    setMatchingPairs([]);
    setIncorrectQuestionIds([]);
    setAttemptedQuestionIds([]);
  };

  useEffect(() => {
    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId]);

  const questions = sessionQuestions;
  const currentQ = questions[currentQuestion];
  const progressValue = questions.length ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const recordAttempt = (questionId: number) => {
    setAttemptedQuestionIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  };

  useEffect(() => {
    audioManager.stopSpeaking();
  }, [currentQuestion]);

  if (questions.length === 0 || !currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[hsl(var(--hero-start))] to-[hsl(var(--hero-end))] px-4 py-6">
        <GlassPanel className="max-w-md text-center">
          <p className="text-2xl font-black text-foreground">No questions available</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This level doesn&apos;t have any available questions right now. Please choose another level.
          </p>
          <Button onClick={onBack} className="mt-6 rounded-full font-black">
            Back
          </Button>
        </GlassPanel>
      </div>
    );
  }

  const handleAnswerClick = (answerIndex: number) => {
    if (showFeedback) return;

    audioManager.playClick();
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQ.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    recordAttempt(currentQ.id);

    if (correct) {
      const updatedScore = score + 1;
      setScore(updatedScore);
      audioManager.playSuccess();
      toast.success("🎉 Correct!", {
        description: currentQ.explanation,
      });

      const button = document.getElementById(`answer-${answerIndex}`);
      if (button) {
        button.classList.add("animate-confetti");
      }
      moveToNextQuestion(true, updatedScore);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      audioManager.playError();

      const newIncorrectIds = incorrectQuestionIds.includes(currentQ.id)
        ? incorrectQuestionIds
        : [...incorrectQuestionIds, currentQ.id];
      setIncorrectQuestionIds(newIncorrectIds);
      addIncorrectAnswer({
        questionId: currentQ.id,
        levelId,
        question: currentQ.sentence,
        userAnswer: answerIndex,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
        timestamp: Date.now(),
      });

      toast.error("❌ Not quite!", {
        description: currentQ.explanation,
      });

      const button = document.getElementById(`answer-${answerIndex}`);
      if (button) {
        button.classList.add("animate-shake");
      }
      if (newLives <= 0) {
        setTimeout(() => concludeGame(score, newIncorrectIds, "fail"), 1500);
        return;
      }

      moveToNextQuestion(false, score, newIncorrectIds);
    }
  };

  const handleGapFillSubmit = () => {
    if (showFeedback || !gapAnswer.trim()) return;

    audioManager.playClick();
    const correct = gapAnswer.toLowerCase().trim() === (currentQ.correctAnswer as string).toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);
    recordAttempt(currentQ.id);

    if (correct) {
      const updatedScore = score + 1;
      setScore(updatedScore);
      audioManager.playSuccess();
      toast.success("🎉 Correct!", {
        description: currentQ.explanation,
      });
      moveToNextQuestion(true, updatedScore);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      audioManager.playError();

      const newIncorrectIds = incorrectQuestionIds.includes(currentQ.id)
        ? incorrectQuestionIds
        : [...incorrectQuestionIds, currentQ.id];
      setIncorrectQuestionIds(newIncorrectIds);
      addIncorrectAnswer({
        questionId: currentQ.id,
        levelId,
        question: currentQ.sentence,
        userAnswer: gapAnswer,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
        timestamp: Date.now(),
      });

      toast.error("❌ Not quite!", {
        description: currentQ.explanation,
      });

      if (newLives <= 0) {
        setTimeout(() => concludeGame(score, newIncorrectIds, "fail"), 1500);
        return;
      }

      moveToNextQuestion(false, score, newIncorrectIds);
    }
  };

  const handleWordClick = (word: string) => {
    if (showFeedback) return;
    setSelectedWords([...selectedWords, word]);
  };

  const handleRemoveWord = (index: number) => {
    if (showFeedback) return;
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
  };

  const handleReorderSubmit = () => {
    if (showFeedback || selectedWords.length !== currentQ.options.length) return;

    audioManager.playClick();
    const correct = JSON.stringify(selectedWords) === JSON.stringify(currentQ.correctOrder);
    setIsCorrect(correct);
    setShowFeedback(true);
    recordAttempt(currentQ.id);

    if (correct) {
      const updatedScore = score + 1;
      setScore(updatedScore);
      audioManager.playSuccess();
      toast.success("🎉 Correct!", {
        description: currentQ.explanation,
      });
      moveToNextQuestion(true, updatedScore);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      audioManager.playError();

      const newIncorrectIds = incorrectQuestionIds.includes(currentQ.id)
        ? incorrectQuestionIds
        : [...incorrectQuestionIds, currentQ.id];
      setIncorrectQuestionIds(newIncorrectIds);
      addIncorrectAnswer({
        questionId: currentQ.id,
        levelId,
        question: currentQ.sentence,
        userAnswer: selectedWords,
        correctAnswer: currentQ.correctOrder || [],
        explanation: currentQ.explanation,
        timestamp: Date.now(),
      });

      toast.error("❌ Not quite!", {
        description: `The correct order is: ${currentQ.correctOrder?.join(" ")}`,
      });

      if (newLives <= 0) {
        setTimeout(() => concludeGame(score, newIncorrectIds, "fail"), 1500);
        return;
      }

      moveToNextQuestion(false, score, newIncorrectIds);
    }
  };

  const handleTrueFalseClick = (answerIndex: number) => {
    if (showFeedback) return;

    audioManager.playClick();
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQ.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);
    recordAttempt(currentQ.id);

    if (correct) {
      const updatedScore = score + 1;
      setScore(updatedScore);
      audioManager.playSuccess();
      toast.success("🎉 Correct!", {
        description: currentQ.explanation,
      });
      moveToNextQuestion(true, updatedScore);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      audioManager.playError();

      const newIncorrectIds = incorrectQuestionIds.includes(currentQ.id)
        ? incorrectQuestionIds
        : [...incorrectQuestionIds, currentQ.id];
      setIncorrectQuestionIds(newIncorrectIds);
      addIncorrectAnswer({
        questionId: currentQ.id,
        levelId,
        question: currentQ.sentence,
        userAnswer: answerIndex,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
        timestamp: Date.now(),
      });

      toast.error("❌ Not quite!", {
        description: currentQ.explanation,
      });

      if (newLives <= 0) {
        setTimeout(() => concludeGame(score, newIncorrectIds, "fail"), 1500);
        return;
      }

      moveToNextQuestion(false, score, newIncorrectIds);
    }
  };

  const handleMatchingSelect = (item: string, side: "left" | "right") => {
    if (showFeedback) return;

    const newPairs = [...matchingPairs];
    const emptyPairIndex = newPairs.findIndex((pair) => 
      side === "left" ? pair.left === null : pair.right === null
    );

    if (emptyPairIndex !== -1) {
      if (side === "left") {
        newPairs[emptyPairIndex].left = item;
      } else {
        newPairs[emptyPairIndex].right = item;
      }
    } else {
      if (side === "left") {
        newPairs.push({ left: item, right: null });
      } else {
        newPairs.push({ left: null, right: item });
      }
    }

    setMatchingPairs(newPairs);
  };

  const handleMatchingSubmit = () => {
    if (showFeedback || matchingPairs.length < (currentQ.pairs?.length || 0)) return;

    audioManager.playClick();
    const userAnswers = matchingPairs
      .filter((pair) => pair.left && pair.right)
      .map((pair) => `${pair.left}-${pair.right}`);

    const correctAnswers = currentQ.correctAnswer as string[];
    const correct =
      JSON.stringify([...userAnswers].sort()) === JSON.stringify([...(correctAnswers || [])].sort());

    setIsCorrect(correct);
    setShowFeedback(true);
    recordAttempt(currentQ.id);

    if (correct) {
      const updatedScore = score + 1;
      setScore(updatedScore);
      audioManager.playSuccess();
      toast.success("🎉 Correct!", {
        description: currentQ.explanation,
      });
      moveToNextQuestion(true, updatedScore);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      audioManager.playError();

      const newIncorrectIds = incorrectQuestionIds.includes(currentQ.id)
        ? incorrectQuestionIds
        : [...incorrectQuestionIds, currentQ.id];
      setIncorrectQuestionIds(newIncorrectIds);
      addIncorrectAnswer({
        questionId: currentQ.id,
        levelId,
        question: currentQ.sentence,
        userAnswer: userAnswers,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
        timestamp: Date.now(),
      });

      toast.error("❌ Not quite!", {
        description: currentQ.explanation,
      });

      if (newLives <= 0) {
        setTimeout(() => concludeGame(score, newIncorrectIds, "fail"), 1500);
        return;
      }

      moveToNextQuestion(false, score, newIncorrectIds);
    }
  };

  const handleMatchingReset = () => {
    audioManager.playClick();
    setMatchingPairs([]);
  };

  const concludeGame = (
    finalScore: number,
    incorrectIds: number[],
    outcome: "success" | "fail"
  ) => {
    const totalQuestions = questions.length || MAX_SESSION_QUESTIONS;
    const isPerfect = outcome === "success" && finalScore === totalQuestions && totalQuestions > 0;

    updateLevelProgress({
      levelId,
      score: finalScore,
      totalQuestions,
      incorrectQuestionIds: incorrectIds,
      askedQuestionIds: isPerfect ? [] : attemptedQuestionIds,
      resetAskedQuestions: isPerfect,
    });

    audioManager.stopSpeaking();

    if (isPerfect) {
      audioManager.playLevelComplete();
      toast.success("🌟 Perfect round!", {
        description: "Starting a new set of questions!",
      });
      setTimeout(() => initializeSession(true), 1500);
      return;
    }

    if (outcome === "success") {
      audioManager.playLevelComplete();
      toast.success(`🏆 Level Complete! Score: ${finalScore}/${totalQuestions}`);
    } else {
      audioManager.playError();
      toast.error("💔 You're out of hearts!", {
        description: `Final score: ${finalScore}/${totalQuestions}`,
      });
    }

    setTimeout(() => onBack(), 2000);
  };

  const moveToNextQuestion = (
    correct: boolean,
    updatedScore: number,
    updatedIncorrectIds = incorrectQuestionIds
  ) => {
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setSelectedWords([]);
        setGapAnswer("");
        setMatchingPairs([]);
      } else {
        concludeGame(updatedScore, updatedIncorrectIds, "success");
      }
    }, 2000);
  };

  const handleSpeak = () => {
    audioManager.speakText(currentQ.sentence);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--hero-start))] to-[hsl(var(--hero-end))] px-4 py-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        <GlassPanel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="max-w-fit rounded-full border-2 border-border/80 font-black uppercase tracking-wide"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit level
            </Button>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Now playing</p>
              <h1 className="text-3xl font-black text-foreground">{level.title}</h1>
              <p className="text-sm text-muted-foreground">Mode: {level.mode.replace("-", " ")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={`life-${i}`}
                  className={`h-7 w-7 ${i < lives ? "text-destructive fill-destructive" : "text-border"}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-secondary-foreground">
              <Star className="h-5 w-5 fill-secondary-foreground" />
              <span className="text-xl font-black">{score}</span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </p>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-border/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>
            <Button onClick={handleSpeak} variant="secondary" size="sm" className="rounded-full font-black">
              <Volume2 className="mr-2 h-4 w-4" />
              Listen
            </Button>
          </div>
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Sparkles className="h-8 w-8 text-secondary" />
            </div>
            {currentQ.type === "gap-fill" ? (
              <p className="text-xl font-black leading-relaxed text-foreground md:text-3xl">
                {currentQ.sentence.split("___")[0]}
                <span className="mx-2 inline-block min-w-[90px] border-b-4 border-primary text-primary">
                  {gapAnswer || "___"}
                </span>
                {currentQ.sentence.split("___")[1]}
              </p>
            ) : currentQ.type === "sentence-reorder" ? (
              <div className="space-y-3">
                <p className="text-base font-semibold text-muted-foreground">Tap words to build the sentence:</p>
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
              </div>
            ) : (
              <p className="text-xl font-black leading-relaxed text-foreground md:text-3xl">{currentQ.sentence}</p>
            )}
          </div>
        </GlassPanel>

        <SectionCard
          title="Answer time"
          description="Buttons stay large and spaced so nothing overlaps on tablets."
        >
          {currentQ.type === "multiple-choice" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  id={`answer-${index}`}
                  onClick={() => handleAnswerClick(index)}
                  disabled={showFeedback}
                  className={`h-auto rounded-3xl border-3 border-border px-4 py-5 text-xl font-black transition ${
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
          )}

          {currentQ.type === "gap-fill" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      setGapAnswer(option);
                    }}
                    disabled={showFeedback}
                    id={`gap-${index}`}
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
          )}

          {currentQ.type === "sentence-reorder" && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-2">
                {currentQ.options
                  .filter((word) => !selectedWords.includes(word))
                  .map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleWordClick(option)}
                      disabled={showFeedback}
                      variant="outline"
                      className="rounded-full border-3 border-border px-4 py-3 text-lg font-black hover:border-primary"
                    >
                      {option}
                    </Button>
                  ))}
              </div>
              <Button
                onClick={handleReorderSubmit}
                disabled={selectedWords.length !== currentQ.options.length || showFeedback}
                className="w-full rounded-3xl border-3 border-primary py-4 text-lg font-black"
              >
                Check order
              </Button>
            </div>
          )}

          {currentQ.type === "true-false" && (
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleTrueFalseClick(index)}
                  disabled={showFeedback}
                  className={`h-auto rounded-3xl border-3 border-border py-5 text-2xl font-black ${
                    showFeedback
                      ? index === currentQ.correctAnswer
                        ? "bg-success text-success-foreground border-success"
                        : selectedAnswer === index
                        ? "bg-destructive text-destructive-foreground border-destructive"
                        : "opacity-70"
                      : "hover:border-primary"
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {currentQ.type === "matching" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Left side</p>
                  {currentQ.pairs?.map((pair, index) => (
                    <Button
                      key={`left-${index}`}
                      onClick={() => handleMatchingSelect(pair.left, "left")}
                      disabled={showFeedback || matchingPairs.some((p) => p.left === pair.left)}
                      variant={matchingPairs.some((p) => p.left === pair.left) ? "secondary" : "outline"}
                      className="w-full rounded-3xl border-3 border-border px-4 py-3 text-base font-black"
                    >
                      {pair.left}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Right side</p>
                  {currentQ.pairs?.map((pair, index) => (
                    <Button
                      key={`right-${index}`}
                      onClick={() => handleMatchingSelect(pair.right, "right")}
                      disabled={showFeedback || matchingPairs.some((p) => p.right === pair.right)}
                      variant={matchingPairs.some((p) => p.right === pair.right) ? "secondary" : "outline"}
                      className="w-full rounded-3xl border-3 border-border px-4 py-3 text-base font-black"
                    >
                      {pair.right}
                    </Button>
                  ))}
                </div>
              </div>
              {matchingPairs.length > 0 && (
                <div className="rounded-3xl border border-dashed border-border/80 bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
                  <p className="mb-2 text-xs font-black uppercase tracking-widest">Your matches</p>
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
                  disabled={matchingPairs.length < (currentQ.pairs?.length || 0) || showFeedback}
                  className="flex-1 rounded-3xl border-3 border-primary py-4 text-lg font-black"
                >
                  Check matches
                </Button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default GamePlay;
