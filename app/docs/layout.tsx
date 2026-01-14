// @ts-nocheck
"use client";
import { usePathname } from "next/navigation";
import { DocsHeader } from "@/components/docs/docsHeader";
import { SidebarNav } from "@/components/docs/SidebarNav";
import { OnThisPage } from "@/components/docs/OnThisPage";
import { MobileNav } from "@/components/docs/mobileNav";
import { DynamicDocsTitle } from "@/components/docs/pagesTitle";
export default function Layout({ children }) {
  const pathname = usePathname();
  const isThreeColumnLayout =
    pathname.startsWith("/docs/user-guides/") ||
    pathname.startsWith("/docs/tutorials/");
  const isTwoColumnLayout = pathname.startsWith("/docs/api-reference/");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile: Show MobileNav up to md */}
      <div>
        <DynamicDocsTitle />
      </div>
      <div className="block md:hidden">
        <MobileNav />
      </div>
      {/* Medium+: Show DocsHeader */}
      <div className="hidden md:block">
        <DocsHeader />
      </div>

      {isThreeColumnLayout ? (
        <div className="flex-1 flex">
          <aside className="hidden md:block w-[280px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] bg-sideBarBackground border-r border-border/40">
            <SidebarNav />
          </aside>
          <main className="flex-1 min-w-0">
            <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
              <div className="max-w-4xl mx-auto px-6 py-6">{children}</div>
            </div>
          </main>
          {pathname === "/docs/user-guides/platform-overview" ? (
            <div></div>
          // ) : pathname === "/docs/user-guides/pricing" ? (
          //   <div></div>
          ) : (
            <aside className="hidden xl:block w-[250px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] bg-background/90 border-l border-border/40">
              <OnThisPage pathname={pathname} sections={[]} />
            </aside>
          )}
        </div>
      ) : isTwoColumnLayout ? (
        <div className="flex-1 flex">
          <aside className="hidden md:block w-[280px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] bg-sideBarBackground border-r border-border/40">
            <SidebarNav />
          </aside>
          <main className="flex-1 min-w-0">
            <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
              <div className="w-full px-6 py-6">{children}</div>
            </div>
          </main>
        </div>
      ) : (
        <main className="flex-1">
          <div className="mx-auto max-w-4xl py-6 px-8 lg:py-8">{children}</div>
        </main>
      )}
    </div>
  );
}
