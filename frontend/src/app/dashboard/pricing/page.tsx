"use client";

import { useAuth } from "@clerk/nextjs";
import { useApiClient } from "@/lib/api";
import { CheckCircle2, Zap, Trophy, Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    id: "FREE",
    price: "$0",
    description: "Perfect for trying out the platform.",
    features: ["2 Mock Interviews", "Basic Analytics", "Text Mode Only"],
    icon: Zap,
    gradient: "from-gray-500 to-gray-700",
  },
  {
    name: "Pro",
    id: "PRO",
    price: "$9.99",
    period: "/month",
    description: "Everything you need to land the job.",
    features: ["10 Mock Interviews", "Detailed AI Feedback", "Voice Mode", "Priority Support"],
    icon: Trophy,
    gradient: "from-primary to-emerald-700",
    popular: true,
  },
  {
    name: "Pro Max",
    id: "PRO_MAX",
    price: "$19.99",
    period: "/month",
    description: "Unlimited access for serious candidates.",
    features: ["Unlimited Interviews", "Real-time Voice Analysis", "Advanced Stats", "Resume Review"],
    icon: Crown,
    gradient: "from-purple-500 to-pink-600",
  },
];

export default function PricingPage() {
  const { getToken } = useAuth();
  const api = useApiClient(getToken);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tierId: string) => {
    if (tierId === "FREE") return;
    setLoading(tierId);
    try {
      const res = await api.post("/payments/create-checkout-session", { tier: tierId });
      if (res.data.url) {
        window.location.href = res.data.url; // Redirect to Stripe
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to start checkout session. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that best fits your interview preparation needs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-12">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-3xl border ${tier.popular ? 'border-primary/50' : 'border-white/10'} bg-[#111111] p-8 shadow-xl overflow-hidden group hover:border-primary/50 transition-colors`}
          >
            {tier.popular && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-emerald-700" />
            )}
            
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tier.gradient} mb-6`}>
              <tier.icon className="h-6 w-6 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
            <div className="mb-4 flex items-baseline text-white">
              <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
              {tier.period && <span className="text-muted-foreground ml-1">{tier.period}</span>}
            </div>
            <p className="text-sm text-muted-foreground mb-8 min-h-[40px]">
              {tier.description}
            </p>

            <ul className="space-y-4 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className={`w-full h-12 rounded-xl font-bold text-base transition-all ${
                tier.id === "FREE" 
                  ? "bg-white/10 text-white hover:bg-white/20" 
                  : `bg-gradient-to-r ${tier.gradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.02]`
              }`}
              disabled={loading === tier.id || tier.id === "FREE"}
              onClick={() => handleSubscribe(tier.id)}
            >
              {loading === tier.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : tier.id === "FREE" ? (
                "Current Plan"
              ) : (
                "Upgrade Now"
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
