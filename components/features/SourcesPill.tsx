import { Source } from '@/lib/types';
import Image from 'next/image';
  
  interface SourcesPillProps {
    onClick: () => void;
    sources: Source[];
  }
  
  export function SourcesPill({ onClick, sources }: SourcesPillProps){
    // Limit to showing max 4 source images
    const displaySources = sources.slice(0, 3);
    // console.log(sources);
    // const remainingCount = Math.max(0, sources.length - 4);
  
    return (
      <div 
        onClick={onClick}
        className="relative inline-flex items-center gap-2 px-2 py-1
                  text-xs font-medium group
                  rounded-full cursor-pointer
                  border border-borderColorPrimary
                  overflow-hidden hover:bg-secondary/10
                  transition-colors duration-200"
      >
        {/* Source Images Stack */}
        <span className="relative z-10 transition-colors duration-300 group-hover:text-secondary-foreground">
          Sources
        </span>
        
        <div className="flex -space-x-2 relative">
          {displaySources.map((source, index) => (
            <div
              key={index}
              className="relative w-4 h-4 rounded-full border border-background
                        transition-transform duration-200
                        hover:translate-y-[-2px]"
              style={{
                zIndex: displaySources.length - index
              }}
            >
              <Image
                src={source.favicon || '/icons/default.webp'}
                alt={source.title}
                width={16}
                height={16}
                className="rounded-full object-cover"
              />
            </div>
          ))}
          {/* {remainingCount > 0 && (
            <div 
              className="relative w-4 h-4 rounded-full bg-secondary/30
                         flex items-center justify-center
                         text-[10px] font-medium
                         border border-background
                         ring-2 ring-background"
            >
              +{remainingCount}
            </div>
          )} */}
        </div>
        
      </div>
    );
  };
