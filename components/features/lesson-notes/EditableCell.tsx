"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Pencil, X } from "lucide-react";

type EditableValue = string | string[];

interface EditableCellProps {
  value: EditableValue;
  onSave: (value: EditableValue) => void;
  placeholder?: string;
  multiline?: boolean;
  list?: boolean;
  className?: string;
}

const formatValue = (value: EditableValue) => {
  if (Array.isArray(value)) {
    return value.join("\n");
  }
  return value ?? "";
};

const parseValue = (draft: string, asList: boolean) => {
  const trimmed = draft.trim();
  if (!asList) {
    return trimmed;
  }
  if (!trimmed) {
    return [];
  }
  return trimmed
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export function EditableCell({
  value,
  onSave,
  placeholder,
  multiline,
  list,
  className,
}: EditableCellProps) {
  const isList = list ?? Array.isArray(value);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(formatValue(value));

  useEffect(() => {
    if (!isEditing) {
      setDraft(formatValue(value));
    }
  }, [value, isEditing]);

  const handleSave = () => {
    const nextValue = parseValue(draft, isList);
    onSave(nextValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(formatValue(value));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={cn("space-y-2", className)}>
        {multiline || isList ? (
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            className="min-h-[96px] focus-visible:outline-none focus:border-borderColorPrimary"
          />
        ) : (
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={placeholder}
            className="focus-visible:outline-none focus:border-borderColorPrimary"
          />
        )}
        <div className="flex items-center gap-2">
          <Button size="sm" variant='success2' onClick={handleSave}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setIsEditing(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          setIsEditing(true);
        }
      }}
      className={cn(
        "group relative min-h-[2.25rem] cursor-text rounded-md border border-transparent px-2 py-1 transition-colors hover:border-borderColorPrimary",
        className
      )}
    >
      {Array.isArray(value) ? (
        value.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-sm text-foreground">
            {value.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <span className="text-sm text-muted-foreground">{placeholder ?? "Click to edit"}</span>
        )
      ) : value ? (
        <span className="whitespace-pre-line text-sm text-foreground">{value}</span>
      ) : (
        <span className="text-sm text-muted-foreground">{placeholder ?? "Click to edit"}</span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(event) => {
          event.stopPropagation();
          setIsEditing(true);
        }}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}


