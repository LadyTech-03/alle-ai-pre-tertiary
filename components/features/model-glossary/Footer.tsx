'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";


export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <footer className=" text-center py-4">
      <div className="container mx-auto">
        <p className="text-sm text-card-foreground">
          Copyright © {new Date().getFullYear()} Alle-AI. All rights reserved.
        </p>
        <div className="mt-2">
          <Link href={`/terms-of-service`} className="text-muted-foreground underline text-sm  hover:text-foreground">Terms of Service</Link>
          <span className="mx-2 text-muted-foreground">|</span>
          <Link href={`/privacy-policy`} className="text-muted-foreground underline text-sm  hover:text-foreground">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
} 