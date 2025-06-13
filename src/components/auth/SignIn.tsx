"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
      toast({ title: "Successfully signed in!" });
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      toast({ title: "Sign in failed", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <Button onClick={handleSignIn} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-shadow duration-300">
      <LogIn className="mr-2 h-5 w-5" /> Sign in with Google
    </Button>
  );
}
