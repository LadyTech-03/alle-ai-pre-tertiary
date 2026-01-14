import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";

interface FooterProps {
  className?: string;
  nonDev?: boolean;
}

interface FooterLink {
  label: string;
  href: string;
  icon: string;
  isMail?: boolean;
  email?: string;
}

const footerLinks: FooterLink[] = [
  {
    label: "Need help? Contact Support.",
    href: "#",
    icon: "?",
    isMail: true,
    email: "contact@alle-ai.com",
  },
  {
    label: "Join our early access program.",
    href: "#",
    icon: "🚀",
    isMail: false,
  },
  {
    label: "Check out our changelog.",
    href: "/docs/api-reference/changelogs",
    icon: "📋",
    isMail: false,
  },
  {
    label: "Questions? Contact Sales.",
    href: "#",
    icon: "?",
    isMail: true,
    email: "contact@alle-ai.com",
  },
];

const DocsFooter: React.FC<FooterProps> = ({ className = "", nonDev }) => {
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmailInput(email);
    
    if (email.length > 0) {
      setIsEmailValid(validateEmail(email));
    } else {
      setIsEmailValid(null);
    }
  };

  // Placeholder function for signup logic
  const handleSignup = () => {
    if (!validateEmail(emailInput)) return;

    setIsLoading(true);

    // Simulate API call with setTimeout
    setTimeout(() => {
      toast.success("You're in! We'll keep you posted with the latest dev news and tools.", {
        duration: 5000,
      });
      setIsLoading(false);
      setEmailInput("");
      setIsEmailValid(null);
    }, 1500);
  };

  // Function to handle link clicks
  const handleLinkClick = (link: FooterLink) => {
    if (link.isMail && link.email) {
      window.location.href = `mailto:${link.email}`;
    }
  };

  return (
    <footer
      className={`border-t border-gray-200 dark:border-zinc-800 py-8 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-around items-start gap-3">
          {/* Left Side: Links */}
          <div className="flex flex-col gap-3">
            {footerLinks.map((link, index) =>
              link.isMail ? (
                <a
                  key={index}
                  href={`mailto:${link.email}`}
                  onClick={() => handleLinkClick(link)}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full border border-gray-400 dark:border-gray-600 flex items-center justify-center">
                    <span className="text-xs">{link.icon}</span>
                  </span>
                  {link.label}
                </a>
              ) : (
                <Link
                  key={index}
                  href={link.href}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span className="w-5 h-5 rounded-full border border-gray-400 dark:border-gray-600 flex items-center justify-center">
                    <span className="text-xs">{link.icon}</span>
                  </span>
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right Side: Subscription Form */}
          <div className="w-full md:w-1/3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {nonDev
                ? "Sign up for news and updates"
                : "Sign up for developer updates:"}
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={emailInput}
                onChange={handleEmailChange}
                className={`flex-1 px-3 py-2 border rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors duration-200
                  ${
                    isEmailValid === false
                      ? "border-red-500 focus:ring-red-500"
                      : isEmailValid === true
                      ? "border-green-500 focus:ring-green-500"
                      : "border-gray-300 dark:border-zinc-700 focus:ring-blue-500"
                  }
                `}
              />
              <button
                onClick={handleSignup}
                disabled={!isEmailValid || isLoading}
                className={`px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md text-gray-600 dark:text-gray-400 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 min-w-[80px] flex items-center justify-center
                  ${(!isEmailValid || isLoading) ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isLoading ? (
                  <ClipLoader size={16} color="currentColor" />
                ) : (
                  "Sign up"
                )}
              </button>
            </div>
            {isEmailValid === false && emailInput.length > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid email address
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              You can unsubscribe at any time.{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Read our privacy policy.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DocsFooter;
