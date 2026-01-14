"use client";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
interface containerProps {
  previousTitle: string;
  nextTitle: string;
  previousDescription?: string;
  nextDesciption?: string;
  preUrl: string;
  nextUrl: string;
}
export default function NavigationContainer(props: containerProps) {
  const router = useRouter();
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[700px]">
        <div className="mt-16 mb-8 flex justify-center items-center gap-4">
          <button
            onClick={() => {
              router.back();
            }}
            className="group flex items-center min-w-[240px] space-x-2 p-2 text-sm transition-colors hover:bg-accent rounded-lg border"
          >
            <ChevronLeft className="h-5 w-5 mt-0.5" />
            <div className="flex flex-col items-start">
              <span className="text-sm text-muted-foreground mb-1">
                Previous
              </span>
              <span className="font-medium group-hover:text-foreground">
                {props.previousTitle}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {props.previousDescription}
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              router.push(props.nextUrl);
            }}
            className="group flex justify-end items-center min-w-[240px] space-x-2 p-2 text-sm transition-colors hover:bg-accent rounded-lg border text-right"
          >
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground mb-1">Next</span>
              <span className="font-medium group-hover:text-foreground">
                {props.nextTitle}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                {props.nextDesciption}
              </span>
            </div>
            <ChevronRight className="h-5 w-5 mt-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
