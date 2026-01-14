import { ExternalLink } from 'lucide-react';
import { AnchorHTMLAttributes } from 'react';

// Extend from AnchorHTMLAttributes to get proper typing for anchor elements
interface CustomLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  children: React.ReactNode;
}

export function CustomLink({ href, children, ...props }: CustomLinkProps) {
  if (!href) return <>{children}</>;

  try {
    const url = new URL(href);
    const isYouTube = url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
    const domain = url.hostname.replace('www.', '');

    return (
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1
                   text-xs font-medium 
                   rounded-full
                   border border-borderColorPrimary
                   bg-borderColorPrimary hover:bg-secondary/20
                   transition-all duration-200
                   text-secondary-foreground
                   no-underline
                   group
                   before:content-[''] after:content-['']
                   -translate-y-[5px] relative"
      >
        <span className="opacity-90">
          {children}
        </span>
        <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
      </a>
    );
  } catch {
    return <>{children}</>;
  }
}