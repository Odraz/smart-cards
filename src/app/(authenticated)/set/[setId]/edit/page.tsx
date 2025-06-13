
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SetEditorForm from "@/components/set/SetEditorForm";
import { useAuth } from "@/hooks/useAuth";
import { getCardSet, updateCardSet } from "@/lib/firebase/firestore";
import type { CardSet, Card } from "@/types";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Timestamp } from "firebase/firestore";

interface SetFormData {
  name: string;
  cards: Card[]; // Cards should have IDs when editing
  language?: string;
  aiGenerated?: boolean;
}

export default function EditSetPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const setId = params.setId as string;
  const { toast } = useToast();

  const [initialData, setInitialData] = useState<CardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && setId) {
      setIsLoading(true);
      getCardSet(setId, user.uid)
        .then(set => {
          if (set) {
            setInitialData(set);
          } else {
            toast({ title: "Error", description: "Card set not found or you don't have permission.", variant: "destructive" });
            router.push("/dashboard");
          }
        })
        .catch(error => {
          console.error("Error fetching card set:", error);
          toast({ title: "Error", description: "Could not fetch card set data.", variant: "destructive" });
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, setId, router, toast]);

  const handleSubmit = async (data: SetFormData) => {
    if (!user || !initialData) {
      toast({ title: "Error", description: "User or set data is missing.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const cardsWithEnsuredIds: Card[] = data.cards.map(card => ({
        ...card,
        id: card.id || crypto.randomUUID(), // Ensure ID for new cards added during edit
      }));

      const updatePayload: Partial<Omit<CardSet, "id" | "userId" | "createdAt">> = {
        name: data.name,
        cards: cardsWithEnsuredIds,
        aiGenerated: data.aiGenerated,
      };

      if (data.language !== undefined) {
        updatePayload.language = data.language;
      }
      // If data.language is undefined, it won't be included in updatePayload,
      // so it won't be sent to Firestore, avoiding the error.
      // If you needed to explicitly remove the field from Firestore, you would use:
      // else { updatePayload.language = deleteField() as unknown as string; }
      // But for this case, not sending it is sufficient.

      await updateCardSet(initialData.id, user.uid, updatePayload);
      toast({ title: "Success", description: "Card set updated successfully!" });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating card set:", error);
      toast({ title: "Error", description: "Could not update card set. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading set editor..." />;
  }

  if (!initialData) {
    // Error handled by toast and redirect in useEffect
    return null; 
  }

  return (
    <SetEditorForm
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      pageTitle="Edit Card Set"
      isAiMode={initialData.aiGenerated}
    />
  );
}

