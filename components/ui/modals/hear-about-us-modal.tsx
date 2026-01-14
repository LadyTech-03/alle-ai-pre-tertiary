"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, Loader } from "lucide-react";
import Image from "next/image";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type HearSource =
  | "twitter"
  | "youtube"
  | "tiktok"
  | "instagram"
  | "linkedin"
  | "reddit"
  | "friend"
  | "search"
  | "website"
  | "program"
  | "discord"
  | "telegram"
  | "facebook"
  | "x"
  | "other";

type AgeRange = "0-17" | "18-24" | "25-34" | "35-44" | "45-59" | "60+" | "prefer_not_to_say";

const HEAR_SOURCES: { key: HearSource; label: string; svgs?: string[] }[] = [
  { key: "youtube", label: "YouTube", svgs: ["/svgs/youtube.svg"] },
  { key: "search", label: "Google / Search", svgs: ["/svgs/google.svg"] },
  { key: "tiktok", label: "TikTok", svgs: ["/svgs/tiktok.svg"] },
  { key: "linkedin", label: "LinkedIn", svgs: ["/svgs/linkedin.svg"] },
  { key: "reddit", label: "Reddit", svgs: ["/svgs/reddit.svg"] },
  { key: "discord", label: "Discord", svgs: ["/svgs/discord.svg"] },
  { key: "telegram", label: "Telegram", svgs: ["/svgs/telegram.svg"] },
  { key: "facebook", label: "Facebook", svgs: ["/svgs/facebook.svg"] },
  { key: "x", label: "X(Formerly Twitter)", svgs: ["/svgs/x.svg"] },
  { key: "friend", label: "A Friend (referrals)", svgs: ["/svgs/friend.svg"] },
  { key: "program", label: "Event / Program", svgs: ["/svgs/event.svg"] },
  { key: "other", label: "Other" },
];

const AGE_RANGES: { key: AgeRange; label: string }[] = [
  { key: "0-17", label: "Under 18" },
  { key: "18-24", label: "18 – 24" },
  { key: "25-34", label: "25 – 34" },
  { key: "35-44", label: "35 – 44" },
  { key: "45-59", label: "45 – 59" },
  { key: "60+", label: "60+" },
  { key: "prefer_not_to_say", label: "Prefer not to say" },
];

const INTENTS = [
  "Chat & Research",
  "Image Generation",
  "Audio: TTS / STT / Music",
  "Video Generation",
  "Build with APIs",
  "School / Learning",
  "Work / Productivity",
  "Fun / Exploration",
  "Other",
];

export interface HearAboutUsPayload {
  heard_from?: HearSource;
  heard_from_user?: string;
  age_range?: AgeRange;
  intents?: string[];
  remind_later?: boolean;
}

interface HearAboutUsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: HearAboutUsPayload) => Promise<void> | void;
}

