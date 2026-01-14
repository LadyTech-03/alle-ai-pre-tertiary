"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Building2, 
  Users, 
  Folders,
  CreditCard,
  Gauge,
  Key,
  ShieldCheck,
  ScrollText,
  Lock,
} from "lucide-react";
import { SettingsSidebar } from "@/components/features/developer/settings-sidebar";

const settingsSections = [
  {
    title: "Organization",
    items: [
      { label: "Profile", href: "/developer/settings/profile", icon: User },
      { label: "Organization", href: "/developer/settings/organization", icon: Building2 },
      { label: "Members", href: "/developer/settings/members", icon: Users },
      { label: "Workspaces", href: "/developer/settings/workspaces", icon: Folders },
    ]
  },
  {
    title: "Billing",
    items: [
      { label: "Billing", href: "/developer/settings/billing", icon: CreditCard },
      { label: "Limits", href: "/developer/settings/limits", icon: Gauge },
    ]
  },
  {
    title: "Security",
    items: [
      { label: "API keys", href: "/developer/settings/api-keys", icon: Key },
      { label: "Admin keys", href: "/developer/settings/admin-keys", icon: ShieldCheck },
      { label: "Logs", href: "/developer/settings/logs", icon: ScrollText },
      { label: "Privacy", href: "/developer/settings/privacy", icon: Lock },
    ]
  }
];

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex min-h-screen bg-sideBarBackground">
        <SettingsSidebar />
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-8">
            <div className="max-w-[1200px] mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }