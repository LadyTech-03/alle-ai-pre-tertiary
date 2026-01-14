import { cn } from '@/lib/utils';

interface MarkdownTableProps {
  children?: React.ReactNode;
  className?: string;
}

export function MarkdownTable({ children, className }: MarkdownTableProps) {
  return (
    <div className="my-3 w-full max-w-[94%] overflow-hidden rounded-lg border border-borderColorPrimary bg-transparent backdrop-blur-[2px]">
      <div className="overflow-x-auto">
        <table className={cn(
          "w-full table-fixed border-collapse text-sm",
          "divide-y divide-borderColorPrimary my-0",
          className
        )}>
          {children}
        </table>
      </div>
    </div>
  );
}

export function MarkdownThead({ children, className }: MarkdownTableProps) {
  return (
    <thead className={cn(
      "bg-zinc-950/5 dark:bg-zinc-50/5",
      "text-zinc-900 dark:text-zinc-200",
      "border-b border-borderColorPrimary",
      className
    )}>
      {children}
    </thead>
  );
}

export function MarkdownTr({ children, className }: MarkdownTableProps) {
  return (
    <tr className={cn(
      "transition-colors divide-x divide-borderColorPrimary",
      "hover:bg-zinc-950/[0.02] dark:hover:bg-zinc-50/[0.02]",
      "group",
      className
    )}>
      {children}
    </tr>
  );
}

export function MarkdownTh({ children, className }: MarkdownTableProps) {
  return (
    <th className={cn(
      "px-4 py-3 min-w-[120px]",
      "text-left text-xs font-semibold uppercase tracking-wider",
      "text-zinc-600 dark:text-zinc-400",
      "border-b border-borderColorPrimary",
      "break-words",
      className
    )}>
      <div className="whitespace-pre-line">
        {children}
      </div>
    </th>
  );
}

export function MarkdownTd({ children, className }: MarkdownTableProps) {
  return (
    <td className={cn(
      "px-4 py-3 min-w-[120px]",
      "text-zinc-700 dark:text-zinc-300",
      "group-hover:text-zinc-900 dark:group-hover:text-zinc-100",
      "border-b border-borderColorPrimary",
      "break-words",
      className
    )}>
      <div className="whitespace-pre-line">
        {children}
      </div>
    </td>
  );
}