export function HearAboutUsModal({ open, onOpenChange, onSubmit }: HearAboutUsModalProps) {
  const [heardFrom, setHeardFrom] = useState<HearSource | undefined>(undefined);
  const [otherText, setOtherText] = useState("");
  const [ageRange, setAgeRange] = useState<AgeRange | undefined>(undefined);
  const [intents, setIntents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [remindLater, setRemindLater] = useState(false);
  // Reset form state when modal opens
  useEffect(() => {
    if (open) {
      setHeardFrom(undefined);
      setOtherText("");
      setAgeRange(undefined);
      setIntents([]);
      setRemindLater(false);
      setStep(1);
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    if (!heardFrom) return false;
    if (!ageRange) return false;
    if (intents.length === 0) return false;
    // if (heardFrom === "other" && !otherText.trim()) return false;
    return true;
  }, [heardFrom, ageRange, intents]);

  const toggleIntent = (intent: string) => {
    setIntents((prev) =>
      prev.includes(intent) ? prev.filter((i) => i !== intent) : [...prev, intent]
    );
  };

  const handleSelectSource = (source: HearSource) => {
    setHeardFrom(source);
    if (source !== "other") {
      setStep(2);
    } else if (otherText.trim()) {
      setStep(2);
    }
  };

  const handleOtherSubmit = () => {
    if (heardFrom === "other" && otherText.trim()) {
      setStep(2);
    }
  };

  const handleAskLater = async () => {
    const payload: HearAboutUsPayload = {
      heard_from: heardFrom,
      heard_from_user: heardFrom === "other" ? otherText.trim() : undefined,
      age_range: ageRange,
      intents,
      remind_later: true,
    };
    
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(payload);
      }
      toast.success("We'll remind you later!", {
        description: "This will help us improve our platform and services for you.",
      });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Could not submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const payload: HearAboutUsPayload = {
      heard_from: heardFrom,
      heard_from_user: heardFrom === "other" ? otherText.trim() : undefined,
      age_range: ageRange,
      intents,
      remind_later: false,
    };
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(payload);
      }
      toast.success("Thanks for the quick info!", {
        description: "This will help us improve our platform and services for you.",
      });
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Could not submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden bg-backgroundSecondary">
        <DialogHeader className="p-5 pb-2">
          <DialogTitle className="text-lg font-semibold">
            {step === 1 ? "Where did you hear about us?" : "Tell us a bit more"}
          </DialogTitle>
          <DialogDescription className="text-sm">Step {step} of 2</DialogDescription>
        </DialogHeader>

        <div className="p-5 pt-2 space-y-6">
          {step === 1 && (
            <section className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HEAR_SOURCES.map((item) => {
                  const active = heardFrom === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleSelectSource(item.key)}
                      className={cn(
                        "group h-20 rounded-xl border p-3 text-sm text-left flex items-center gap-3 transform transition-all duration-200 ease-out",
                        active ? "border-primary bg-primary/10" : "border-borderColorPrimary hover:bg-secondary"
                      )}
                    >
                      <span className={cn("rounded-md p-2 flex items-center gap-1transform transition-transform duration-200 ease-out group-hover:scale-105", active ? "bg-primary/15" : "bg-secondary/60")}>
                        {item.svgs ? (
                          item.svgs.slice(0, 3).map((src, idx) => (
                            <Image key={idx} src={src} alt="icon" width={20} height={20} className="object-contain" />
                          ))
                        ) : (
                          <span className="text-lg leading-none">…</span>
                        )}
                      </span>
                      <span className="leading-tight transform transition-transform duration-200 ease-out group-hover:scale-105">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {heardFrom === "other" && (
                <div className="flex gap-2 items-center">
                  <input
                    placeholder="Please specify"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e as any).key === 'Enter' && otherText.trim()) handleOtherSubmit();
                    }}
                    className="h-10 flex-1 rounded-xl border border-borderColorPrimary bg-background px-3 text-sm focus-visible:outline-none"
                  />
                  <Button onClick={handleOtherSubmit} disabled={!otherText.trim()}>Submit</Button>
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <>
              <section className="space-y-3">
                <div className="text-lg font-semibold">Age Range</div>
                <Select value={ageRange || ""} onValueChange={(v) => setAgeRange(v as AgeRange)}>
                  <SelectTrigger className="h-10 w-full rounded-xl border border-borderColorPrimary bg-background text-sm focus-visible:outline-none">
                    <SelectValue placeholder="Select your age range" />
                  </SelectTrigger>
                  <SelectContent className="bg-backgroundSecondary">
                    {AGE_RANGES.map((item) => (
                      <SelectItem key={item.key} value={item.key} className="text-sm">
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>

              <section className="space-y-3">
                <div className="text-lg font-semibold">What do you intend to do with Alle-AI?</div>
                <div className="flex flex-wrap gap-2">
                  {INTENTS.map((intent) => {
                    const active = intents.includes(intent);
                    return (
                      <button
                        key={intent}
                        type="button"
                        onClick={() => toggleIntent(intent)}
                        className={cn(
                          "h-9 rounded-full border px-3 text-xs transition-colors",
                          active ? "border-primary bg-primary/10" : "border-borderColorPrimary hover:bg-secondary",
                          !active && "hover:border-primary/50 hover:bg-primary/5"
                        )}
                      >
                        {intent}
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {step === 2 && (
                <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              )}
              <Button 
                variant="link" 
                onClick={handleAskLater} 
                className="text-muted-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : "Ask me later"}
              </Button>
            </div>
            <div>
              {step === 2 && (
                <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : "Done"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default HearAboutUsModal;


