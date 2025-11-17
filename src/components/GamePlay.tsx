import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getLevelById, Question } from "@/data/levels";
import { useProgress } from "@/hooks/useProgress";

interface GamePlayProps {
  levelId: number;
  onBack: () => void;
}

const GamePlay = ({ levelId, onBack }: GamePlayProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [gapAnswer, setGapAnswer] = useState("");
  const [matchingPairs, setMatchingPairs] = useState<{left: string | null, right: string | null}[]>([]);
  const { updateLevelProgress } = useProgress();

  const level = getLevelById(levelId);
  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Level not found</p>
      </div>
    );
  }

  const questions = level.questions;

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerClick = (answerIndex: number) => {
    if (showFeedback) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQ.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
      toast.success("🎉 Correct!", {
        description: currentQ.explanation,
      });
      
      const button = document.getElementById(`answer-${answerIndex}`);
      if (button) {
        button.classList.add("animate-confetti");
      }
    } else {
      setLives(lives - 1);
      toast.error("❌ Not quite!", {
        description: currentQ.explanation,
      });
      
      const button = document.getElementById(`answer-${answerIndex}`);
      if (button) {
        button.classList.add("animate-shake");
      }
    }

    moveToNextQuestion(correct);
  };

  const handleGapFillSubmit = () => {
    if (showFeedback || !gapAnswer.trim()) return;

    const correct = gapAnswer.toLowerCase().trim() === (currentQ.correctAnswer as string).toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
      toast.success("🎉 Correct!", {
        description: currentQ.explanation,
      });
    } else {
      setLives(lives - 1);
      toast.error("❌ Not quite!", {
        description: currentQ.explanation,
      });
    }

    moveToNextQuestion(correct);
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

    const correct = JSON.stringify(selectedWords) === JSON.stringify(currentQ.correctOrder);
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
      toast.success("🎉 Correct!", {
        description: currentQ.explanation,
      });
    } else {
      setLives(lives - 1);
      toast.error("❌ Not quite!", {
        description: `The correct order is: ${currentQ.correctOrder?.join(" ")}`,
      });
    }

    moveToNextQuestion(correct);
  };

  const handleTrueFalseClick = (answerIndex: number) => {
    if (showFeedback) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQ.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
      toast.success("🎉 Correct!", {
        description: currentQ.explanation,
      });
    } else {
      setLives(lives - 1);
      toast.error("❌ Not quite!", {
        description: currentQ.explanation,
      });
    }

    moveToNextQuestion(correct);
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

    const userAnswers = matchingPairs
      .filter((pair) => pair.left && pair.right)
      .map((pair) => `${pair.left}-${pair.right}`);
    
    const correctAnswers = currentQ.correctAnswer as string[];
    const correct = JSON.stringify(userAnswers.sort()) === JSON.stringify(correctAnswers.sort());

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
      toast.success("🎉 Correct!", {
        description: currentQ.explanation,
      });
    } else {
      setLives(lives - 1);
      toast.error("❌ Not quite!", {
        description: currentQ.explanation,
      });
    }

    moveToNextQuestion(correct);
  };

  const moveToNextQuestion = (correct: boolean) => {
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setSelectedWords([]);
        setGapAnswer("");
        setMatchingPairs([]);
      } else {
        const finalScore = score + (correct ? 1 : 0);
        updateLevelProgress(levelId, finalScore, questions.length);
        toast.success(`🏆 Level Complete! Score: ${finalScore}/${questions.length}`);
        setTimeout(() => onBack(), 2000);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-2 md:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-screen max-h-screen">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2 md:mb-4 shrink-0">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="border-2 md:border-4 border-border hover:border-primary font-bold p-2"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-0.5 md:gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 md:w-8 md:h-8 ${
                    i < lives
                      ? "text-destructive fill-destructive"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 md:gap-2 bg-secondary px-2 md:px-4 py-1 md:py-2 rounded-full">
              <Star className="w-4 h-4 md:w-6 md:h-6 text-secondary-foreground fill-secondary-foreground" />
              <span className="text-base md:text-xl font-black text-secondary-foreground">
                {score}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="mb-2 md:mb-6 shrink-0">
          <div className="h-2 md:h-4 bg-muted rounded-full overflow-hidden border-2 md:border-4 border-border">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center mt-1 text-xs md:text-sm font-bold text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Compact Question Card */}
        <Card className="mb-2 md:mb-4 p-3 md:p-6 border-2 md:border-4 border-border animate-bounce-in shrink-0">
          <div className="text-center">
            <div className="mb-2 md:mb-4">
              <Sparkles className="w-6 h-6 md:w-10 md:h-10 mx-auto text-secondary mb-2" />
              {currentQ.type === "gap-fill" ? (
                <p className="text-lg md:text-3xl font-black text-foreground leading-snug md:leading-relaxed">
                  {currentQ.sentence.split("___")[0]}
                  <span className="inline-block min-w-[80px] md:min-w-[120px] border-b-2 md:border-b-4 border-primary mx-1 md:mx-2 text-primary">
                    {gapAnswer || "___"}
                  </span>
                  {currentQ.sentence.split("___")[1]}
                </p>
              ) : currentQ.type === "sentence-reorder" ? (
                <div>
                  <p className="text-sm md:text-lg font-bold text-muted-foreground mb-2 md:mb-3">
                    Put the words in the correct order:
                  </p>
                  {selectedWords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center mb-2 md:mb-3 min-h-[40px] md:min-h-[60px] p-2 md:p-4 bg-muted/30 rounded-lg">
                      {selectedWords.map((word, index) => (
                        <Button
                          key={`selected-${index}`}
                          onClick={() => handleRemoveWord(index)}
                          variant="secondary"
                          size="sm"
                          className="text-base md:text-xl font-black border-2 md:border-4 border-secondary px-2 md:px-4 py-1 md:py-2"
                        >
                          {word}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-lg md:text-3xl font-black text-foreground leading-snug md:leading-relaxed">
                  {currentQ.sentence}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Compact Answer Options */}
        <div className="flex-1 overflow-y-auto pb-4">
          {currentQ.type === "multiple-choice" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  id={`answer-${index}`}
                  onClick={() => handleAnswerClick(index)}
                  disabled={showFeedback}
                  size="sm"
                  className={`h-auto py-3 md:py-6 text-base md:text-2xl font-black border-2 md:border-4 transition-all duration-300 ${
                    showFeedback
                      ? index === currentQ.correctAnswer
                        ? "bg-success border-success text-success-foreground hover:bg-success"
                        : selectedAnswer === index
                        ? "bg-destructive border-destructive text-destructive-foreground hover:bg-destructive"
                        : "border-border"
                      : "border-border hover:border-primary hover:scale-105"
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {currentQ.type === "gap-fill" && (
            <div className="space-y-2 md:space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {currentQ.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      setGapAnswer(option);
                      if (!showFeedback) {
                        const button = document.getElementById(`gap-${index}`);
                        if (button) button.classList.add("animate-bounce-in");
                      }
                    }}
                    disabled={showFeedback}
                    id={`gap-${index}`}
                    size="sm"
                    variant={gapAnswer === option ? "default" : "outline"}
                    className={`py-3 md:py-6 text-base md:text-2xl font-black border-2 md:border-4 transition-all duration-300 ${
                      showFeedback && option === currentQ.correctAnswer
                        ? "bg-success border-success text-success-foreground"
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
                size="sm"
                className="w-full py-3 md:py-6 text-base md:text-2xl font-black border-2 md:border-4 border-primary"
              >
                Check Answer
              </Button>
            </div>
          )}

          {currentQ.type === "sentence-reorder" && (
            <div className="space-y-2 md:space-y-4">
              <div className="flex flex-wrap gap-1.5 md:gap-3 justify-center">
                {currentQ.options
                  .filter((word) => !selectedWords.includes(word))
                  .map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleWordClick(option)}
                      disabled={showFeedback}
                      size="sm"
                      className="py-2 md:py-6 px-3 md:px-6 text-base md:text-2xl font-black border-2 md:border-4 border-border hover:border-primary hover:scale-105"
                    >
                      {option}
                    </Button>
                  ))}
              </div>
              <Button
                onClick={handleReorderSubmit}
                disabled={selectedWords.length !== currentQ.options.length || showFeedback}
                size="sm"
                className="w-full py-3 md:py-6 text-base md:text-2xl font-black border-2 md:border-4 border-primary"
              >
                Check Answer
              </Button>
            </div>
          )}

          {currentQ.type === "true-false" && (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {currentQ.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleTrueFalseClick(index)}
                  disabled={showFeedback}
                  size="sm"
                  className={`h-auto py-4 md:py-8 text-xl md:text-3xl font-black border-2 md:border-4 transition-all duration-300 ${
                    showFeedback
                      ? index === currentQ.correctAnswer
                        ? "bg-success border-success text-success-foreground hover:bg-success"
                        : selectedAnswer === index
                        ? "bg-destructive border-destructive text-destructive-foreground hover:bg-destructive"
                        : "border-border"
                      : "border-border hover:border-primary hover:scale-105"
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          )}

          {currentQ.type === "matching" && (
            <div className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <p className="text-sm md:text-base font-bold text-center text-muted-foreground">Match Left</p>
                  {currentQ.pairs?.map((pair, index) => (
                    <Button
                      key={`left-${index}`}
                      onClick={() => handleMatchingSelect(pair.left, "left")}
                      disabled={showFeedback || matchingPairs.some(p => p.left === pair.left)}
                      size="sm"
                      variant={matchingPairs.some(p => p.left === pair.left) ? "secondary" : "outline"}
                      className="w-full py-3 md:py-4 text-sm md:text-lg font-black border-2 md:border-4"
                    >
                      {pair.left}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-sm md:text-base font-bold text-center text-muted-foreground">Match Right</p>
                  {currentQ.pairs?.map((pair, index) => (
                    <Button
                      key={`right-${index}`}
                      onClick={() => handleMatchingSelect(pair.right, "right")}
                      disabled={showFeedback || matchingPairs.some(p => p.right === pair.right)}
                      size="sm"
                      variant={matchingPairs.some(p => p.right === pair.right) ? "secondary" : "outline"}
                      className="w-full py-3 md:py-4 text-sm md:text-lg font-black border-2 md:border-4"
                    >
                      {pair.right}
                    </Button>
                  ))}
                </div>
              </div>
              {matchingPairs.length > 0 && (
                <div className="bg-muted/30 p-3 md:p-4 rounded-lg">
                  <p className="text-xs md:text-sm font-bold text-muted-foreground mb-2">Your matches:</p>
                  {matchingPairs.map((pair, index) => (
                    <div key={index} className="text-sm md:text-base font-semibold">
                      {pair.left} → {pair.right}
                    </div>
                  ))}
                </div>
              )}
              <Button
                onClick={handleMatchingSubmit}
                disabled={matchingPairs.length < (currentQ.pairs?.length || 0) || showFeedback}
                size="sm"
                className="w-full py-3 md:py-6 text-base md:text-2xl font-black border-2 md:border-4 border-primary"
              >
                Check Matches
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
