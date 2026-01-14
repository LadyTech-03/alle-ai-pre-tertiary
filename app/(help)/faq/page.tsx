// @ts-nocheck
"use client";

import Link from "next/link";
import { helpCategories } from "./constants";
import { IconComponent } from "@/components/IconComponent";
import { useState, useEffect } from "react";
import { languages } from "@/lib/constants";
import CustomHead from "@/components/faq/CustomHead";
export default function CollectionPage() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  return (
    <>
      <CustomHead title="Alle-AI | Help Center" />
      <div className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(helpCategories).map(([slug, category]) => (
            <Link
              key={category.id}
              href={
                category.uniqueRoute ? category.href : `/faq/${slug}`
              }
              className="group p-6 rounded-lg border border-borderColorPrimary hover:shadow-md transition-all"
            >
              <div className="gap-4">
                <div className="py-3 rounded-lg">
                  <IconComponent name={category.iconName} className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {category.sections.reduce(
                      (acc, section) => acc + section.articles.length,
                      0
                    )}{" "}
                    {category.sections.reduce(
                      (acc, section) => acc + section.articles.length,
                      0
                    ) < 2
                      ? "article"
                      : "articles"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
          {/* <Link
          href={`/release-notes`}
          className="group p-6 rounded-lg border border-borderColorPrimary hover:shadow-md transition-all"
        >
          <div className="gap-4">
            <div className="py-3 rounded-lg">
              <ScrollText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold mb-2 group-hover:text-primary transition-colors">
                Relesase notes
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                See all releases on Alle-AI
              </p>
              <p className="text-xs text-muted-foreground"></p>
            </div>
          </div>
        </Link> */}
        </div>
      </div>
    </>
  );
}
