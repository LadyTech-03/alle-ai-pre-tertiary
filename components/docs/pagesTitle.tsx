"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function DynamicDocsTitle() {
  const pathname = usePathname();

  useEffect(() => {
    let pageTitle;

    // Conditional title mapping based on pathname
    if (pathname.startsWith("/docs/user-guides")) {
      pageTitle = "User Guides - Alle-AI";
    } else if (pathname === "/docs/getting-started") {
      pageTitle = "Getting Started With Alle-AI";
    } else if (pathname.startsWith("/docs/api-reference")) {
      pageTitle = "API Reference - Alle-AI";
    }
    // Set the document title
    document.title = pageTitle || "Alle-AI";
  }, [pathname]);

  return null; // This component doesn't render anything
}
