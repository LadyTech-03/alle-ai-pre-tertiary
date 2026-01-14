import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MarkdownImageProps {
  src?: string;
  alt?: string;
  className?: string;
  showOverlay?: boolean;
  overlayContent?: string;
}

export function MarkdownImage({ 
  src, 
  alt, 
  className,
  showOverlay,
  overlayContent 
}: MarkdownImageProps) {
  if (!src) return null;

  return (
    <span 
      className={cn(
        "group relative block overflow-hidden rounded-md bg-background/50 backdrop-blur-sm transition-all hover:shadow-md",
        className
      )}
    >
      <span className="relative aspect-square block overflow-hidden">
        <Image
          src={src}
          alt={alt || ''}
          fill
          className={cn(
            "object-cover transition-all duration-300",
            !showOverlay && "group-hover:scale-105"
          )}
          sizes="(max-width: 768px) 100px, 150px"
        />
        
        {/* Show alt text overlay */}
        {alt && !showOverlay && (
          <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <span className="absolute bottom-0 left-0 right-0 p-2 text-xs text-white/90 line-clamp-2">
              {alt}
            </span>
          </span>
        )}

        {/* Show +N overlay */}
        {showOverlay && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity">
            <span className="text-2xl font-bold text-white">
              {overlayContent}
            </span>
          </span>
        )}
      </span>
    </span>
  );
}