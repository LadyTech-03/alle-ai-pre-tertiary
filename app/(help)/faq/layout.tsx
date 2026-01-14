// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { languages } from "@/lib/constants";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Input } from "@/components/ui/input";
import { ScrollText, Search, Globe, Home, Router } from "lucide-react";
import Providers from "@/components/ProgressBar";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { helpCategories } from "./constants";

interface SearchResult {
  categoryKey?: string;
  categoryTitle: string;
  articleTitle: string;
  articleDescription?: string;
  readingTime?: string;
  articleId: string;
  categoryId: string;
  matchedKeywords?: string[];
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearching(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    const results: SearchResult[] = [];

    Object.entries(helpCategories).forEach(([categoryKey, category]) => {
      category.sections.forEach((section) => {
        section.articles.forEach((article) => {
          const keywords = article.keywords || [];
          const matchedKeywords = keywords.filter((keyword) =>
            searchTerms.some((term) => keyword.toLowerCase().includes(term))
          );

          const titleMatch = article.title
            .toLowerCase()
            .includes(query.toLowerCase());
          const descriptionMatch = article.description
            ?.toLowerCase()
            .includes(query.toLowerCase());
          const hasKeywordMatch = matchedKeywords.length > 0;

          if (titleMatch || descriptionMatch || hasKeywordMatch) {
            results.push({
              categoryKey: categoryKey,
              categoryTitle: category.title,
              articleTitle: article.title,
              articleDescription: article.description,
              readingTime: article.readingTime,
              articleId: article.id,
              categoryId: category.id,
              matchedKeywords: hasKeywordMatch ? matchedKeywords : undefined,
            });
          }
        });
      });
    });

    results.sort((a, b) => {
      if (a.articleTitle.toLowerCase() === query.toLowerCase()) return -1;
      if (b.articleTitle.toLowerCase() === query.toLowerCase()) return 1;

      const aKeywords = a.matchedKeywords?.length || 0;
      const bKeywords = b.matchedKeywords?.length || 0;
      if (aKeywords !== bKeywords) return bKeywords - aKeywords;

      const aTitleMatch = a.articleTitle
        .toLowerCase()
        .includes(query.toLowerCase());
      const bTitleMatch = b.articleTitle
        .toLowerCase()
        .includes(query.toLowerCase());
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;

      return 0;
    });

    setSearchResults(results.slice(0, 10));
    setIsSearching(true);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    //  navigation/action logic
    if (result.categoryKey === "getting-started") {
      router.push("/about/alle-ai");
    } else router.push(`/faq/${result.categoryKey}/${result.articleId}`);

    setIsSearching(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <header className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col">
            <div className="flex justify-around sm:justify-between items-center mb-4">
              <Link href={"/faq"}>
                <Image
                  src={
                    resolvedTheme === "dark"
                      ? "/svgs/logo-desktop-full.webp"
                      : "/svgs/logo-desktop-dark-full.webp"
                  }
                  alt="all-ai"
                  height={100}
                  width={100}
                />
              </Link>

              <div className="right-10 flex items-center gap-5 text-sm">
                {/* <Link href={"/docs/getting-started"} target="_blank">
                  API Docs
                </Link> */}
                <Link href="/docs/api-reference/introduction">API Docs</Link>
                {/* <Link href={"/release-notes"}>Release Notes</Link> */}
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">
                      {selectedLanguage.code.toUpperCase()}
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang)}
                        className="flex items-center gap-2"
                      >
                        <span className="text-sm font-medium">{lang.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({lang.code.toUpperCase()})
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {pathname === "/faq" ? (
              <div className="text-center mt-5">
                <h1 className="text-4xl font-bold mb-3">Help Center</h1>
                <p className="text-muted-foreground text-lg mb-8">
                  Advice and answers from the Alle AI Team
                </p>
              </div>
            ) : null}

            <div
              className="w-full max-w-2xl mx-auto relative group transition-all duration-200"
              ref={searchRef}
            >
              <div className="relative rounded-md shadow-sm border border-borderColorPrimary">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground  group-hover:text-muted-foreground transition-colors duration-200" />
                <Input
                  placeholder="Search for articles..."
                  className="w-full pl-10 h-12 rounded-md border-0 focus-visible:outline-none transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                />
              </div>

              {isSearching && searchQuery.length >= 2 && (
                <div className="absolute w-full mt-2 rounded-md shadow-lg max-h-[60vh] overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result, index) => (
                        <div
                          key={`${result.categoryId}-${result.articleId}-${index}`}
                          className="bg-backgroundSecondary px-4 py-3 hover:bg-hoverColorPrimary cursor-pointer border-b last:border-b-0 border-borderColorPrimary transition-all duration-200"
                          onClick={() => handleSearchResultClick(result)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {result.categoryTitle}
                          </div>
                          <div className="text-sm font-medium">
                            {result.articleTitle}
                          </div>
                          {result.articleDescription && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {result.articleDescription}
                            </div>
                          )}
                          {result.matchedKeywords &&
                            result.matchedKeywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.matchedKeywords.map((keyword, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            )}
                          {result.readingTime && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {result.readingTime}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Providers>{children}</Providers>
        </main>
      </div>
    </>
  );
}
