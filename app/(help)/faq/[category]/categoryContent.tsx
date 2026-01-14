"use client";

import { ChevronRight, Clock9, Search, Globe, Home } from "lucide-react";
import Link from "next/link";
import { HelpCategory, Article } from "@/lib/types";
import { IconComponent } from "@/components/IconComponent";
import { useEffect, useRef, useState } from "react";
import { languages } from "@/lib/constants";
import { toast } from "sonner"

export function CategoryContent({
  category,
  categorySlug,
}: {
  category: HelpCategory;
  categorySlug: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  useEffect(() => {
    document.title = "Alle-AI | Help Center";
    if (selectedLanguage.code !== "en") {
      toast.info('this language translation will be available soon');
    }
  }, [selectedLanguage.code, toast]);

  const filteredSections = category.sections
    .map((section) => ({
      ...section,
      articles: section.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.articles.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="max-w-5xl mx-auto px-4 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link
              href="/faq"
              className="hover:text-foreground transition-colors"
            >
              All Collections
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{category.title}</span>
          </div>

          {/* Add this right after the breadcrumb */}

          {/* Category Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <IconComponent
                name={category.iconName}
                className="w-8 h-8 text-primary"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{category.title}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {category.description}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                {category.sections.reduce(
                  (acc, section) => acc + section.articles.length,
                  0
                )}{" "}
                {category.sections.reduce(
                  (acc, section) => acc + section.articles.length,
                  0
                ) < 2
                  ? "article"
                  : "articles"}{" "}
                in this collection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No articles found matching your search.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredSections.map((section, index) => (
              <div key={index}>
                <h2 className="text-xl font-semibold mb-6">{section.title}</h2>
                <div className="grid gap-4">
                  {section.articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/faq/${categorySlug}/${article.id}`}
                      className="group p-6 rounded-xl border bg-backgroundSecondary hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground mb-3">
                            {article.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Clock9 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {article.readingTime}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
