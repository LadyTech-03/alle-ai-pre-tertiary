import { Button } from "@/components/ui/button";
import { Copy, Palette } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"

import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from 'next-themes';
import { useCodeThemeStore } from "@/stores";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MarkdownCodeProps {
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
}

// Define available themes
const AVAILABLE_THEMES = {
  'System Default': 'system',
  'Night Owl': 'nightOwl',
  'VS Light': 'vsLight',
  'VS Dark': 'vsDark',
  'Dracula': 'dracula',
  'GitHub': 'github',
  'Palenight': 'palenight',
  'Ocean Dark': 'oceanicNext',
} as const;

type ThemeKey = keyof typeof AVAILABLE_THEMES;
type ThemeValue = typeof AVAILABLE_THEMES[ThemeKey];

export function MarkdownCode({ children, className, inline }: MarkdownCodeProps) {
  ;
  const [copied, setCopied] = useState(false);
  const { theme: appTheme, systemTheme } = useTheme();
  const { theme: selectedTheme, setTheme: setCodeTheme } = useCodeThemeStore();

  // Handle inline code
  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded-md bg-secondary/30 text-xs font-mono">
        {children}
      </code>
    );
  }

  const language = className?.split('-')[1] || 'plaintext';
  const code = children as string;

  // Handle plaintext differently - render without code container
  if (language === 'plaintext') {
    return (
      <div className="whitespace-pre-wrap my-2 prose prose-sm dark:prose-invert max-w-none
        [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-2
        [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-2
        [&>li]:my-0.5">
        {children}
      </div>
    );
  }

  // Determine the effective theme
  const getTheme = () => {
    if (selectedTheme === 'System Default') {
      const effectiveTheme = appTheme === 'system' ? systemTheme : appTheme;
      return effectiveTheme === 'dark' ? themes.vsDark : themes.vsLight;
    }
    const themeValue = AVAILABLE_THEMES[selectedTheme as ThemeKey] as ThemeValue;
    return themes[themeValue as keyof typeof themes];
  };

  const formattedLanguage = language.charAt(0).toUpperCase() + language.slice(1);

  const handleCopy = async () => {
    if (typeof children === 'string') {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      toast.success('Copied')
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleThemeChange = (theme: ThemeKey) => {
    setCodeTheme(theme);
    toast.success(`Theme changed to ${theme}`);
  };

  return (
    <div className="relative max-w-3xl my-4 rounded-lg overflow-hidden border border-borderColorPrimary bg-secondary/5">
      {/* Language label and controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-backgroundSecondary">
        <span className="text-xs font-medium text-muted-foreground">
          {formattedLanguage}
        </span>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                <Palette className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-backgroundSecondary" align="end">
              {Object.keys(AVAILABLE_THEMES).map((themeName) => (
                <DropdownMenuItem
                  key={themeName}
                  onClick={() => handleThemeChange(themeName as ThemeKey)}
                  className={selectedTheme === themeName ? "bg-primary/10" : ""}
                >
                  {themeName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto">
        <Highlight
          theme={getTheme()}
          code={code.trim()}
          language={language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className="!bg-transparent !m-0" style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}