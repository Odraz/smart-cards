
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { saveUserApiKey, getUserApiKey } from "@/lib/firebase/firestore";
import { Loader2, KeyRound } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userId: string;
}

export default function ApiKeyModal({ isOpen, setIsOpen, userId }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingKey, setIsFetchingKey] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      setIsFetchingKey(true);
      getUserApiKey(userId)
        .then((key) => {
          if (key) setApiKey(key);
        })
        .catch(error => {
          console.error("Error fetching API key:", error);
          toast({ title: "Error", description: "Could not fetch existing API key.", variant: "destructive" });
        })
        .finally(() => setIsFetchingKey(false));
    }
  }, [isOpen, userId, toast]);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      toast({ title: "API Key Required", description: "Please enter your Gemini API key.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await saveUserApiKey(userId, apiKey.trim());
      toast({ title: "Success", description: "API Key saved successfully." });
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({ title: "Error", description: "Could not save API key. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <KeyRound className="mr-2 h-5 w-5 text-primary" />
            Gemini API Key
          </DialogTitle>
          <DialogDescription>
            Enter your Gemini API key to enable AI-powered card generation. Your key is stored securely.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            {isFetchingKey ? (
              <div className="col-span-3 flex items-center justify-center h-10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="col-span-3"
                placeholder="Enter your Gemini API key"
                autoComplete="new-password"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading || isFetchingKey}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
