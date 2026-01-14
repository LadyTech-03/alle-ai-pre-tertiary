// @ts-nocheck
"use client";
import { mainUserGuides } from "@/lib/constants/docs";
import { usePathname } from "next/navigation";
import DynamicFaq from "@/components/faq/DynamicFaq";
import { Divide } from "lucide-react";
interface Section {
  id: string;
  href: string;
}

interface Guide {
  id: string;
  title: string;
  description?: string;
  section: Section[];
}

export default function Page() {
  const pathname = usePathname();

  const getTitle = (): { title: string; des: string; param?: string } => {
    for (const item of mainUserGuides) {
      for (const secs of item.sections) {
        if (secs.sections && secs.sections != []) {
          for (const subsec of secs.sections) {
            if (pathname === `/docs/user-guides/${subsec.id}`) {
              return { title: subsec.title, param: subsec.id, des: "" };
            }
          }
        } else if (pathname === `/docs/user-guides/${secs.id}`) {
          return { title: secs.title, param: secs.id, des: "" };
        }
      }
    }
    return {
      title: "Page Not Found",
      des: "No description available.",
      param: "none",
    };
  };

  const { title, param } = getTitle();

  return (
    <div className="flex-1 w-full flex-col ">
      {title === "Platform overview" ? (
        <div className="mb-5 py-4 "></div>
      ) : (
        <div>
          <h1 className="font-semibold text-xl mb-3 text-muted-foreground">
            {title === "Overview" ? "Welcome to AlleAI" : "Guides"}
          </h1>
          <div className="text-2xl font-bold mb-5">
            <h2 id={`${title}`}>
              {title === "Overview"
                ? " One Platform for Every AI Task"
                : title === "Quickstart"
                ? "User interface"
                : title === "Pricing"
                ? "Alle-AI Developer API Pricing"
                : title === "Limits & Tiers"
                ? "Rate Limits and Usage Tiers"
                : title}
            </h2>
          </div>
        </div>
      )}

      <DynamicFaq faqName={param} />
    </div>
  );
}
