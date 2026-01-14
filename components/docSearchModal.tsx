// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Fuse from "fuse.js";
import { useTheme } from "next-themes";
import {
  BookText,
  Text,
  Search,
  X,
  BookOpen,
  Hash,
  Key,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { ApiReferenceSearchData, userGuides } from "@/lib/search";
import { useRouter, usePathname } from "next/navigation";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SourceBadge = ({ source }: { source: string }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 0.5,
      px: 1,
      py: 0.25,
      borderRadius: "4px",
      fontSize: "0.75rem",
      fontWeight: 500,
      bgcolor:
        source === "API Reference"
          ? "rgba(99, 102, 241, 0.1)"
          : "rgba(34, 197, 94, 0.1)",
      color: source === "API Reference" ? "#6366f1" : "#22c55e",
    }}
  >
    {source === "API Reference" ? <Hash size={12} /> : <BookOpen size={12} />}
    {source}
  </Box>
);

interface SearchResult {
  objectTitle: string;
  sectionTitle?: string;
  sectionId?: string;
  mainUrl: string;
  content?: string;
  category: string;
  type: "mainTitle" | "sectionTitle" | "sectionContent";
}

interface QuickAccessLink {
  title: string;
  description: string;
  mainUrl: string;
  icon: "hash" | "key" | "message" | "alert" | "book";
}

const quickAccessDocs: QuickAccessLink[] = [
  {
    title: "API Reference",
    description: "Core API concepts, endpoints, and integration basics",
    mainUrl: "/docs/api-reference/introduction",
    icon: "book",
  },
  {
    title: "Authentication",
    description: "API key setup, authentication headers, and security",
    mainUrl: "/docs/api-reference/authentication",
    icon: "key",
  },
  {
    title: "Chat Completion",
    description: "Multi-model chat endpoints, parameters, and response formats",
    mainUrl: "/docs/api-reference/chat-endpoints",
    icon: "message",
  },
  {
    title: "Error Handling",
    description: "API status codes, error types, and exception handling",
    mainUrl: "/docs/api-reference/error-handling",
    icon: "alert",
  },
  {
    title: "SDKs & Libraries",
    description:
      "Integrate seamlessly with our Python and Node.js SDKs and libraries.",
    mainUrl: "/docs/api-reference/sdk",
    icon: "hash",
  },
];

