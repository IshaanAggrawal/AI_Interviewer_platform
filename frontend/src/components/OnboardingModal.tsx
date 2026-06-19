"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function OnboardingModal() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const api = useApiClient(getToken);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      if (!isLoaded || !isSignedIn) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get("/auth/me");
        if (res.data?.data) {
          // If name is null or empty, open the onboarding modal
          if (!res.data.data.name || res.data.data.name.trim() === "") {
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [api, isLoaded, isSignedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put("/auth/me", { name: name.trim() });
      toast.success("Profile updated successfully!");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Do not allow closing by clicking outside
  const handleOpenChange = (open: boolean) => {
    if (!open) return; // Prevent closing
    setIsOpen(open);
  };

  if (isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#111111] border-white/10 text-white rounded-3xl sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground pt-2">
            Welcome to AI Interviewer! Please enter your name to personalize your experience.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Full Name</label>
            <Input
              id="name"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl bg-white/5 border-white/10 focus-visible:ring-primary"
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-lg transition-all"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
