"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function DeveloperPageTitle() {
  const pathname = usePathname();

  useEffect(() => {
    let pageTitle; // 

    // Conditional title mapping based on pathname
    if (pathname.startsWith("/developer/settings")) {
      pageTitle = "API Settings & Billing | Alle-AI";
    } else {
      const titleMap: { [key: string]: string } = {
        "/developer/workbench/chat-api": "Chat API Workbench - Alle-AI",
        "/developer/workbench/image-api": "Image API Workbench - Alle-AI",
        "/developer/workbench/audio-api": "Audio API Workbench - Alle-AI",
        "/developer/workbench/video-api": "Video API Workbench - Alle-AI",
        "/developer": "API Dashboard - Alle-AI",
      };
      pageTitle = titleMap[pathname] || "Alle-AI";
    }

    // Set the document title
    document.title = pageTitle;
  }, [pathname]);

  return null;
}
