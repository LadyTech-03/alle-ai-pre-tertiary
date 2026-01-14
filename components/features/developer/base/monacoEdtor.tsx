"use client"

import { useTheme } from "next-themes"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import {
  githubLight,
  gruvboxDark,
} from "@uiw/codemirror-themes-all";
import { EditorView } from "@codemirror/view"

interface MonacoEditorProps {
  value: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MonacoEditor = ({ value, height = "100%", className = "", style = {} }: MonacoEditorProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <div className={`relative ${className}`} style={style}>
      <CodeMirror
        value={value}
        height={height}
        theme={resolvedTheme === "dark" ? gruvboxDark : githubLight}
        extensions={[json(), EditorView.lineWrapping]}
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
        style={{ width: "100%" }}
        className="overflow-x-auto cm-full-height"
      />

      {/* Custom CSS to ensure CodeMirror background fills the container */}
      <style jsx>{`
        .cm-full-height :global(.cm-editor) {
          height: 100% !important;
        }
        .cm-full-height :global(.cm-scroller) {
          background-color: inherit !important;
        }
      `}</style>
    </div>
  );
};

export default MonacoEditor;
