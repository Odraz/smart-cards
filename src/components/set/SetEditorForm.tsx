
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, PlusCircle, Save, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Card, CardSet } from "@/types";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

const cardSchema = z.object({
  id: z.string().optional(), // Keep existing ID if editing
  question: z.string().min(1, "Question cannot be empty.").max(500, "Question too long."),
  answer: z.string().min(1, "Answer cannot be empty.").max(1000, "Answer too long."),
});

const setSchema = z.object({
  name: z.string().min(1, "Set name cannot be empty.").max(100, "Set name too long."),
  cards: z.array(cardSchema).min(1, "Set must have at least one card."),
  language: z.string().optional(),
  aiGenerated: z.boolean().optional(),
});

type SetFormValues = z.infer<typeof setSchema>;

interface SetEditorFormProps {
  initialData?: CardSet | null;
  onSubmit: (data: SetFormValues) => Promise<void>;
  isSubmitting: boolean;
  isAiMode?: boolean; // To adjust UI elements slightly for AI review
  pageTitle: string;
}

export default function SetEditorForm({ initialData, onSubmit, isSubmitting, isAiMode = false, pageTitle }: SetEditorFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const { control, handleSubmit, register, formState: { errors }, reset, watch } = useForm<SetFormValues>({
    resolver: zodResolver(setSchema),
    defaultValues: {
      name: initialData?.name || "",
      cards: initialData?.cards.map(c => ({ ...c, id: c.id || String(Math.random()) })) || [{ question: "", answer: "", id: String(Math.random()) }],
      language: initialData?.language,
      aiGenerated: initialData?.aiGenerated ?? isAiMode,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "cards",
    keyName: "fieldId" // Use a different key name than "id" to avoid conflict with Card.id
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        cards: initialData.cards.map(c => ({ ...c, id: c.id || String(Math.random()) })),
        language: initialData.language,
        aiGenerated: initialData.aiGenerated ?? isAiMode,
      });
    }
  }, [initialData, reset, isAiMode]);

  const processSubmit = async (data: SetFormValues) => {
    setLocalSubmitting(true);
    try {
      // Ensure cards have unique IDs if new, or retain existing for edits
      const processedData = {
        ...data,
        cards: data.cards.map(card => ({
          ...card,
          id: card.id || crypto.randomUUID(), // Generate UUID if new card
        }))
      };
      await onSubmit(processedData); // This calls the handleSubmit from the parent page
    } catch (error) {
      // Errors are expected to be handled by the onSubmit prop (parent component's handleSubmit)
      // which should display a toast. Logging here for additional diagnostics if needed.
      console.error("Error propagated to SetEditorForm's processSubmit:", error);
    } finally {
      setLocalSubmitting(false); // Ensure localSubmitting is always reset
    }
  };

  const handleAddCard = () => {
    append({ question: "", answer: "", id: String(Math.random()) });
  };

  const currentCards = watch("cards");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Button variant="outline" size="icon" onClick={() => router.back()} disabled={isSubmitting || localSubmitting}>
             <ArrowLeft className="h-4 w-4" />
           </Button>
          <h1 className="text-3xl font-headline font-semibold">{pageTitle}</h1>
        </div>
        <Button onClick={handleSubmit(processSubmit)} disabled={isSubmitting || localSubmitting} className="shadow-md hover:shadow-lg">
          {(isSubmitting || localSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" /> Save Set
        </Button>
      </div>

      <form onSubmit={handleSubmit(processSubmit)} className="space-y-8">
        <UICard className="shadow-lg">
          <CardHeader>
            <CardTitle>Set Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-lg">Set Name</Label>
              <Input id="name" {...register("name")} placeholder="e.g., Chapter 1: History Basics" className="mt-1 text-base" />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            {isAiMode && initialData?.language && (
              <p className="text-sm text-muted-foreground">Language: {initialData.language}</p>
            )}
          </CardContent>
        </UICard>

        <UICard className="shadow-lg">
          <CardHeader>
            <CardTitle>Cards ({fields.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {errors.cards && !errors.cards.root && !Array.isArray(errors.cards) && (
              <p className="text-sm text-destructive mb-4">{errors.cards.message}</p>
            )}
            {fields.length === 0 && (
                 <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-2">No cards yet. Add your first card!</p>
                 </div>
            )}
            <ScrollArea className={fields.length > 2 ? "h-[500px]" : ""}>
              <div className="space-y-6 pr-4">
                {fields.map((field, index) => (
                  <UICard key={field.fieldId} className="p-4 bg-background/50 shadow-md relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`cards.${index}.question`} className="font-medium">Question {index + 1}</Label>
                        <Controller
                          name={`cards.${index}.question`}
                          control={control}
                          render={({ field: controllerField }) => (
                            <Textarea
                              {...controllerField}
                              id={`cards.${index}.question`}
                              placeholder="Enter question"
                              className="mt-1 min-h-[100px] text-base"
                              rows={3}
                            />
                          )}
                        />
                        {errors.cards?.[index]?.question && (
                          <p className="text-sm text-destructive mt-1">{errors.cards[index]?.question?.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`cards.${index}.answer`} className="font-medium">Answer {index + 1}</Label>
                         <Controller
                          name={`cards.${index}.answer`}
                          control={control}
                          render={({ field: controllerField }) => (
                            <Textarea
                              {...controllerField}
                              id={`cards.${index}.answer`}
                              placeholder="Enter answer"
                              className="mt-1 min-h-[100px] text-base"
                              rows={3}
                            />
                          )}
                        />
                        {errors.cards?.[index]?.answer && (
                          <p className="text-sm text-destructive mt-1">{errors.cards[index]?.answer?.message}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 h-7 w-7"
                      disabled={isSubmitting || localSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </UICard>
                ))}
              </div>
            </ScrollArea>
             <div className="mt-6 flex justify-center">
              <Button type="button" variant="outline" onClick={handleAddCard} disabled={isSubmitting || localSubmitting} className="shadow">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Card
              </Button>
            </div>
          </CardContent>
        </UICard>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting || localSubmitting} size="lg" className="shadow-md hover:shadow-lg">
            {(isSubmitting || localSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" /> Save Set
          </Button>
        </div>
      </form>
    </div>
  );
}
