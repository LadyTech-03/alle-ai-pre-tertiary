// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check, Code, ChevronsUpDown, FileText } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";

interface LanguageCode {
  language: string;
  code: string;
}

interface ShowCodesProps {
  languages: LanguageCode[];
  maxWidth?: string | number | boolean;
  isLink?: boolean;
  autoFormat?: boolean;
}

const ShowCodes: React.FC<ShowCodesProps> = ({
  languages,
  maxWidth = "100%",
  isLink = false,
  autoFormat = true,
}) => {
  const { resolvedTheme } = useTheme();
  const [activeLanguage, setActiveLanguage] = useState<string>(
    languages.length > 0 ? languages[0].language : ""
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const [formattedCode, setFormattedCode] = useState<string>("");
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const languageMap: Record<string, string> = {
    curl: "shell",
    python: "python",
    node: "javascript",
  };

  const activeCode: string =
    languages.find((item) => item.language === activeLanguage)?.code || "";

  // Apply cursor styles when theme changes
  useEffect(() => {
    updateCursorStyles();
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [resolvedTheme]);

  // Update formatted code when language changes
  useEffect(() => {
    if (editorInstance && autoFormat) {
      setTimeout(() => formatCode(), 300);
    } else {
      setFormattedCode(activeCode);
    }
  }, [activeLanguage, activeCode]);

  const handleLanguageChange = (language: string) => {
    setActiveLanguage(language);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedCode || activeCode).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const updateCursorStyles = () => {
    // Remove existing style if any
    if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }

    // Add custom cursor styles for better visibility
    const style = document.createElement("style");
    style.id = "editor-cursor-style";

    if (resolvedTheme === "light") {
      // Higher contrast cursor for light mode
      style.innerHTML = `
        .monaco-editor .cursor {
          background-color: rgba(0, 0, 0, 0.5) !important;
          border-left: 1px solid black !important;
          width: 2px !important;
        }
      `;
    } else {
      // Better cursor for dark mode
      style.innerHTML = `
        .monaco-editor .cursor {
          background-color: rgba(255, 255, 255, 0.75) !important;
          border-left: 1px solid white !important;
          width: 2px !important;
        }
      `;
    }

    document.head.appendChild(style);
    styleRef.current = style;
  };

  const handleEditorDidMount = (editor, monaco) => {
    setEditorInstance(editor);
    updateCursorStyles();

    // Format code on initial load if autoFormat is enabled
    if (autoFormat) {
      setTimeout(() => formatCode(editor), 300);
    }
  };

  const formatCode = (editorToUse = editorInstance) => {
    if (!editorToUse) return;

    try {
      // Use Monaco's built-in formatter
      editorToUse
        .getAction("editor.action.formatDocument")
        ?.run()
        .then(() => {
          setFormattedCode(editorToUse.getValue());
        });
    } catch (error) {
      console.warn("Could not format code:", error);
      setFormattedCode(editorToUse.getValue());
    }
  };

  return (
    <div
      className="rounded-lg overflow-hidden bg-background border border-borderColorPrimary"
      style={{ maxWidth }}
    >
      <div className="flex flex-row justify-between bg-backgroundSecondary items-center px-4 py-2">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {activeLanguage.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={activeLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none bg-backgroundSecondary text-sm font-medium rounded-md py-1 px-3 pr-8 border border-muted hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
            >
              {languages.map(({ language }) => (
                <option key={language} value={language}>
                  {language.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          {editorInstance && (
            <button
              onClick={() => formatCode()}
              className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Format code"
              title="Format code"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Copy code"
            title="Copy code"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      <Card className="rounded-none border-0 border-t border-borderColorPrimary">
        <CardContent className="p-0">
          <div style={{ maxHeight: 300, overflow: "auto" }}>
            <Editor
              height="300px"
              language={languageMap[activeLanguage] || activeLanguage}
              value={activeCode}
              theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
              onMount={handleEditorDidMount}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontFamily: "'Fira Code', 'Consolas', monospace",
                fontSize: 14,
                lineNumbers: isLink ? "off" : "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 8, bottom: 8 },
                renderWhitespace: "selection",
                wordWrap: "on",
                formatOnPaste: true,
                formatOnType: true,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShowCodes;
