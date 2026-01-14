// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Copy, Check, Code, FileText } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark, githubLight } from '@uiw/codemirror-themes-all';

interface EditJsonProps {
  content: string;
  onEdit?: () => void;
}

interface JsonEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onSave: (content: string) => void;
}

export function JsonEditModal({ isOpen, onClose, content, onSave }: JsonEditModalProps) {
  const { resolvedTheme } = useTheme();
  const [editableContent, setEditableContent] = useState(content);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setEditableContent(content);
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-background border-borderColorPrimary">
        <DialogHeader className="mb-4">
          <div className="flex items-center">
            <Code className="h-5 w-5 text-primary mr-2" />
            <DialogTitle className="text-lg font-semibold">API Request Body</DialogTitle>
          </div>
        </DialogHeader>

        <div className="min-h-[400px] border rounded-md border-borderColorPrimary overflow-hidden">
          <CodeMirror
            value={editableContent}
            height="400px"
            theme={resolvedTheme === 'dark' ? vscodeDark : githubLight}
            extensions={[json()]}
            editable={false}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              defaultKeymap: true,
              searchKeymap: true,
              historyKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
            className="cursor-pointer"
          />
        </div>

        <DialogFooter className="mt-4 flex justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {isCopied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Copy JSON
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-borderColorPrimary h-9"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditJson({ content, onEdit }: EditJsonProps) {
  const { resolvedTheme } = useTheme();
  const [isCopied, setIsCopied] = useState(false);

  const getTruncatedContent = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const lines = JSON.stringify(parsed, null, 2).split('\n');
      
      if (lines.length <= 10) {
        return jsonString;
      }

      const firstPart = lines.slice(0, 4);
      const lastPart = lines.slice(-3);
      
      return [...firstPart, ...lastPart].join('\n');
    } catch (e) {
      return jsonString;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isContentTruncated = () => {
    try {
      return JSON.stringify(JSON.parse(content), null, 2).split('\n').length > 10;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-2">
      <div className="border border-borderColorPrimary rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Code className="h-4 w-4 mr-2 text-muted-foreground" />
            <h3 className="text-sm font-medium">JSON Request</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {isCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            
            {isContentTruncated() && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-borderColorPrimary bg-backgroundSecondary/30"
                onClick={onEdit}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Full JSON
              </Button>
            )}
          </div>
        </div>
        
        <div className="h-[200px] rounded-md overflow-hidden">
          <CodeMirror
            value={getTruncatedContent(content)}
            height="200px"
            theme={resolvedTheme === 'dark' ? vscodeDark : githubLight}
            extensions={[json()]}
            editable={false}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: false,
              highlightSpecialChars: true,
              foldGutter: true,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: false,
              bracketMatching: true,
              closeBrackets: false,
              autocompletion: false,
              rectangularSelection: false,
              crosshairCursor: false,
              highlightActiveLine: false,
              highlightSelectionMatches: false,
              closeBracketsKeymap: false,
              defaultKeymap: false,
              searchKeymap: false,
              historyKeymap: false,
              foldKeymap: false,
              completionKeymap: false,
              lintKeymap: false,
            }}
          />
        </div>
      </div>

      {isContentTruncated() && (
        <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
          <div className="flex-1 flex items-center">
            <span className="mr-1">•</span>
            <p>This is a preview. Click <button 
              onClick={onEdit}
              className="text-primary hover:text-primary/80 font-medium mx-1 cursor-pointer"
            >
              View Full JSON
            </button> to see the complete request.</p>
          </div>
        </div>
      )}
    </div>
  );
}