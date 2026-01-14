"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import ApiIntroduction from "@/components/docs/api-reference/introduction";
import ApiAudioGenerationDocs from "@/components/docs/api-reference/audioGenerations";
import ApiImageGenerationDocs from "@/components/docs/api-reference/imageGenerations";
import ApiVideoGenerationDocs from "@/components/docs/api-reference/videoGenerations";
import ApiTextGenerationDocs from "@/components/docs/api-reference/chat";
type SectionName =
  | "introduction"
  | "text-generation"
  | "image-generation"
  | "audio-generation"
  | "video-generation";

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isManualNavigation = useRef(false);
  const currentSection = useRef<string | null>(null);
  const lastScrollPosition = useRef(0);
  const scrollDirection = useRef<"down" | "up">("down");
  const sectionPositions = useRef<Record<string, number>>({});

  // Track scroll direction and section positions
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateSectionPositions = () => {
      document.querySelectorAll("[data-section]").forEach((section) => {
        const rect = section.getBoundingClientRect();
        const sectionName = section.getAttribute("data-section")!;
        sectionPositions.current[sectionName] = rect.top + window.scrollY;
      });
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      lastScrollPosition.current = scrollY;

      if (scrollY > lastScrollY + 5) {
        scrollDirection.current = "down";
      } else if (scrollY < lastScrollY - 5) {
        scrollDirection.current = "up";
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateSectionPositions();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial position measurement
    updateSectionPositions();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle initial load
  useEffect(() => {
    if (!pathname) return;

    const section =
      pathname.replace("/docs/api-reference/", "") || "introduction";
    const element = document.querySelector(`[data-section="${section}"]`);
    if (element && section !== currentSection.current) {
      currentSection.current = section;
      element.scrollIntoView({ behavior: "instant" });
    }
  }, [pathname]);

  // Handle manual navigation
  useEffect(() => {
    if (!pathname) return;

    const section = pathname.replace("/docs/api-reference/", "");
    if (section) {
      isManualNavigation.current = true;
      const element = document.querySelector(`[data-section="${section}"]`);
      if (element) {
        currentSection.current = section;
        window.history.replaceState(null, "", `/docs/api-reference/${section}`);
      }

      const timer = setTimeout(() => {
        isManualNavigation.current = false;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Improved Intersection Observer with scroll direction handling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualNavigation.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute("data-section");
            const ratio = entry.intersectionRatio;

            // More sensitive when scrolling up
            const shouldUpdate =
              scrollDirection.current === "up"
                ? ratio >= 0.3 // Lower threshold when scrolling up
                : ratio >= 0.7; // Higher threshold when scrolling down

            if (section && shouldUpdate && section !== currentSection.current) {
              currentSection.current = section;
              window.history.replaceState(
                null,
                "",
                `/docs/api-reference/${section}`
              );
            }
          }
        });
      },
      {
        threshold: [0.3, 0.5, 0.7, 0.9],
        rootMargin:
          scrollDirection.current === "down"
            ? "-100px 0px"
            : "0px 0px -60% 0px", // More area when scrolling up
      }
    );

    document.querySelectorAll("[data-section]").forEach((section) => {
      observer.observe(section);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, []);

  // Additional scroll-based section detection for more responsiveness
  useEffect(() => {
    const handleScroll = () => {
      if (isManualNavigation.current) return;

      const scrollY = window.scrollY;
      const sections = Object.entries(sectionPositions.current).sort(
        (a, b) => a[1] - b[1]
      );

      // Find which section we're in based on scroll position
      let activeSection = sections[0][0];
      for (let i = 0; i < sections.length; i++) {
        if (scrollY >= sections[i][1] - 100) {
          activeSection = sections[i][0];
        } else {
          break;
        }
      }

      if (activeSection && activeSection !== currentSection.current) {
        currentSection.current = activeSection;
        window.history.replaceState(
          null,
          "",
          `/docs/api-reference/${activeSection}`
        );
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="space-y-32 ml-10">
      <section data-section="introduction" className="min-h-[80vh]">
        <ApiIntroduction />
      </section>
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />
      <section data-section="text-generation" className="min-h-[80vh]">
        <ApiTextGenerationDocs />
      </section>
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />
      <section data-section="image-generation" className="min-h-[80vh]">
        <ApiImageGenerationDocs />
      </section>
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />
      <section data-section="audio-generation" className="min-h-[80vh]">
        <ApiAudioGenerationDocs />
      </section>
      <hr className="border-t-1 dark:border-zinc-700 border-gray-200 my-10 mt-5" />
      <section data-section="video-generation" className="min-h-[80vh]">
        <ApiVideoGenerationDocs />
      </section>
      {/* <section data-section="rate-limits">
        <ApiUsageDocs />
      </section> */}
    </div>
  );
}
