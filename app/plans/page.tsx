"use client";

import PlansArea from "@/components/features/plans/PlansArea";
import { HelpButton } from "@/components/HelpButton";
import { Header } from "@/components/layout/Header";
import { RequirePlanGuard } from "@/components/features/auth/RequirePlanGuard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function PlansPage() {

  return (
    <div className="h-screen flex overflow-hidden">
      <main className="flex-1 flex flex-col h-full relative">
        <RequirePlanGuard>
          <Header />
          <ScrollArea className="h-full w-full">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <PlansArea />
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
          <HelpButton />
        </RequirePlanGuard>
      </main>
    </div>
  );
}
