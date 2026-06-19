"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { getToken } = useAuth();
  const api = useApiClient(getToken);
  
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    const verifySession = async () => {
      try {
        const res = await api.post("/payments/verify-session", { session_id: sessionId });
        if (res.data.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
      }
    };

    verifySession();
  }, [sessionId, api]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      {status === "verifying" && (
        <>
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Verifying your payment...</h1>
          <p className="text-muted-foreground">Please wait a moment while we upgrade your account.</p>
        </>
      )}

      {status === "success" && (
        <div className="animate-in zoom-in duration-500 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">Payment Successful! 🎉</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            Your account has been successfully upgraded. You now have access to your new premium features!
          </p>
          <Button 
            className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg hover:scale-105 transition-transform"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="animate-in zoom-in duration-500 flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
            <div className="h-10 w-10 text-red-500 flex items-center justify-center font-bold text-2xl">!</div>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4">Verification Failed</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            We couldn't verify your payment. If you believe this is a mistake, please contact support.
          </p>
          <Button 
            variant="outline"
            className="h-12 px-8 rounded-xl border-white/10 text-white"
            onClick={() => router.push("/dashboard/pricing")}
          >
            Return to Pricing
          </Button>
        </div>
      )}
    </div>
  );
}
