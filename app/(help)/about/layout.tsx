"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Facebook, Twitter, Youtube, Instagram, Mail } from "lucide-react";
import { toast } from "sonner"

const footerLinks = [
  // {
  //   title: "Product",
  //   links: [
  //     { name: "Features", href: "/" },
  //     { name: "Pricing", href: "/" },
  //     { name: "API", href: "/alle-ai-api" },
  //   ],
  // },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "https://alle-ai.com" },
      // { name: "Careers", href: "hub/careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/faq" },
      // { name: "Community", href: "/about/community" },
      // { name: "Contact Us", href: "/" },
    ],
  },
];

const navItems = [
  {
    title: "Careers",
    href: "/about/careers",
  },
  {
    title: "Help Center",
    href: "/faq",
  },
];
export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      {/* header */}
      <header className="w-full  px-4 sm:px-2 lg:px-10 py-4 bg-white dark:bg-zinc-800 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href={"/faq"}>
            <Image
              src={
                resolvedTheme === "dark"
                  ? "/svgs/logo-desktop-full.webp"
                  : "/svgs/logo-desktop-dark-full.webp"
              }
              alt="all-ai"
              height={100}
              width={100}
              className="h-auto"
            />
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors duration-300 font-medium"
              >
                {item.title}
              </Link>
            ))}
            <ThemeToggle />
            <Link
              href={"/"}
              className="p-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:hover:shadow-lg transition-transform duration-300 transform hover:scale-105 font-semibold"
            >
              Try Alle-AI
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 ">
        {children}
      </main>
      {/* footer */}
      <footer className="bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center">
                <Image
                  src={
                    resolvedTheme === "dark"
                      ? "/svgs/logo-desktop-full.webp"
                      : "/svgs/logo-desktop-dark-full.webp"
                  }
                  alt="Alle-AI Logo"
                  width={150}
                  height={150}
                  className="mr-2"
                />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Empowering creativity and innovation through advanced AI
                capabilities.
              </p>
              <div className="flex space-x-4">
                <Mail className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  contact@alle-ai.com
                </span>
              </div>
            </div>

            {/* Links Sections */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4 text-zinc-900 dark:text-white">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        target="_blank"
                        href={link.href}
                        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors duration-200 text-sm"
                        rel="noopener noreferrer"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Download Section */}
          <div className="border-t border-zinc-100 dark:border-zinc-700 pt-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link href="#"  className="inline-block"
              onClick={(e) => {
                e.preventDefault();
                toast.info('Alle-AI will be available on playstore soon!')
              }}
              >
                <div className="flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg hover:opacity-90 transition duration-300">
                  <Image
                    width={40}
                    height={40}
                    src={"/svgs/playstore.png"}
                    alt="alle-ai"
                  ></Image>
                  <div className="flex flex-col">
                    <span className="text-xs">Get it on</span>
                    <span className="text-sm font-semibold">Play Store</span>
                  </div>
                </div>
              </Link>
              <Link href="#" className="inline-block">
                <div className="flex items-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-lg hover:opacity-90 transition duration-300">
                  <Image
                    width={40}
                    height={40}
                    src={
                      resolvedTheme === "dark"
                        ? "/svgs/appleblack.png"
                        : "/svgs/applewhitecolor.png"
                    }
                    alt="alle-ai"
                  ></Image>
                  <div className="flex flex-col">
                    <span className="text-xs">Download on the</span>
                    <span className="text-sm font-semibold">App Store</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex justify-center space-x-6 mb-8">
              {[
                {
                  icon: Facebook,
                  href: "https://web.facebook.com/AlleAIplatform?_rdc=1&_rdr",
                  hoverColor: "hover:text-blue-400",
                },
                { icon: Twitter, href: "https://x.com/AlleAIplatform", hoverColor: "hover:text-blue-400" },
                { icon: Youtube, href: "https://www.youtube.com/channel/UCa5wa1T7efaWCjMaqwZuiPQ", hoverColor: "hover:text-red-400" },
                // {
                //   icon: Instagram,
                //   href: "#",
                //   hoverColor: "hover:text-pink-400",
                // },
              ].map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className={`text-zinc-600 dark:text-zinc-400 ${social.hoverColor} transition-colors duration-200`}
                >
                  <social.icon className="w-6 h-6" />
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-zinc-100 dark:border-zinc-700 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              &copy; {new Date().getFullYear()} Alle-AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link
                href="/privacy-policy"
                className="hover:text-zinc-900 dark:hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-zinc-900 dark:hover:text-white transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
