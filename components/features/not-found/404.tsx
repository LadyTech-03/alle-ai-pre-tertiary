import { motion } from "framer-motion";
import { 
  Search, 
  Compass, 
  Map, 
  MapPin, 
  Footprints,
  Trees,
  Mountain,
  Tent,
  Cloud,
  MoonStar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NotFoundPageProps {
  title?: string;
  description?: string;
  showHomeButton?: boolean;
}

export function NotFoundPage({
  title = "Page Not Found",
  description = "Oops! Looks like you've ventured into uncharted territory.",
  showHomeButton = true,
}: NotFoundPageProps) {
  const getBackgroundElements = () => [
    { Icon: Trees, size: 68, opacity: 0.1, spread: 'everywhere' },
    { Icon: Mountain, size: 82, opacity: 0.12, spread: 'everywhere' },
    { Icon: Tent, size: 42, opacity: 0.15, spread: 'center' },
    { Icon: Cloud, size: 56, opacity: 0.08, spread: 'everywhere' },
    { Icon: MoonStar, size: 48, opacity: 0.1, spread: 'center' },
    { Icon: Compass, size: 38, opacity: 0.12, spread: 'center' },
    { Icon: MapPin, size: 32, opacity: 0.15, spread: 'everywhere' },
    { Icon: Footprints, size: 36, opacity: 0.1, spread: 'everywhere' },
  ];

  const getPosition = (index: number, total: number, spread: 'center' | 'everywhere') => {
    if (spread === 'center') {
      const angle = (index / total) * Math.PI * 2;
      const radius = 15 + (index % 3) * 15;
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius
      };
    } else {
      const goldenRatio = 1.618033988749895;
      const goldenAngle = 2 * Math.PI * (1 / (goldenRatio * goldenRatio));
      const angle = index * goldenAngle;
      const radius = 40 * Math.sqrt(index / total);
      return {
        x: Math.min(Math.max(50 + Math.cos(angle) * radius, 10), 90),
        y: Math.min(Math.max(50 + Math.sin(angle) * radius, 10), 90)
      };
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {getBackgroundElements().map((element, i, array) => {
            const position = getPosition(i, array.length, element.spread as "center" | "everywhere");
            return (
              <motion.div
                key={i}
                className="absolute text-primary"
                style={{
                  top: `${position.y}%`,
                  left: `${position.x}%`,
                  opacity: element.opacity,
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [element.opacity, element.opacity * 1.5, element.opacity],
                  scale: [1, 1.1, 1],
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
              >
                <element.Icon size={element.size} className="transform-gpu" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="max-w-md w-full space-y-8 text-center relative z-10 backdrop-blur-lg bg-background/50 p-8 rounded-xl border border-primary/10 shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          {/* 404 Number */}
          <motion.div
            className="text-8xl font-bold text-primary/20 mb-4"
            animate={{ 
              scale: [1, 1.02, 1],
              rotate: [-1, 1, -1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            404
          </motion.div>

          {/* Search Icon */}
          <motion.div
            className="flex justify-center mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative"
            >
              <Search className="w-24 h-24 text-primary drop-shadow-lg" />
              <motion.div
                className="absolute inset-0 border-t-2 border-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-3xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {title}
          </motion.h1>
          
          {/* Description */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {description}
          </p>

          {/* Home Button */}
          {showHomeButton && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/">
                <Button
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg"
                  size="lg"
                >
                  <Compass className="h-4 w-4" />
                  Back to Home
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <MapPin className="h-4 w-4 ml-2" />
                  </motion.div>
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}