// @ts-nocheck
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiEndPoints } from "@/lib/constants/docs";
const ScrollNavigationWrapper = ({
  baseUrl = "/docs/api-reference",
  children,
  paths = apiEndPoints,
}) => {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentPath = window.location.pathname
    .replace(baseUrl, "")
    .replace(/^\//, "");
  const currentIndex = paths.indexOf(currentPath);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (isTransitioning) return;

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

      if (scrollPercentage > 0.98 && currentIndex < paths.length - 1) {
        setIsTransitioning(true);
        const nextPath = paths[currentIndex + 1];

        setTimeout(() => {
          router.push(`${baseUrl}/${nextPath}`);
          setIsTransitioning(false);
        }, 500);
      }

      if (scrollTop === 0 && scrollTop < lastScrollY && currentIndex > 0) {
        setIsTransitioning(true);
        const prevPath = paths[currentIndex - 1];

        setTimeout(() => {
          router.push(`${baseUrl}/${prevPath}`);
          setIsTransitioning(false);
        }, 500);
      }

      lastScrollY = scrollTop;
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll);

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      setIsTransitioning(false);
    };
  }, [baseUrl, paths, currentIndex, router, isTransitioning]);

  return <>{children}</>;
};

export default ScrollNavigationWrapper;
