"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, ExternalLink, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchCommand } from "@/components/features/developer/search-command";
import { useNavigation } from "@/components/docs/useNavigation";
import Link from "next/link";
import SearchModal from "../docSearchModal";

export function MobileNav() {
  const { resolvedTheme } = useTheme();
  const {
    pathname,
    expandedSections,
    expandedUserGuideSections,
    toggleSection,
    flipUserGuideSection,
    handleReferenceClick,
    isActive,
    apiReference,
    mainUserGuides,
    tutorial,
  } = useNavigation();

  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);

  const navItems = [
    { name: "Welcome", href: "/docs/getting-started", pageOne: "" },
    {
      name: "User Guide",
      href: "/docs/user-guides",
      pageOne: "platform-overview",
    },
    {
      name: "API Reference",
      href: "/docs/api-reference",
      pageOne: "introduction",
    },
    { name: "Tutorials", href: "/docs/tutorials", pageOne: "using-platform" },
    { name: "Community", href: "/discord" },
  ];

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const toggleSearch = () => setSearchOpen((prev) => !prev);

  // Broader match for top-level nav items
  const isNavActive = (href: string) => pathname.startsWith(href);

  const renderApiReference = () => (
    <div className="space-y-2">
      {apiReference.map((item) => (
        <div key={item.id}>
          <span className="font-bold text-sm px-4 py-2 block">
            {item.title.toUpperCase()}
          </span>
          {item.sections.map((section) => (
            <div key={section.id}>
              {section.sections ? (
                <div>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <span>{section.title}</span>
                    {expandedSections[section.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections[section.id] && (
                    <div className="ml-4 space-y-1">
                      {section.sections.map((subsection) => (
                        <Link
                          href={`/docs/api-reference/${subsection.href}`}
                          key={subsection.id}
                          onClick={(e) => {
                            handleReferenceClick(e, subsection.href);
                            setIsOpen(false); // Close sidebar on click
                          }}
                          className={cn(
                            "block px-4 py-2 text-sm",
                            isActive(`/docs/api-reference/${subsection.href}`)
                              ? "bg-accent text-foreground font-medium"
                              : "text-muted-foreground hover:bg-accent/50"
                          )}
                        >
                          {subsection.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={`/docs/api-reference/${section.id}`}
                  onClick={(e) => {
                    handleReferenceClick(e, section.id);
                    setIsOpen(false); // Close sidebar on click
                  }}
                  className={cn(
                    "block px-4 py-2 text-sm",
                    isActive(`/docs/api-reference/${section.id}`)
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  {section.title}
                </Link>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const renderUserGuides = () => (
    <div>
      {mainUserGuides.map((guide) => (
        <div className="" key={guide.id}>
          <span className="font-bold px-2 mb-3 text-xs">
            {`${guide.title.toUpperCase()}`}
          </span>
          <div className="py-2">
            {guide.sections.map((section) => {
              const isSupport = guide.id === "support";
              const hasSubsections =
                section.sections && section.sections.length > 0;
              const isExpanded = expandedUserGuideSections[section.id];

              return (
                <div key={section.id}>
                  {isSupport ? (
                    <Link
                      href={section.href ?? "#"}
                      target="_blank"
                      className="group flex items-center w-3/4 rounded-md p-2 text-sm ml-2 hover:bg-accent/10 hover:text-foreground text-muted-foreground"
                      onClick={() => setIsOpen(false)} // Close sidebar on click
                    >
                      <span className="relative z-10">{section.title}</span>
                      <ExternalLink className="ml-2 h-4 w-4 opacity-70" />
                    </Link>
                  ) : (
                    <div className="mb-2">
                      {hasSubsections ? (
                        <button
                          onClick={() => flipUserGuideSection(section.id)}
                          className={cn(
                            "group flex items-center w-3/4 rounded-md py-2 text-sm transition-all duration-200",
                            "relative overflow-hidden",
                            isActive(`/docs/user-guides/${section.id}`)
                              ? "dark:bg-accent bg-gray-200 rounded-md text-black dark:text-white font-medium shadow-sm"
                              : "text-muted-foreground dark:hover:bg-accent hover:text-foreground"
                          )}
                        >
                          <span className="px-2 text-sm">{section.title}</span>
                          {isExpanded ? (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronRight className="ml-2 h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <Link
                          href={`/docs/user-guides/${section.id}`}
                          className={cn(
                            "group flex items-center w-3/4 rounded-md py-2 text-sm transition-all duration-200",
                            "relative overflow-hidden",
                            isActive(`/docs/user-guides/${section.id}`)
                              ? "dark:bg-accent bg-gray-200 rounded-md text-black dark:text-white font-medium shadow-sm"
                              : "text-muted-foreground dark:hover:bg-accent hover:text-foreground"
                          )}
                          onClick={() => setIsOpen(false)} // Close sidebar on click
                        >
                          <span className="px-2 text-sm">{section.title}</span>
                        </Link>
                      )}

                      {hasSubsections && isExpanded && (
                        <div className="ml-4 mt-2">
                          {section.sections!.map((subsection) => (
                            <Link
                              key={subsection.id}
                              href={`/docs/user-guides/${subsection.id}`}
                              className={cn(
                                "group flex items-center w-3/4 rounded-md py-2 text-sm transition-all duration-200",
                                "relative overflow-hidden",
                                isActive(`/docs/user-guides/${subsection.id}`)
                                  ? "dark:bg-accent bg-gray-200 rounded-md text-black dark:text-white font-medium shadow-sm"
                                  : "text-muted-foreground dark:hover:bg-accent hover:text-foreground"
                              )}
                              onClick={() => setIsOpen(false)} // Close sidebar on click
                            >
                              <span className="px-2 text-sm">
                                {subsection.title}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTutorials = () => (
    <div className="space-y-2">
      {tutorial.map((item) => (
        <div key={item.id}>
          <span className="font-bold text-sm px-4 py-2 block">
            {item.title.toUpperCase()}
          </span>
          {item.sections.map((section) => (
            <Link
              key={section.id}
              href={`${item.href}/${section.id}`}
              className={cn(
                "block px-4 py-2 text-sm",
                isActive(`${item.href}/${section.id}`)
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
              onClick={() => setIsOpen(false)} // Already present, kept for consistency
            >
              {section.title}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-sideBarBackground backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <button onClick={toggleMenu} className="p-2">
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center">
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/svgs/logo-desktop-full.png"
                    : "/svgs/logo-desktop-dark-full.png"
                }
                alt="Logo"
                height={32}
                width={32}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <SearchCommand toggleModal={toggleSearch} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full h-[100vh] bg-sideBarBackground flex flex-col relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-foreground hover:text-muted-foreground z-50"
            >
              <X className="h-6 w-6" />
            </button>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={`${item.href}/${item.pageOne}`}
                    className={cn(
                      "block px-4 py-2 text-sm",
                      isNavActive(item.href)
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/50"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {pathname.startsWith("/docs/api-reference") &&
                  renderApiReference()}
                {pathname.startsWith("/docs/user-guides") && renderUserGuides()}
                {pathname.startsWith("/docs/tutorials") && renderTutorials()}

                <div>
                  <Link
                    href="/developer/workbench/chat-api"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50"
                    onClick={() => setIsOpen(false)}
                  >
                    Workbench
                  </Link>
                  <Link
                    href="/api"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50"
                    onClick={() => setIsOpen(false)}
                  >
                    API
                  </Link>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={toggleSearch} />
    </>
  );
}