const SearchModal = ({ isOpen, onClose }: ModalProps) => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingScroll = useRef<string | null>(null);

  // Get search data
  const searchData = ApiReferenceSearchData;

  // Flatten the data for fuzzy search in section contents
  const flattenedData = searchData.flatMap((obj) =>
    obj.sections
      .map((section) =>
        section.contents.map((content) => ({
          objectTitle: obj.title,
          sectionTitle: section.title,
          sectionId: section.id,
          mainUrl: obj.mainUrl,
          content,
          category: obj.title,
        }))
      )
      .flat()
  );

  // Flatten the data for fuzzy search in section titles
  const flattenedSectionTitles = searchData.flatMap((obj) =>
    obj.sections.map((section) => ({
      objectTitle: obj.title,
      sectionTitle: section.title,
      sectionId: section.id,
      mainUrl: obj.mainUrl,
      category: obj.title,
    }))
  );

  // Configure Fuse.js for fuzzy search in section contents
  const fuseSections = new Fuse(flattenedData, {
    keys: ["content"],
    threshold: 0.3,
    includeMatches: true,
    minMatchCharLength: 1,
  });

  // Configure Fuse.js for fuzzy search in object titles
  const fuseTitles = new Fuse(searchData, {
    keys: ["title"],
    threshold: 0.3,
    includeMatches: true,
    minMatchCharLength: 1,
  });

  // Configure Fuse.js for fuzzy search in section titles
  const fuseSectionTitles = new Fuse(flattenedSectionTitles, {
    keys: ["sectionTitle"],
    threshold: 0.3,
    includeMatches: true,
    minMatchCharLength: 1,
  });

  useEffect(() => {
    if (isOpen) {
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(focusTimer);
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery === "") {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      const results: SearchResult[] = [];

      if (trimmedQuery.length < 3) {
        // Keep existing smart progressive search for short queries
        const titleResults = fuseTitles.search(trimmedQuery);
        results.push(
          ...titleResults.map((result) => ({
            objectTitle: result.item.title,
            mainUrl: result.item.mainUrl,
            category: result.item.title,
            type: "mainTitle" as const,
          }))
        );

        if (results.length === 0) {
          const sectionTitleResults = fuseSectionTitles.search(trimmedQuery);
          results.push(
            ...sectionTitleResults.map((result) => ({
              objectTitle: result.item.objectTitle,
              sectionTitle: result.item.sectionTitle,
              sectionId: result.item.sectionId,
              mainUrl: result.item.mainUrl,
              category: result.item.category,
              type: "sectionTitle" as const,
            }))
          );
        }
      } else {
        // Enhanced full search for 3+ characters
        const titleResults = fuseTitles.search(trimmedQuery);
        results.push(
          ...titleResults.map((result) => ({
            objectTitle: result.item.title,
            mainUrl: result.item.mainUrl,
            category: result.item.title,
            type: "mainTitle" as const,
          }))
        );

        const sectionResults = fuseSections.search(trimmedQuery);
        sectionResults.forEach((result) => {
          const {
            objectTitle,
            sectionTitle,
            sectionId,
            mainUrl,
            content,
            category,
          } = result.item;

          results.push({
            objectTitle,
            sectionTitle,
            sectionId,
            mainUrl,
            content: content || "",
            category,
            type: "sectionContent" as const,
          });
        });

        const sectionTitleResults = fuseSectionTitles.search(trimmedQuery);
        results.push(
          ...sectionTitleResults.map((result) => ({
            objectTitle: result.item.objectTitle,
            sectionTitle: result.item.sectionTitle,
            sectionId: result.item.sectionId,
            mainUrl: result.item.mainUrl,
            category: result.item.category,
            type: "sectionTitle" as const,
          }))
        );

        // Sort results by type priority
        const typePriority = {
          mainTitle: 0,
          sectionTitle: 1,
          sectionContent: 2,
        } as const;

        results.sort((a, b) => typePriority[a.type] - typePriority[b.type]);

        // Limit results
        if (results.length > 20) {
          results.length = 20;
        }
      }

      setSearchResults(results);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Handle scroll after navigation
  useEffect(() => {
    if (pendingScroll.current) {
      const sectionId = pendingScroll.current;
      pendingScroll.current = null;

      const timer = setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ block: "start" });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleNavigation = async (mainUrl: string, sectionId?: string) => {
    try {
      onClose();

      if (sectionId) {
        pendingScroll.current = sectionId;

        if (pathname === mainUrl) {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ block: "start" });
          }
        } else {
          await router.push(mainUrl);
        }
      } else {
        await router.push(mainUrl);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = sectionId ? `${mainUrl}#${sectionId}` : mainUrl;
    }
  };

  const modalBackground = resolvedTheme === "dark" ? "#252525" : "#FFFFFF";
  const textColor = resolvedTheme === "dark" ? "#E0E0E0" : "#333333";
  const secondaryTextColor = resolvedTheme === "dark" ? "#A0A0A0" : "#666666";
  const inputBorderColor =
    resolvedTheme === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";
  const activeButtonColor = resolvedTheme === "dark" ? "#3b82f6" : "#2563eb";
  const hoverBackground = resolvedTheme === "dark" ? "#353535" : "#F5F5F5";
  const lineColor =
    resolvedTheme === "dark"
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.2)";
  const spinnerColor =
    resolvedTheme === "dark"
      ? "rgba(255, 255, 255, 0.7)"
      : "rgba(0, 0, 0, 0.6)";

  // Helper to highlight matched text
  const HighlightedText = ({
    text,
    query,
  }: {
    text: string;
    query: string;
  }) => {
    if (!query.trim() || !text) return <>{text || ""}</>;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <Box
              key={i}
              component="span"
              sx={{
                color: activeButtonColor,
                fontWeight: 500,
                background: `${activeButtonColor}20`,
                padding: "1px 4px",
                borderRadius: "4px",
              }}
            >
              {part}
            </Box>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  // Group results by objectTitle
  const groupedByObject = searchResults.reduce((acc, result) => {
    if (!acc[result.objectTitle]) {
      acc[result.objectTitle] = {
        mainUrl: result.mainUrl,
        sections: [],
      };
    }
    if (result.sectionTitle) {
      acc[result.objectTitle].sections.push(result);
    }
    return acc;
  }, {} as Record<string, { mainUrl: string; sections: SearchResult[] }>);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        pt: 4,
      }}
    >
      <Box
        sx={{
          width: 600,
          bgcolor: modalBackground,
          borderRadius: 4,
          p: 2,
          boxShadow:
            resolvedTheme === "dark"
              ? "0 4px 20px rgba(0, 0, 0, 0.5)"
              : "0 4px 20px rgba(0, 0, 0, 0.1)",
          position: "relative",
          zIndex: 1,
          border: `1px solid ${inputBorderColor}`,
          maxHeight: "80vh",
          overflowY: "auto",
          animation: "modalSlideIn 0.3s ease-out",
          "@keyframes modalSlideIn": {
            from: {
              opacity: 0,
              transform: "translateY(-20px) scale(0.95)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0) scale(1)",
            },
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <TextField
            inputRef={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Start typing to search API documentation..."
            fullWidth
            variant="outlined"
            autoFocus
            sx={{
              "& .MuiInputBase-input": {
                color: textColor,
                padding: "12px 48px 12px 40px",
                fontSize: "1rem",
                transition: "all 0.2s ease",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: inputBorderColor,
                borderRadius: "12px",
                transition: "all 0.2s ease",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: textColor,
              },
              "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: activeButtonColor,
                borderWidth: "2px",
                boxShadow: `0 0 0 3px ${activeButtonColor}20`,
              },
            }}
            InputProps={{
              sx: {
                bgcolor: modalBackground,
                borderRadius: "12px",
                boxShadow:
                  resolvedTheme === "dark"
                    ? "inset 0 2px 8px rgba(0, 0, 0, 0.2)"
                    : "inset 0 2px 8px rgba(0, 0, 0, 0.05)",
                transition: "all 0.2s ease",
              },
              startAdornment: isLoading ? (
                <CircularProgress
                  size={20}
                  sx={{
                    color: spinnerColor,
                    position: "absolute",
                    left: 10,
                  }}
                />
              ) : (
                <Search
                  size={20}
                  color={secondaryTextColor}
                  style={{
                    position: "absolute",
                    left: 10,
                  }}
                />
              ),
              endAdornment: searchQuery.length > 0 && (
                <Box
                  onClick={() => setSearchQuery("")}
                  sx={{
                    position: "absolute",
                    right: 10,
                    bottom: "50%",
                    transform: "translateY(50%)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 0.5,
                    borderRadius: "50%",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: hoverBackground,
                      transform: "translateY(50%) scale(1.1)",
                    },
                  }}
                >
                  <X size={16} color={secondaryTextColor} />
                </Box>
              ),
            }}
          />
        </Box>

        {searchQuery.trim() === "" && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
              p: 2,
              animation: "fadeIn 0.3s ease-out",
              "@keyframes fadeIn": {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          >
            {quickAccessDocs.map((doc, index) => (
              <Box
                key={doc.title}
                onClick={() => handleNavigation(doc.mainUrl)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  cursor: "pointer",
                  bgcolor:
                    resolvedTheme === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.02)",
                  transition: "all 0.2s ease",
                  border: `1px solid ${inputBorderColor}`,
                  "&:hover": {
                    bgcolor:
                      resolvedTheme === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                    transform: "translateY(-2px)",
                  },
                  animation: `fadeInStagger 0.3s ease-out ${index * 0.1}s both`,
                  "@keyframes fadeInStagger": {
                    from: {
                      opacity: 0,
                      transform: "translateY(10px)",
                    },
                    to: {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  {doc.icon === "book" && (
                    <BookOpen size={20} color={activeButtonColor} />
                  )}
                  {doc.icon === "key" && (
                    <Key size={20} color={activeButtonColor} />
                  )}
                  {doc.icon === "message" && (
                    <MessageSquare size={20} color={activeButtonColor} />
                  )}
                  {doc.icon === "alert" && (
                    <AlertTriangle size={20} color={activeButtonColor} />
                  )}
                  {doc.icon === "hash" && (
                    <Hash size={20} color={activeButtonColor} />
                  )}
                  <Typography
                    variant="subtitle1"
                    sx={{ color: textColor, fontWeight: 500 }}
                  >
                    {doc.title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: secondaryTextColor }}>
                  {doc.description}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {searchQuery.trim() === "" && (
          <Typography
            variant="body1"
            sx={{
              color: secondaryTextColor,
              textAlign: "center",
              py: 2,
              px: 2,
              borderTop: `1px solid ${inputBorderColor}`,
            }}
          >
            Type to search through the API documentation
          </Typography>
        )}

        <Box sx={{ mt: 2, px: 2 }}>
          {searchQuery.trim() !== "" &&
          searchResults.length === 0 &&
          !isLoading ? (
            <Typography
              variant="body1"
              sx={{
                color: secondaryTextColor,
                textAlign: "center",
                py: 2,
                animation: "fadeInStagger 0.3s ease-out",
                "@keyframes fadeInStagger": {
                  from: {
                    opacity: 0,
                    transform: "translateY(10px)",
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0)",
                  },
                },
              }}
            >
              No results found in API Reference
            </Typography>
          ) : searchQuery.trim().length < 3 &&
            searchResults.length > 0 &&
            !searchResults[0].sectionTitle ? (
            // Display only object titles when query length < 3 and there are title matches
            searchResults.map((result, index) => (
              <Box
                key={`${result.objectTitle}-${result.type}-${index}`}
                onClick={() => handleNavigation(result.mainUrl)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  borderRadius: "8px",
                  px: 1,
                  py: 0.5,
                  ml: 2,
                  animation: `fadeInStagger 0.3s ease-out ${index * 0.1}s both`,
                  "&:hover": {
                    bgcolor: hoverBackground,
                    transform: "translateX(4px)",
                  },
                  "@keyframes fadeInStagger": {
                    from: {
                      opacity: 0,
                      transform: "translateY(10px)",
                    },
                    to: {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                <BookOpen size={16} color={secondaryTextColor} />
                <Typography
                  variant="body1"
                  sx={{ color: textColor, fontWeight: 500 }}
                >
                  <HighlightedText
                    text={result.objectTitle}
                    query={searchQuery}
                  />
                </Typography>
              </Box>
            ))
          ) : (
            // Display results with CSS tree structure
            Object.entries(groupedByObject).map(
              ([objectTitle, { mainUrl, sections }], objIndex) => (
                <Box
                  key={`${objectTitle}-${objIndex}`}
                  sx={{
                    position: "relative",
                    py: 1,
                    borderBottom:
                      objIndex < Object.keys(groupedByObject).length - 1
                        ? `1px solid ${inputBorderColor}`
                        : "none",
                    animation: `fadeInStagger 0.3s ease-out ${
                      objIndex * 0.1
                    }s both`,
                    "@keyframes fadeInStagger": {
                      from: {
                        opacity: 0,
                        transform: "translateY(10px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                >
                  <Box
                    onClick={() => handleNavigation(mainUrl)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderRadius: "8px",
                      px: 1,
                      py: 0.5,
                      ml: 2,
                      "&:hover": {
                        bgcolor: hoverBackground,
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <BookOpen size={16} color={secondaryTextColor} />
                    <Typography
                      variant="body1"
                      sx={{ color: textColor, fontWeight: 500 }}
                    >
                      <HighlightedText text={objectTitle} query={searchQuery} />
                    </Typography>
                  </Box>
                  {sections.map((section, secIndex) => (
                    <Box
                      key={`${section.sectionTitle}-${section.sectionId}-${secIndex}`}
                      onClick={() =>
                        handleNavigation(section.mainUrl, section.sectionId)
                      }
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        ml: 4,
                        mb: 1,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        borderRadius: "8px",
                        px: 1,
                        py: 0.5,
                        position: "relative",
                        animation: `fadeInStagger 0.3s ease-out ${
                          objIndex * 0.1 + secIndex * 0.05
                        }s both`,
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: "-16px",
                          top: 0,
                          bottom:
                            secIndex === sections.length - 1 ? "auto" : "24px",
                          height:
                            secIndex === sections.length - 1 ? "12px" : "auto",
                          width: "1px",
                          backgroundColor: lineColor,
                          transition: "background-color 0.2s ease",
                        },
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          left: "-16px",
                          top: "12px",
                          width: "12px",
                          height: "1px",
                          backgroundColor: lineColor,
                          transition: "background-color 0.2s ease",
                        },
                        "&:hover": {
                          bgcolor: hoverBackground,
                          transform: "translateX(4px)",
                          "&::before, &::after": {
                            backgroundColor: `${activeButtonColor}60`,
                          },
                        },
                        "@keyframes fadeInStagger": {
                          from: {
                            opacity: 0,
                            transform: "translateY(10px)",
                          },
                          to: {
                            opacity: 1,
                            transform: "translateY(0)",
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {section.type === "sectionContent" ? (
                          <Text size={14} color={secondaryTextColor} />
                        ) : (
                          <Hash size={14} color={secondaryTextColor} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: textColor,
                            fontWeight: 500,
                            fontSize: "0.9rem",
                          }}
                        >
                          <HighlightedText
                            text={section.sectionTitle || ""}
                            query={searchQuery}
                          />
                        </Typography>
                      </Box>
                      {section.content && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: secondaryTextColor,
                            fontSize: "0.875rem",
                            mt: 0.5,
                            ml: 3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.4,
                          }}
                        >
                          <HighlightedText
                            text={section.content}
                            query={searchQuery}
                          />
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )
            )
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default SearchModal;
