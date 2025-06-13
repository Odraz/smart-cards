"use client";

import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } PAGENAV useRouter_PAGENAV "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!user) {
    // Should be redirected by useEffect, but as a fallback:
    return <LoadingSpinner fullPage text="Redirecting to login..." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        Smart Cards &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
