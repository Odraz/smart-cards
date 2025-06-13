"use client";

import { useState, useEffect } from "react";
import type { CardSet, Card } from "@/types";
import { Button } from "@/components/ui/button";
import { Card as UICard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PracticeSessionProps {
  cardSet: CardSet;
}

export default function PracticeSession({ cardSet }: PracticeSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    // Shuffle cards on initial load or when cardSet changes
    setCards([...cardSet.cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsAnswerVisible(false);
  }, [cardSet]);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswerVisible(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsAnswerVisible(false);
    }
  };

  const handleToggleAnswer = () => {
    setIsAnswerVisible(prev => !prev);
  };

  const handleRestart = () => {
    setCards([...cardSet.cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsAnswerVisible(false);
  };
  
  if (cards.length === 0) {
    return (
      <UICard className="w-full max-w-2xl mx-auto mt-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center">No Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">This set has no cards to practice.</p>
        </CardContent>
      </UICard>
    );
  }

  const progressValue = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mt-2 sm:mt-8 flex flex-col items-center">
      <Progress value={progressValue} className="w-full mb-4 h-3" />
      <p className="text-sm text-muted-foreground mb-4 font-medium">
        Card {currentIndex + 1} of {cards.length}
      </p>

      <UICard 
        className={cn(
            "w-full min-h-[300px] sm:min-h-[400px] flex flex-col justify-between shadow-2xl transition-all duration-500 transform-gpu cursor-pointer",
            isAnswerVisible ? "border-accent shadow-[0_0_15px_hsl(var(--accent))]" : "border-primary shadow-[0_0_15px_hsl(var(--primary))]"
        )}
        onClick={handleToggleAnswer}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleToggleAnswer();}}
        aria-pressed={isAnswerVisible}
        aria-label={isAnswerVisible ? `Showing answer. ${currentCard.answer}` : `Showing question. ${currentCard.question}. Click to reveal answer.`}
      >
        <CardContent className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="transition-opacity duration-300 ease-in-out">
            <h3 className="text-2xl sm:text-3xl font-semibold mb-2 text-foreground/90">{isAnswerVisible ? "Answer" : "Question"}</h3>
            <p className="text-xl sm:text-2xl whitespace-pre-wrap text-foreground/80">
              {isAnswerVisible ? currentCard.answer : currentCard.question}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-4 border-t flex justify-center">
             <Button variant="ghost" onClick={(e) => { e.stopPropagation(); handleToggleAnswer(); }}>
                {isAnswerVisible ? <EyeOff className="mr-2 h-5 w-5" /> : <Eye className="mr-2 h-5 w-5" />}
                {isAnswerVisible ? "Hide Answer" : "Show Answer"}
            </Button>
        </CardFooter>
      </UICard>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
        <Button onClick={handlePrevious} disabled={currentIndex === 0} variant="outline" size="lg" className="shadow-md hover:shadow-lg">
          <ChevronLeft className="mr-2 h-5 w-5" /> Previous
        </Button>
        
        {currentIndex === cards.length - 1 ? (
          <Button onClick={handleRestart} size="lg" className="col-span-2 sm:col-span-1 bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg">
            <CheckCircle2 className="mr-2 h-5 w-5" /> Finish & Restart
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={currentIndex === cards.length - 1} size="lg" className="col-span-2 sm:col-span-1 shadow-md hover:shadow-lg">
            Next <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        )}
         <Button onClick={handleRestart} variant="secondary" size="lg" className="sm:hidden shadow-md hover:shadow-lg col-span-2">
            <RotateCcw className="mr-2 h-5 w-5" /> Restart
        </Button>
      </div>
    </div>
  );
}
