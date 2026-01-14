"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress";
import RenderPageContent from "@/components/RenderPageContent";

export default function ComingSoon() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;
      setProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        router.push('/project');
      }
    }, interval);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <RenderPageContent>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">Coming Soon!</h1>
        <p className="text-muted-foreground text-lg mb-8">
          This feature is not available for your school yet. Redirecting you to Subjects
        </p>
        <div className="w-full max-w-md">
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </RenderPageContent>
  );
}