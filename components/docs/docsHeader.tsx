"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchCommand } from "@/components/features/developer/search-command";
import { usePathname, useRouter } from "next/navigation";
import SearchModal from "../docSearchModal";
interface clickData {
  name: string;
  href: string;
  pageOne: string;
}
export function DocsHeader() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const navItems: clickData[] = [
    { name: "Welcome", href: "/docs/getting-started", pageOne: "" },
    // {
    //   name: "User Guide",
    //   href: "/docs/user-guides",
    //   pageOne: "platform-overview",
    // },
    {
      name: "API Reference",
      href: "/docs/api-reference",
      pageOne: "introduction",
    },
    {
      name: "Tutorials",
      href: "https://www.youtube.com/@Alle-AI",
      pageOne: "",
    },
    { name: "Community", href: "/discord", pageOne: "" },
  ];
  const [isOpen, SetModalOpen] = useState(false);
  const toggleModal = () => {
    SetModalOpen((prev) => !prev);
  };
  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: clickData
  ) => {
    e.preventDefault();
    if (item.name === "Tutorials" || item.name === "Community") {
      // redirect
      window.open(`${item.href}`, "_blank");
    } else {
      // normal navigation ways
      router.push(`${item.href}/${item.pageOne}`);
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-sideBarBackground backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SearchModal isOpen={isOpen} onClose={toggleModal} />
      <div className="flex h-14 items-center justify-between px-8 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={
              resolvedTheme === "dark"
                ? "/svgs/logo-desktop-full.webp"
                : "/svgs/logo-desktop-dark-full.webp"
            }
            alt="Logo"
            height={32}
            width={32}
            className="h-8 w-auto"
          />
        </Link>

        {/* Navigation - centered */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={`${item.href}/${item.pageOne}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) =>
                handleNavigation(e, item)
              }
              className={`transition-colors hover:text-foreground/80 ${
                pathname.startsWith(item.href)
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side items */}
        <div className="flex items-center space-x-4">
          <SearchCommand toggleModal={toggleModal} />
          <ThemeToggle />
          <Link
            // target="_blank"
            href="/developer/workbench/chat-api"
            className="inline-flex items-center hover:bg-gray-900 justify-center dark:hover:bg-slate-200 rounded-md bg-black  dark:bg-white dark:text-black px-4 py-2 text-sm font-medium text-white transition-colors "
          >
            Workbench
          </Link>
          <Link
            href="/developer"
            className="inline-flex items-center justify-center rounded-md hover:bg-gray-900 dark:hover:bg-slate-200 bg-black  dark:bg-white dark:text-black px-4 py-2 text-sm font-medium text-white transition-colors "
          >
            API
          </Link>
        </div>
      </div>
    </header>
  );
}
