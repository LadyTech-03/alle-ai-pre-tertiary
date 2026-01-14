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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const settingsSections = [
  {
    title: "Organization",
    items: [
      { label: "Profile", href: "/developer/settings/profile", icon: User },
    //   { label: "Organization", href: "/developer/settings/organization", icon: Building2 },
    //   { label: "Members", href: "/developer/settings/members", icon: Users },
    //   { label: "Workspaces", href: "/developer/settings/workspaces", icon: Folders },
    ]
  },
  {
    title: "Billing",
    items: [
      { label: "Billing", href: "/developer/settings/billing", icon: CreditCard },
      { label: "Rate limits", href: "/developer/settings/limits", icon: Gauge },
    ]
  },
  {
    title: "Security",
    items: [
      { label: "API keys", href: "/developer/settings/api-keys", icon: Key },
    //   { label: "Admin keys", href: "/developer/settings/admin-keys", icon: ShieldCheck },
    //   { label: "Logs", href: "/developer/settings/logs", icon: ScrollText },
    //   { label: "Privacy", href: "/developer/settings/privacy", icon: Lock },
    ]
  }
];

export function SettingsSidebar() {
  const pathname = usePathname();
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    toast.success("Logged out successfully");
    router.push("/auth");
  };

  return (
    <div className="w-64 min-h-screen border-r border-borderColorPrimary bg-backgroundSecondary/30 backdrop-blur-sm">
      <div className="p-6">
        {settingsSections.map((section) => (
          <div key={section.title} className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 px-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200",
                    "hover:bg-backgroundSecondary hover:text-foreground",
                    "active:scale-98",
                    pathname === item.href ? [
                      "bg-backgroundSecondary text-foreground",
                      "shadow-sm",
                      "relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                      "before:h-8 before:w-1 before:bg-primary before:rounded-full"
                    ] : "text-muted-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors",
                    pathname === item.href && "text-primary"
                  )} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        
        {/* Logout Button */}
        <div className="mt-8 pt-4 border-t border-borderColorPrimary">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 w-full",
              "hover:bg-red-500/10 hover:text-red-500",
              "active:scale-98",
              "text-muted-foreground"
            )}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}