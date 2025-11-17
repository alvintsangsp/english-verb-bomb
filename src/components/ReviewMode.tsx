import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { useProgress, IncorrectAnswer } from "@/hooks/useProgress";
import { getLevelById, Question } from "@/data/levels";
import { audioManager } from "@/utils/audio";
import { toast } from "sonner";

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
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-4 md:p-8 flex items-center justify-center">
        <Card className="p-8 border-4 border-border text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-black text-primary mb-4">
            Great Job!
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            You have no incorrect answers to review. Keep up the excellent work!
          </p>
          <Button onClick={onBack} size="lg" className="font-bold">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </Card>
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
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="border-4 border-border hover:border-primary font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
            <BookOpen className="w-6 h-6 text-secondary-foreground" />
            <span className="text-xl font-black text-secondary-foreground">
              {currentIndex + 1}/{reviewQuestions.length}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8 animate-bounce-in">
          <h1 className="text-3xl md:text-5xl font-black text-primary mb-2">
            Review Mode
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-semibold">
            Practice your incorrect answers
          </p>
        </div>

        {/* Question Card */}
        <Card className="mb-6 p-6 md:p-8 border-4 border-border animate-bounce-in">
          <div className="text-center">
            <div className="mb-4">
              <Sparkles className="w-10 h-10 mx-auto text-secondary mb-2" />
              <p className="text-2xl md:text-4xl font-black text-foreground leading-relaxed">
                {currentQ.sentence}
              </p>
            </div>
            <Button
              onClick={handleSpeak}
              variant="outline"
              size="sm"
              className="border-2 border-border hover:border-primary font-bold"
            >
              🔊 Listen
            </Button>
          </div>
        </Card>

        {/* Previous Wrong Answer */}
        <Card className="mb-6 p-4 border-2 border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-muted-foreground mb-1">
                You previously answered:
              </p>
              <p className="text-lg font-black text-destructive">
                {typeof currentReview.incorrectAnswer.userAnswer === 'object'
                  ? JSON.stringify(currentReview.incorrectAnswer.userAnswer)
                  : currentReview.incorrectAnswer.userAnswer}
              </p>
            </div>
          </div>
        </Card>

        {/* Answer Options */}
        {currentQ.type === "multiple-choice" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={showFeedback}
                size="lg"
                className={`h-auto py-6 text-2xl font-black border-4 transition-all duration-300 ${
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
      </div>
    </div>
  );
};

export default ReviewMode;
