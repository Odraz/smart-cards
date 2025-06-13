"use client";

import SetEditorForm from "@/components/set/SetEditorForm";
import { useAuth } from "@/hooks/useAuth";
import { addCardSet } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Card, CardSet } from "@/types"; // Ensure Card is imported
import type { Timestamp } from "firebase/firestore";

interface SetFormData {
  name: string;
  cards: Array<Omit<Card, "id"> & { id?: string }>; // Card ID is optional on creation
  language?: string;
  aiGenerated?: boolean;
}


export default function NewSetPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SetFormData) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to create a set.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Ensure cards have a generated ID before saving if they don't have one
      const cardsWithIds: Card[] = data.cards.map(card => ({
        ...card,
        id: card.id || crypto.randomUUID(), 
      }));

      const newSetData: Omit<CardSet, "id" | "userId" | "createdAt" | "updatedAt"> = {
        name: data.name,
        cards: cardsWithIds,
        language: data.language,
        aiGenerated: data.aiGenerated ?? false,
      };
      
      const newSetId = await addCardSet(user.uid, newSetData);
      toast({ title: "Success", description: "New card set created successfully!" });
      router.push(`/set/${newSetId}/edit`); // Or /dashboard
    } catch (error) {
      console.error("Error creating card set:", error);
      toast({ title: "Error", description: "Could not create card set. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SetEditorForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      pageTitle="Create New Card Set"
    />
  );
}
