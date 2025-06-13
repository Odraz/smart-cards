"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card as UICard, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Wand2, Loader2, AlertTriangle, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateCardsFromText, GenerateCardsFromTextInput, GenerateCardsFromTextOutput } from "@/ai/flows/generate-cards-from-text";
import { getUserApiKey, MAX_CARDS_PER_SET_AI, MAX_TEXT_LENGTH_AI, AVAILABLE_LANGUAGES_AI } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import ApiKeyModal from "@/components/settings/ApiKeyModal";
import type { Card } from "@/types";


const aiSetGenerationSchema = z.object({
  text: z.string().min(1, "Text for analysis cannot be empty.").max(MAX_TEXT_LENGTH_AI, `Text cannot exceed ${MAX_TEXT_LENGTH_AI} characters.`),
  setName: z.string().min(1, "Set name cannot be empty.").max(100, "Set name too long."),
  numberOfCards: z.number().min(1).max(MAX_CARDS_PER_SET_AI, `Number of cards must be between 1 and ${MAX_CARDS_PER_SET_AI}.`),
  language: z.string().min(1, "Please select a language."),
});

type AISetGenerationFormValues = z.infer<typeof aiSetGenerationSchema>;

interface AISetGenerationFormProps {
  onCardsGenerated: (setName: string, cards: Card[], language: string) => void;
}

export default function AISetGenerationForm({ onCardsGenerated }: AISetGenerationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(true);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const { control, handleSubmit, register, formState: { errors }, watch } = useForm<AISetGenerationFormValues>({
    resolver: zodResolver(aiSetGenerationSchema),
    defaultValues: {
      text: "",
      setName: "",
      numberOfCards: 5,
      language: AVAILABLE_LANGUAGES_AI[0]?.value || "English",
    },
  });

  const textValue = watch("text");

  useEffect(() => {
    if (user) {
      setIsApiKeyLoading(true);
      getUserApiKey(user.uid)
        .then(key => {
          setApiKey(key);
          if (!key) {
             // toast({ title: "API Key Needed", description: "Please set your Gemini API key in settings to use AI generation.", variant: "default", duration: 5000 });
          }
        })
        .catch(error => console.error("Error fetching API key:", error))
        .finally(() => setIsApiKeyLoading(false));
    }
  }, [user, toast, isApiKeyModalOpen]); // Re-check API key if modal was opened and closed

  const onSubmit = async (data: AISetGenerationFormValues) => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (!apiKey) {
      toast({ title: "API Key Missing", description: "Please set your Gemini API key to generate cards with AI.", variant: "destructive" });
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      const input: GenerateCardsFromTextInput = {
        text: data.text,
        numberOfCards: data.numberOfCards,
        language: data.language,
        apiKey: apiKey, 
      };
      const result: GenerateCardsFromTextOutput = await generateCardsFromText(input);
      if (result.cards && result.cards.length > 0) {
        const formattedCards: Card[] = result.cards.map((card, index) => ({
          id: crypto.randomUUID(), // Or generate on save
          question: card.question,
          answer: card.answer,
        }));
        onCardsGenerated(data.setName, formattedCards, data.language);
        toast({ title: "Success", description: `${result.cards.length} cards generated! Review and save.` });
      } else {
        toast({ title: "No Cards Generated", description: "AI could not generate cards from the provided text. Try refining your text or prompt.", variant: "default" });
      }
    } catch (error: any) {
      console.error("Error generating cards with AI:", error);
      toast({ title: "AI Generation Failed", description: error.message || "An unexpected error occurred. Check your API key and input.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isApiKeyLoading && user) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Loading API key status...</p></div>;
  }
  
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {!apiKey && !isApiKeyLoading && user && (
          <UICard className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="mr-2 h-5 w-5" /> Gemini API Key Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive-foreground mb-4">
                To use AI-powered card generation, you need to provide your Gemini API key.
              </p>
              <Button type="button" variant="secondary" onClick={() => setIsApiKeyModalOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" /> Set API Key
              </Button>
            </CardContent>
          </UICard>
        )}

        <UICard className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Brain className="mr-2 h-6 w-6 text-primary"/> AI Card Generation</CardTitle>
            <CardDescription>Paste your text, and let AI create learning cards for you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="text" className="text-lg">Paste Text for Analysis</Label>
              <Textarea
                id="text"
                {...register("text")}
                placeholder="Paste your learning material here (max 15,000 characters)..."
                className="mt-1 min-h-[200px] text-base"
                rows={10}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
                <p className={`text-sm ${textValue.length > MAX_TEXT_LENGTH_AI ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {textValue.length} / {MAX_TEXT_LENGTH_AI}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="setName" className="text-lg">Set Name</Label>
                <Input id="setName" {...register("setName")} placeholder="e.g., AI Generated History Notes" className="mt-1 text-base" />
                {errors.setName && <p className="text-sm text-destructive mt-1">{errors.setName.message}</p>}
              </div>
              <div>
                <Label htmlFor="numberOfCards" className="text-lg">Number of Cards (1-{MAX_CARDS_PER_SET_AI})</Label>
                <Input
                  id="numberOfCards"
                  type="number"
                  {...register("numberOfCards", { valueAsNumber: true })}
                  className="mt-1 text-base"
                  min="1"
                  max={MAX_CARDS_PER_SET_AI}
                />
                {errors.numberOfCards && <p className="text-sm text-destructive mt-1">{errors.numberOfCards.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="language" className="text-lg">Language of Cards</Label>
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full mt-1 text-base">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_LANGUAGES_AI.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.language && <p className="text-sm text-destructive mt-1">{errors.language.message}</p>}
            </div>
          </CardContent>
        </UICard>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isGenerating || !apiKey || isApiKeyLoading} size="lg" className="shadow-md hover:shadow-lg">
            {isGenerating && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            <Wand2 className="mr-2 h-5 w-5" /> Generate Cards
          </Button>
        </div>
      </form>
      {user && <ApiKeyModal isOpen={isApiKeyModalOpen} setIsOpen={setIsApiKeyModalOpen} userId={user.uid} />}
    </>
  );
}
