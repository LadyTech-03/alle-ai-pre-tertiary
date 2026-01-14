"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

// Added a geometric infographic representation of a "broken system"
export default function Error({
  error,
reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

    const router = useRouter() 
  useEffect(() => {
    console.error("[v0] Client-side exception:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 selection:bg-backgroundSecondary selection:text-muted-foreground font-mono uppercase tracking-tight">
      {/* Background Grid - Infographic feel */}
      <div
        className="
            absolute inset-0 z-0 pointer-events-none
            opacity-[0.03]
            [--grid-color:0_0_0]
            dark:[--grid-color:255_255_255]
        "
        style={{
            backgroundImage: `
            linear-gradient(rgb(var(--grid-color)) 1px, transparent 1px),
            linear-gradient(90deg, rgb(var(--grid-color)) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
        }}
        />

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center gap-12">

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tighter leading-none">
            Well... that wasn&apos;t <br />
            <span className="opacity-50">supposed to happen.</span>
          </h1>
          <p className="text-sm opacity-40 max-w-xs mx-auto leading-relaxed tracking-widest uppercase">
            An unexpected error occurred. We&apos;re working to fix it.
          </p>
        </div>

        {/* Action Interface */}
        <div className="flex flex-col items-center gap-8 w-full max-w-xs pt-4">
          <button
            onClick={() => {
                window.location.href = '/';
            }}
            className="w-full py-4 border border-borderColorPrimary hover:bg-hoverColorPrimary text-foreground transition-all duration-300 flex items-center justify-center gap-3 text-sm group relative overflow-hidden"
            >
            <ArrowLeft className="w-4 h-4 transition-transform duration-500" />
            Go back
            </button>
        </div>
      </div>
    </div>
  )
}
