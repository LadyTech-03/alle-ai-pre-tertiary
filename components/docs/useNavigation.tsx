"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiReference, mainUserGuides } from "@/lib/constants/docs";

export const useNavigation = () => {
  const pathname = usePathname();
  const router = useRouter();

  // State for API reference expandable sections
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  // State for user guide expandable sections
  const [expandedUserGuideSections, setExpandedUserGuideSections] = useState<
    Record<string, boolean>
  >({});

  // Toggle function for API reference sections
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Toggle function for user guide sections
  const flipUserGuideSection = (sectionId: string) => {
    setExpandedUserGuideSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Auto-expand logic for both API reference and user guide subsections
  useEffect(() => {
    // Auto-expand for API reference
    if (pathname?.startsWith("/docs/api-reference")) {
      const currentPath = pathname.replace("/docs/api-reference/", "");

      apiReference.forEach((item) => {
        item.sections.forEach((section) => {
          if (
            section.sections?.some((sub) => currentPath.startsWith(sub.href))
          ) {
            setExpandedSections((prev) => ({ ...prev, [section.id]: true }));
          }
        });
      });
    }

    // Auto-expand for user guides
    if (pathname?.startsWith("/docs/user-guides")) {
      const currentPath = pathname.replace("/docs/user-guides/", "");

      mainUserGuides.forEach((guide) => {
        guide.sections.forEach((section) => {
          // Check if the section itself matches the current path
          if (currentPath === section.id) {
            setExpandedUserGuideSections((prev) => ({
              ...prev,
              [section.id]: true,
            }));
          }
          // Check if any subsection matches the current path
          if (section.sections?.some((sub) => currentPath.startsWith(sub.id))) {
            setExpandedUserGuideSections((prev) => ({
              ...prev,
              [section.id]: true,
            }));
          }
        });
      });
    }
  }, [pathname]);

  // Handle navigation clicks (shared routing logic)
  const handleReferenceClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionHref?: string
  ) => {
    e.preventDefault();
    if (!sectionHref) return;

    const specialSections = [
      "limits-tiers",
      "changelogs",
      "faq",
      "api-pricing",
      "error-handling",
    ];
    const currentPath = pathname || "";

    const isInSpecialSection = specialSections.some((section) =>
      currentPath.includes(`/docs/api-reference/${section}`)
    );

    if (specialSections.includes(sectionHref)) {
      router.push(`/docs/api-reference/${sectionHref}`);
    } else {
      if (isInSpecialSection) {
        router.push(`/docs/api-reference/${sectionHref}`);
        const element = document.querySelector(
          `[data-section="${sectionHref}"]`
        );
        if (element) {
          const elementPosition =
            element.getBoundingClientRect().top + window.scrollY;
          const offset = 30;
          window.scrollTo({
            top: elementPosition - offset,
            behavior: "instant",
          });
        }
      } else {
        window.history.pushState(
          null,
          "",
          `/docs/api-reference/${sectionHref}`
        );

        const element = document.querySelector(
          `[data-section="${sectionHref}"]`
        );
        if (element) {
          const elementPosition =
            element.getBoundingClientRect().top + window.scrollY;
          const offset = 30;
          window.scrollTo({
            top: elementPosition - offset,
            behavior: "instant",
          });
        }
      }
    }
  };

  // Check if a path is active
  const isActive = (path: string) => pathname === path;

  return {
    pathname,
    expandedSections,
    expandedUserGuideSections,
    toggleSection,
    flipUserGuideSection,
    handleReferenceClick,
    isActive,
    apiReference,
    mainUserGuides,
  };
};
