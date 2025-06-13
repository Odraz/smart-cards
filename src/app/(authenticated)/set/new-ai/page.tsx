
"use client";

import { useState } from "react";
import AISetGenerationForm from "@/components/set/AISetGenerationForm";
import SetEditorForm from "@/components/set/SetEditorForm";
import { useAuth } from "@/hooks/useAuth";
import { addCardSet } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Card, CardSet } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Timestamp } from "firebase/firestore";

interface SetFormDataForSave {
  name: string;
  cards: Card[]; 
  language?: string;
  aiGenerated?: boolean;
}

export default function NewAISetPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedData, setGeneratedData] = useState<{ name: string; cards: Card[]; language: string } | null>(null);
  const [view, setView] = useState<"generate" | "review">("generate");

  const handleCardsGenerated = (setName: string, cards: Card[], language: string) => {
    setGeneratedData({ name: setName, cards, language });
    setView("review");
  };

  const handleSubmitReview = async (data: SetFormDataForSave) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Ensure cards have IDs
      const cardsWithIds: Card[] = data.cards.map(card => ({
        ...card,
        id: card.id || crypto.randomUUID(),
      }));

      const setPayload: Omit<CardSet, "id" | "userId" | "createdAt" | "updatedAt"> = {
        name: data.name,
        cards: cardsWithIds,
        aiGenerated: true,
      };

      if (data.language !== undefined) {
        setPayload.language = data.language;
      }

      const newSetId = await addCardSet(user.uid, setPayload);
      toast({ title: "Success", description: "AI-generated card set saved successfully!" });
      router.push(`/set/${newSetId}/edit`); // Or /dashboard
    } catch (error) {
      console.error("Error saving AI card set:", error);
      toast({ title: "Error", description: "Could not save AI card set. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === "generate") {
    return (
      <div className="space-y-6">
         <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={() => router.back()} disabled={isSubmitting}>
             <ArrowLeft className="h-4 w-4" />
           </Button>
           <h1 className="text-3xl font-headline font-semibold">Create New Set with AI</h1>
         </div>
        <AISetGenerationForm onCardsGenerated={handleCardsGenerated} />
      </div>
    );
  }

  if (view === "review" && generatedData) {
    const initialSetDataForEditor: CardSet = {
      id: "", // Temporary, will be generated on save
      name: generatedData.name,
      userId: user?.uid || "",
      cards: generatedData.cards,
      createdAt: new Date() as unknown as Timestamp, // Temporary
      updatedAt: new Date() as unknown as Timestamp, // Temporary
      language: generatedData.language,
      aiGenerated: true,
    };

    return (
      <SetEditorForm
        initialData={initialSetDataForEditor}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmitting}
        isAiMode={true}
        pageTitle="Review & Save AI Generated Cards"
      />
    );
  }

  return null; // Should not happen
}

