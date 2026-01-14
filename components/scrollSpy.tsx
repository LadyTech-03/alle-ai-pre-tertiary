// hooks/useScrollSpy.js
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { throttle } from "lodash";

const useScrollSpy = ({
  threshold = 10,
  throttleMs = 100,
  sectionSelector = "h2[id]",
} = {}) => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("");

  const updateActiveSection = useCallback(
    (newSection: string) => {
      if (newSection !== activeSection) {
        setActiveSection(newSection);
        if (newSection) {
          router.replace(`/docs/api-reference/${newSection}`);
        } else {
          router.replace("/docs/api-reference/introduction");
        }
      }
    },
    [activeSection, router]
  );

  const handleScroll = useCallback(
    throttle(() => {
      if (typeof window === "undefined") return;

      const sections = Array.from(document.querySelectorAll(sectionSelector));
      let newActiveSection = "";

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom > threshold) {
          newActiveSection = section.id;
          break;
        }
      }

      updateActiveSection(newActiveSection);
    }, throttleMs),
    [updateActiveSection, sectionSelector, threshold, throttleMs]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return activeSection;
};

export default useScrollSpy;
