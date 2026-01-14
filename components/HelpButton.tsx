import React, { useEffect, useState, } from 'react';
import { Button } from "@/components/ui/button";
import { BadgeQuestionMark, Mail, FileText, Book, Keyboard, AlertTriangle, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportContentModal, ShortcutsModal } from './ui/modals';
import { useSidebarStore, useSelectedModelsStore } from "@/stores";
import { usePathname, useRouter } from "next/navigation";


export function HelpButton() {

const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
const [reportModalOpen, setReportModalOpen] = useState(false);
const { isOpen, toggle } = useSidebarStore();
const pathname = usePathname();
const router = useRouter();


useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === '/') {
      e.preventDefault();
      setShortcutsModalOpen(true);
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      toggle();
    }
    if (e.ctrlKey && e.shiftKey && (e.key === 'o' || e.key === 'O')) {
      e.preventDefault();
      switch (true) {
        case pathname.startsWith("/chat"):
          router.push("/chat");
          break;
        case pathname.startsWith("/image"):
          router.push("/image");
          break;
        case pathname.startsWith("/audio"):
          router.push("/audio");
          break;
        case pathname.startsWith("/video"):
          router.push("/video");
          break;
        default:
          router.push("/chat");
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);

  const helpItems = [
    {
      icon: Book,
      label: 'Help & FAQ',
      onClick: () => window.open('/faq', '_blank')
    },
    // {
    //   icon: FileText,
    //   label: 'Release notes',
    //   onClick: () => window.open('/release-notes', '_blank')
    // },
    {
      icon: FileText,
      label: 'Terms & policies',
      onClick: () => window.open('/terms-of-service', '_blank')
    },
    {
      icon: Keyboard,
      label: 'Keyboard shortcuts',
      onClick: () => {setShortcutsModalOpen(true)}
    },
    // {
    //   icon: AlertTriangle,
    //   label: 'Report Illegal Content',
    //   onClick: () => {setReportModalOpen(true)}
    // },
  ];

  return (
    <div className="fixed hidden md:block bottom-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full bg-background border-none text-muted-foreground"
          >
            <BadgeQuestionMark className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          alignOffset={-40}
          className="w-[240px] bg-backgroundSecondary border border-border"
        >
          {helpItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <DropdownMenuItem
                className="flex items-center gap-2 py-2 px-4 cursor-pointer"
                onClick={item.onClick}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {(index === 0 || index === 1 ) && <ExternalLink className="h-3 w-3 opacity-50" />}
              </DropdownMenuItem>
              {(index === 3) && (
                <DropdownMenuSeparator />
              )}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

        <ShortcutsModal 
          isOpen={shortcutsModalOpen} 
          onClose={() => setShortcutsModalOpen(false)} 
        />
        <ReportContentModal 
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          contentId="123"
          contentType="image"
          contentPreview="AI-generated image of a landscape..."
        />
    </div>
  );
}