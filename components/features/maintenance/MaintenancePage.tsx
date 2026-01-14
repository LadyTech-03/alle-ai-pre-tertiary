import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, Clock, RefreshCw, Wrench, Server, ArrowRight, 
  Cog, Shield, Wifi, WifiOff, Hammer , Settings, AlertTriangle, 
  Database, HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";

interface MaintenancePageProps {
  title?: string;
  description?: string;
  estimatedTime?: string;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
  type?: 'maintenance' | 'error' | 'outage';
}

export function MaintenancePage({
  title = "System Maintenance",
  description = "We're currently performing some maintenance to improve your experience. We'll be back shortly!",
  estimatedTime = "soon",
  showRefreshButton = true,
  onRefresh,
  type = 'maintenance'
}: MaintenancePageProps) {
  const [dots, setDots] = useState('');
  const [timeLeft, setTimeLeft] = useState(estimatedTime);
  const [isHovered, setIsHovered] = useState(false);

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const icons = {
    maintenance: Wrench,
    error: AlertCircle,
    outage: Server
  };

  const Icon = icons[type];

  const getPosition = (index: number, total: number, spread: 'center' | 'everywhere' = 'center') => {
    if (spread === 'center') {
      // Create a spiral-like pattern around the center
      const angle = (index / total) * Math.PI * 2;
      const radius = 15 + (index % 3) * 15; // Creates 3 circular layers
      
      return {
        x: 50 + Math.cos(angle) * radius, 
        y: 50 + Math.sin(angle) * radius
      };
    } else {
      // Create an organic spread using golden ratio
      const goldenRatio = 1.618033988749895;
      const goldenAngle = 2 * Math.PI * (1 / (goldenRatio * goldenRatio));
      
      const angle = index * goldenAngle;
      const radius = 40 * Math.sqrt(index / total); // Gradually increases radius
      
      return {
        x: Math.min(Math.max(50 + Math.cos(angle) * radius, 10), 90),
        y: Math.min(Math.max(50 + Math.sin(angle) * radius, 10), 90)
      };
    }
  };

  const getBackgroundElements = (type: string) => {
    switch (type) {
      case 'maintenance':
        return [
          { Icon: Cog, size: 68, rotationSpeed: 15, opacity: 0.15, spread: 'center' },
          { Icon: Settings, size: 76, rotationSpeed: -20, opacity: 0.12, spread: 'center' },
          { Icon: Hammer, size: 72, rotationSpeed: 18, opacity: 0.14, spread: 'everywhere' },
          { Icon: Wrench, size: 70, rotationSpeed: -15, opacity: 0.13, spread: 'everywhere' },
          { Icon: Database, size: 74, rotationSpeed: 12, opacity: 0.15, spread: 'center' },
          { Icon: Cog, size: 62, rotationSpeed: -12, opacity: 0.12, spread: 'everywhere' },
          { Icon: Settings, size: 78, rotationSpeed: 22, opacity: 0.14, spread: 'center' },
          { Icon: Wrench, size: 66, rotationSpeed: -18, opacity: 0.13, spread: 'everywhere' }
        ];
      case 'error':
        return [
          { Icon: AlertTriangle, size: 72, rotationSpeed: 8, opacity: 0.15, spread: 'center' },
          { Icon: AlertCircle, size: 78, rotationSpeed: -8, opacity: 0.13, spread: 'center' },
          { Icon: Shield, size: 74, rotationSpeed: 10, opacity: 0.14, spread: 'everywhere' },
          { Icon: HardDrive, size: 70, rotationSpeed: -10, opacity: 0.12, spread: 'everywhere' },
          { Icon: AlertTriangle, size: 68, rotationSpeed: -12, opacity: 0.13, spread: 'center' },
          { Icon: Shield, size: 76, rotationSpeed: 12, opacity: 0.15, spread: 'everywhere' },
          { Icon: AlertCircle, size: 64, rotationSpeed: -8, opacity: 0.14, spread: 'center' }
        ];
      case 'outage':
        return [
          { Icon: Wifi, size: 74, rotationSpeed: 10, opacity: 0.15, spread: 'center' },
          { Icon: WifiOff, size: 72, rotationSpeed: -10, opacity: 0.13, spread: 'center' },
          { Icon: Server, size: 78, rotationSpeed: 12, opacity: 0.14, spread: 'everywhere' },
          { Icon: Database, size: 70, rotationSpeed: -12, opacity: 0.12, spread: 'everywhere' },
          { Icon: Wifi, size: 68, rotationSpeed: -8, opacity: 0.13, spread: 'center' },
          { Icon: Server, size: 76, rotationSpeed: 8, opacity: 0.15, spread: 'everywhere' },
          { Icon: Database, size: 66, rotationSpeed: -10, opacity: 0.14, spread: 'center' }
        ];
      default:
        return [];
    }
  };

  const backgroundElements = (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full">
        {getBackgroundElements(type).map((element, i, array) => {
          const position = getPosition(i, array.length, element.spread as "center" | "everywhere" | undefined);
          return (
            <motion.div
              key={i}
              className="absolute text-primary"
              style={{
                top: `${position.y}%`,
                left: `${position.x}%`,
                opacity: element.opacity,
              }}
              initial={{ 
                opacity: 0, 
                scale: 0.5,
                rotate: 0 
              }}
              animate={{
                opacity: [
                  element.opacity, 
                  element.opacity * 1.5, 
                  element.opacity
                ],
                scale: [1, 1.1, 1],
                rotate: element.rotationSpeed ? 360 * Math.sign(element.rotationSpeed) : 0,
                y: [0, -20, 0],
              }}
              transition={{
                duration: Math.abs(element.rotationSpeed) || 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
                y: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <element.Icon 
                size={element.size} 
                className="transform-gpu"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const mainIconAnimation = {
    maintenance: {
      animate: {
        rotate: 360,
        scale: isHovered ? 1.1 : 1,
      },
      transition: {
        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        scale: { duration: 0.2 }
      }
    },
    error: {
      animate: {
        scale: [1, 1.1, 1],
        rotate: [-5, 5, -5],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
      }
    },
    outage: {
      animate: {
        opacity: [1, 0.5, 1],
        scale: [1, 0.95, 1],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {backgroundElements}
      
      <motion.div 
        className="max-w-md w-full space-y-8 text-center relative z-10 backdrop-blur-lg bg-background/50 p-8 rounded-xl border border-primary/10 shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <motion.div
            className="flex justify-center mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              {...mainIconAnimation[type]}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="relative"
            >
              <Icon className="w-24 h-24 text-primary drop-shadow-lg" />
              {type === 'maintenance' && (
                <motion.div
                  className="absolute inset-0 border-t-2 border-primary rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>
          </motion.div>

          <motion.h1 
            className="text-3xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {title}{dots}
          </motion.h1>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {description}
          </p>

          <Alert className="mb-6 border-primary/20 shadow-lg">
            <AlertTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 animate-pulse" />
              Estimated Time
            </AlertTitle>
            <AlertDescription className="mt-2 flex gap-1">
              We expect to be back
              <span className="font-semibold text-primary">{timeLeft}</span>
            </AlertDescription>
          </Alert>

          <AnimatePresence>
            {showRefreshButton && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onRefresh}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}