'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Link } from 'lucide-react';
import { add } from 'date-fns';

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  pill: string;
}

interface AdCardProps {
  ads: Ad[];
}

export function AdCard({ ads }: AdCardProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex gap-3 mt-6">
      {ads.map((ad) => (
        <motion.div
          key={ad.id}
          className="relative"
          onMouseEnter={() => setHoveredId(ad.id)}
          onMouseLeave={() => setHoveredId(null)}
          initial={false}
        >
          {/* Hover Card */}
          <AnimatePresence>
            {hoveredId === ad.id && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: 10, 
                  scale: 0.95,
                  transition: { duration: 0.15 }
                }}
                className="absolute bottom-full left-0 mb-2 w-[300px] z-[100]"
              >
                <a
                href={ad.link} 
                target="_blank" 
                rel="noopener noreferrer"
                >
                  <Card className="p-3 w-full shadow-lg border border-borderColorPrimary bg-backgroundSecondary cursor-pointer">
                    <div className="flex gap-3">
                      {/* Image with gradient overlay */}
                      <div className="relative max-w-20 max-h-20 rounded-md overflow-hidden ring-2 ring-border/50">
                        <Image
                          src={ad.imageUrl}
                          alt={ad.title}
                          width={100}
                          height={100}
                          className="hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      {/* Content with enhanced typography */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold leading-tight">
                            {ad.title}
                          </h4>
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {/* {ad.description} */}
                          {ad.description.length > 20 ? ad.description.substring(0,20) + '...' : ad.description}

                        </p>
                      </div>
                    </div>
                  </Card>
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pill with hover effects */}
          <a 
            href={ad.link} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <motion.div
              className={`
                rounded-full px-4 py-1.5 text-xs font-medium
                flex items-center gap-2 cursor-pointer
                border border-border/50 backdrop-blur-sm
                transition-all duration-200 ease-in-out border-borderColorPrimary
                ${hoveredId === ad.id 
                  ? 'bg-secondary/40 text-foreground shadow-lg scale-105' 
                  : 'bg-secondary/10 text-muted-foreground hover:bg-secondary/20'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{ad.pill}</span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </motion.div>
          </a>
        </motion.div>
      ))}
    </div>
  );
}