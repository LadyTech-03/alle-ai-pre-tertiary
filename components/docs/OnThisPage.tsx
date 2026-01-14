"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import { usePathname } from "next/navigation";

interface Section {
  hash: string;
  title: string;
}

interface OnThisPageProps {
  sections?: Section[];
}

export function OnThisPage({ sections = [] }: OnThisPageProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const currentPathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Scroll to section with pathname and hash
  const scrollToSection = useCallback(
    (hash: string) => {
      const element = document.getElementById(hash);
      if (!element) {
        console.warn(`Element with ID ${hash} not found`);
        return;
      }

      const headerHeight = 100; // Adjust based on your fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveSection(hash);
      window.history.pushState({}, "", `${currentPathname}#${hash}`);
    },
    [currentPathname]
  );

  // Handle initial hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && sections.length > 0) {
      const targetSection = sections.find((section) => section.hash === hash);
      if (targetSection) {
        scrollToSection(hash);
      }
    }
  }, [sections, scrollToSection]);

  // Set up Intersection Observer for sections in #table-of-content
  useEffect(() => {
    if (!sections.length) return;

    const contentContainer = document.getElementById("table-of-content");
    if (!contentContainer) {
      console.warn("Container with ID 'table-of-content' not found");
      return;
    }

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: "-100px 0px -50% 0px", // Bias toward top of viewport
      threshold: 0.1, // Trigger when 10% is visible
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const newActiveTop = entry.target.getBoundingClientRect().top;
          const currentActive = document.getElementById(activeSection);
          const currentActiveTop = currentActive?.getBoundingClientRect().top;

          if (
            !currentActiveTop ||
            newActiveTop < currentActiveTop ||
            newActiveTop < 100 // Prioritize topmost section
          ) {
            setActiveSection(entry.target.id);
          }
        }
      });
    }, options);

    sections.forEach((section) => {
      const element = document.getElementById(section.hash);
      if (element) observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections, activeSection]);

  return (
    <aside className="hidden xl:sticky xl:top-14 xl:block xl:h-[calc(100vh-3.5rem)] xl:overflow-y-auto bg-background/90 p-4 rounded-lg">
      <div className="py-6 pl-4">
        <div className="flex mb-3 gap-2 items-center">
          <List className="h-6 w-5" />
          <h4 className="text-sm font-medium text-foreground/80">
            On this page
          </h4>
        </div>

        <nav className="text-sm">
          {sections.length > 0 ? (
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.hash}>
                  <a
                    href={`${currentPathname}#${section.hash}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(section.hash);
                    }}
                    className={cn(
                      "block w-full text-left py-1.5 px-3 rounded-md transition-all",
                      activeSection === section.hash
                        ? "bg-muted-foreground text-white"
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-foreground/60 italic px-3">
              No sections available
            </p>
          )}
        </nav>
      </div>
    </aside>
  );
}
