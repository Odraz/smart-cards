"use client";

import SignIn from "@/components/auth/SignIn";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (user) {
    // Already authenticated, redirecting or showing loader
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <BrainCircuit size={48} />
          </div>
          <CardTitle className="text-4xl font-headline text-primary">Smart Cards</CardTitle>
          <CardDescription className="text-lg text-foreground/80 pt-2">
            Your intelligent learning companion.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 pt-6 pb-8">
          <p className="text-center text-foreground/70">
            Create, manage, and practice your learning cards with ease. Powered by AI for smarter studying.
          </p>
          <SignIn />
        </CardContent>
      </Card>
      <footer className="mt-12 text-center text-foreground/60 text-sm">
        <p>&copy; {new Date().getFullYear()} Smart Cards. All rights reserved.</p>
        <p>Built with Next.js and Firebase.</p>
      </footer>
    </div>
  );
}
