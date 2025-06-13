"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PracticeSession from "@/components/practice/PracticeSession";
import { useAuth } from "@/hooks/useAuth";
import { getCardSet } from "@/lib/firebase/firestore";
import type { CardSet } from "@/types";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export default function PracticePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const setId = params.setId as string;
  const { toast } = useToast();

  const [cardSet, setCardSet] = useState<CardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && setId) {
      setIsLoading(true);
      getCardSet(setId, user.uid)
        .then(set => {
          if (set) {
            setCardSet(set);
          } else {
            toast({ title: "Error", description: "Card set not found or you don't have permission.", variant: "destructive" });
            router.push("/dashboard");
          }
        })
        .catch(error => {
          console.error("Error fetching card set for practice:", error);
          toast({ title: "Error", description: "Could not fetch card set data.", variant: "destructive" });
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, setId, router, toast]);

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading practice session..." />;
  }

  if (!cardSet) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">Card set not found.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
          </Link>
        </Button>
      </div>
    );
  }
  
  if (cardSet.cards.length === 0) {
     return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-headline font-semibold mb-2">{cardSet.name}</h1>
        <p className="text-xl text-muted-foreground mb-6">This set has no cards to practice.</p>
        <div className="space-x-4">
            <Button asChild variant="outline">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
            </Link>
            </Button>
            <Button asChild>
            <Link href={`/set/${cardSet.id}/edit`}>
                <BookOpen className="mr-2 h-4 w-4" /> Edit Set
            </Link>
            </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
             <ArrowLeft className="h-4 w-4" />
           </Button>
          <h1 className="text-3xl font-headline font-semibold truncate" title={cardSet.name}>Practice: {cardSet.name}</h1>
      </div>
      <PracticeSession cardSet={cardSet} />
    </div>
  );
}
