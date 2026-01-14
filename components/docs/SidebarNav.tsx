"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigation } from "@/components/docs/useNavigation";
import Link from "next/link";

export const SidebarNav = () => {
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

  const renderApiReference = () => (
    <div>
      {apiReference.map((item) => (
        <div key={item.id} className="relative">
          <div className="flex w-full items-center justify-between rounded-lg p-2 text-sm font-medium transition-all duration-200">
            <span className="font-bold text-sm p-2">{`${item.title.toUpperCase()}`}</span>
          </div>

          <div className="space-y-1">
            {item.sections.map((section) => (
              <div key={section.id}>
                {section.sections ? (
                  <div>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="group flex items-center justify-between w-3/4 rounded-md p-2 text-sm ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <span className="relative z-10">{section.title}</span>
                      {expandedSections[section.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedSections[section.id] && section.sections && (
                      <div className="ml-6 space-y-1">
                        {section.sections.map((subsection) => (
                          <Link
                            href={`/docs/api-reference/${subsection.href}`}
                            key={subsection.id}
                            onClick={(e) =>
                              handleReferenceClick(e, subsection.href)
                            }
                            className={cn(
                              "group flex items-center w-3/4 rounded-md p-2 text-sm transition-all duration-200",
                              "relative overflow-hidden",
                              isActive(`/docs/api-reference/${subsection.href}`)
                                ? "dark:bg-accent bg-gray-200 rounded-md text-black dark:text-white font-medium shadow-sm"
                                : "text-muted-foreground dark:hover:bg-accent hover:text-foreground"
                            )}
                          >
                            <span className="relative z-10">
                              {subsection.title}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={`/docs/api-reference/${section.id}`}
                    onClick={(e) => handleReferenceClick(e, section.id)}
                    className={cn(
                      "group flex items-center w-3/4 rounded-md p-2 text-sm transition-all duration-200 ml-2",
                      "relative overflow-hidden",
                      isActive(`/docs/api-reference/${section.id}`)
                        ? "dark:bg-accent bg-gray-200 rounded-md text-black dark:text-white font-medium shadow-sm"
                        : "text-muted-foreground dark:hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <span className="relative z-10">{section.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
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
    <div>
      {tutorial.map((item) => (
        <div key={item.id}>
          <span className="font-bold px-2 mb-5">
            {`${item.title.toUpperCase()}`}
          </span>
          {item.sections.map((section) => (
            <div className="mb-2 mt-3" key={section.id}>
              <Link
                href={`${item.href}/${section.id}`}
                className={cn(
                  "group flex items-center w-3/4 rounded-md py-2 text-sm transition-all duration-200",
                  "relative overflow-hidden",
                  isActive(`${item.href}/${section.id}`)
                    ? "dark:bg-accent bg-gray-200 rounded-md text-black dark:text-white font-medium shadow-sm"
                    : "text-muted-foreground dark:hover:bg-accent hover:text-foreground"
                )}
              >
                <span className="px-2 text-sm">{section.title}</span>
              </Link>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <ScrollArea className="h-full py-6 pl-4 pr-2">
      <div className="space-y-6">
        {pathname.startsWith("/docs/api")
          ? renderApiReference()
          : pathname.startsWith("/docs/user-guides")
          ? renderUserGuides()
          : pathname.startsWith("/docs/tutorials")
          ? renderTutorials()
          : ""}
      </div>
    </ScrollArea>
  );
};
