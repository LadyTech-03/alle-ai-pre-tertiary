import { useState, useEffect } from "react";
import { useTheme } from 'next-themes';
import { Highlight, themes } from 'prism-react-renderer';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Maximize2 } from "lucide-react";

export function ExpandableCode({ 
    content, 
    language,
    placeholder 
  }: { 
    content: string, 
    language?: string,
    placeholder?: React.ReactNode 
  }) {
    const { theme: appTheme, systemTheme } = useTheme();
    
    // Determine the effective theme
    const getTheme = () => {
      const effectiveTheme = appTheme === 'system' ? systemTheme : appTheme;
      return effectiveTheme === 'dark' ? themes.vsDark : themes.vsLight;
    };

    if (placeholder && !content) {
      return placeholder;
    }

    return (
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="bg-backgroundSecondary/80 hover:bg-backgroundSecondary"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh]">
              <DialogTitle className="text-lg font-medium">
                {language ? `${language.toUpperCase()} Code` : 'Response'}
              </DialogTitle>
              <ScrollArea className="h-[calc(100%-3rem)] mt-4">
                <Highlight
                  theme={getTheme()}
                  code={content.trim()}
                  language={language || 'json'}
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
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        
        <Highlight
          theme={getTheme()}
          code={content.trim()}
          language={language || 'json'}
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
    );
  }