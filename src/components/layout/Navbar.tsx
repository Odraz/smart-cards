"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { BrainCircuit, LogOut, Settings, PlusCircle, LayoutDashboard } from "lucide-react";
import ApiKeyModal from "@/components/settings/ApiKeyModal";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "SC";
    const names = name.split(" ");
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <>
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-primary hover:text-primary/80 transition-colors">
                <BrainCircuit className="h-8 w-8 mr-2" />
                <span className="font-headline text-2xl font-semibold">Smart Cards</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="hidden sm:inline-flex">
                      <PlusCircle className="mr-2 h-4 w-4" /> Create New Set
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/set/new">Manually</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/set/new-ai">With AI</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setIsApiKeyModalOpen(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>API Key Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>
      {user && <ApiKeyModal isOpen={isApiKeyModalOpen} setIsOpen={setIsApiKeyModalOpen} userId={user.uid} />}
    </>
  );
}
