"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, BookOpen, Brain, MessageSquareWarning, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getUserCardSets, deleteCardSet } from "@/lib/firebase/firestore";
import type { CardSet } from "@/types";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useAuth();
  const [cardSets, setCardSets] = useState<CardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserCardSets(user.uid)
        .then(sets => {
          setCardSets(sets);
        })
        .catch(error => {
          console.error("Error fetching card sets:", error);
          toast({ title: "Error", description: "Could not fetch card sets.", variant: "destructive" });
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, toast]);

  const handleDeleteSet = async (setId: string) => {
    if (!user) return;
    try {
      await deleteCardSet(setId, user.uid);
      setCardSets(prevSets => prevSets.filter(set => set.id !== setId));
      toast({ title: "Success", description: "Card set deleted successfully." });
    } catch (error) {
      console.error("Error deleting card set:", error);
      toast({ title: "Error", description: "Could not delete card set.", variant: "destructive" });
    }
  };

  const filteredCardSets = cardSets.filter(set =>
    set.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-headline font-semibold text-foreground">My Card Sets</h1>
        <div className="flex gap-2">
           <Button asChild className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <Link href="/set/new">
              <PlusCircle className="mr-2 h-5 w-5" /> Create Manually
            </Link>
          </Button>
          <Button asChild variant="outline" className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <Link href="/set/new-ai">
              <Brain className="mr-2 h-5 w-5" /> Create with AI
            </Link>
          </Button>
        </div>
      </div>

      {cardSets.length > 0 && (
         <div className="relative">
          <Input
            type="text"
            placeholder="Search sets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-1/3"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {filteredCardSets.length === 0 && !isLoading ? (
        <Card className="text-center py-12 bg-card/80">
          <CardHeader>
            <div className="mx-auto bg-muted text-muted-foreground rounded-full p-4 w-fit mb-4">
              <MessageSquareWarning size={48} />
            </div>
            <CardTitle className="text-2xl font-semibold">No Card Sets Found</CardTitle>
            <CardDescription className="text-lg">
              {cardSets.length > 0 ? "No sets match your search." : "You haven't created any card sets yet. Get started by creating a new one!"}
            </CardDescription>
          </CardHeader>
          {cardSets.length === 0 && (
            <CardContent>
               <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link href="/set/new">
                    <PlusCircle className="mr-2 h-5 w-5" /> Create Manually
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/set/new-ai">
                    <Brain className="mr-2 h-5 w-5" /> Create with AI
                  </Link>
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCardSets.map(set => (
            <Card key={set.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="truncate font-headline">{set.name}</CardTitle>
                <CardDescription>
                  {set.cards.length} card{set.cards.length !== 1 ? 's' : ''}
                  {set.aiGenerated && <span className="ml-2 inline-flex items-center rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground"><Brain size={12} className="mr-1"/>AI</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Placeholder for a small visual or snippet */}
                <Image src={`https://placehold.co/600x400.png?text=${encodeURIComponent(set.name)}`} alt={set.name} width={600} height={400} className="rounded-md aspect-video object-cover" data-ai-hint="study education" />
              </CardContent>
              <CardFooter className="grid grid-cols-3 gap-2">
                <Button asChild variant="default" className="w-full">
                  <Link href={`/set/${set.id}/practice`}>
                    <BookOpen className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Practice</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/set/${set.id}/edit`}>
                    <Edit3 className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Edit</span>
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the card set "{set.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteSet(set.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ShadCN input needs to be imported if not already globally available.
// Assuming it's available through '@/components/ui/input'
import { Input } from "@/components/ui/input";
