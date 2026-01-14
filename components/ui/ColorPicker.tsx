import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";

interface ColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (color: string) => void;
  initialColor?: string;
}

// Convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }

  return [r * 255, g * 255, b * 255];
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Convert hex to RGB
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

// Calculate position on circle from color
function colorToPosition(color: string, radius: number): [number, number] {
  const rgb = hexToRgb(color);
  if (!rgb) return [radius, 0];
  
  // Very simplified conversion - just for demonstration
  // This doesn't account for saturation properly
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  
  // Extremely simplified hue calculation
  let h = 0;
  if (r >= g && r >= b) h = (g - b) / (Math.max(r, g, b) - Math.min(r, g, b)) * 60;
  else if (g >= r && g >= b) h = (2 + (b - r) / (Math.max(r, g, b) - Math.min(r, g, b))) * 60;
  else h = (4 + (r - g) / (Math.max(r, g, b) - Math.min(r, g, b))) * 60;
  
  if (h < 0) h += 360;
  
  const angleInRadians = (h * Math.PI) / 180;
  return [
    radius * Math.cos(angleInRadians),
    radius * Math.sin(angleInRadians)
  ];
}

export function ColorPicker({
  isOpen,
  onClose,
  onColorSelect,
  initialColor = "#FFD700",
}: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [copied, setCopied] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleConfirm = () => {
    onColorSelect(selectedColor);
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!pickerRef.current) return;
    isDragging.current = true;
    updateColorFromEvent(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !pickerRef.current) return;
    updateColorFromEvent(e);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const updateColorFromEvent = (e: React.MouseEvent) => {
    if (!pickerRef.current) return;
    
    const rect = pickerRef.current.getBoundingClientRect();
    
    // Calculate position within the picker
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    // Convert position to HSV
    const h = x / rect.width;
    const s = 1.0;
    const v = 1.0 - (y / rect.height);
    
    // Convert to RGB then Hex
    const [r, g, b] = hsvToRgb(h, s, v);
    setSelectedColor(rgbToHex(r, g, b));
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-xl">Choose Project Color </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 space-y-8">
          <div className="flex gap-6 items-center">
            {/* Rectangular color picker */}
            <div 
              ref={pickerRef} 
              className="relative w-[240px] h-[180px] rounded-xl overflow-hidden shadow-lg cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
            >
              {/* Horizontal gradient - hue */}
              <div 
                className="absolute inset-0"
                style={{ 
                  background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                }}
              />
              
              {/* Vertical gradient - saturation and value */}
              <div 
                className="absolute inset-0"
                style={{ 
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(0,0,0,1) 100%)',
                }}
              />
              
              {/* Color selector dot */}
              {/* <div 
                className="absolute w-5 h-5 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2 shadow-md pointer-events-none"
                style={{ 
                  backgroundColor: selectedColor,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                  // Position would ideally be calculated from the color's HSV values, simplified here
                  top: '50%',
                  left: '50%',
                }}
              /> */}
            </div>
            
            {/* Color preview */}
            <div className="flex flex-col items-center space-y-2">
              <div 
                className="w-16 h-16 rounded-lg border-4 border-white dark:border-gray-800 shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: selectedColor }}
              />
              
              <div className="flex gap-1 items-center bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-sm">
                <div className="text-sm font-mono font-semibold">{selectedColor}</div>
                <button 
                  onClick={copyToClipboard} 
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Copy color code"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="w-full px-4">
            {/* Preset colors */}
            <div className="grid grid-cols-8 gap-2">
              {['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', 
                '#0000ff', '#8000ff', '#ff00ff', '#ff0080', '#ffffff', '#cccccc', '#888888', '#444444'
              ].map((color, index) => (
                <button
                  key={index}
                  className="w-7 h-7 rounded-md border border-gray-300 dark:border-gray-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="rounded-full px-6"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            className="rounded-full px-6"
            style={{ 
              backgroundColor: selectedColor,
              color: parseInt(selectedColor.replace("#", ""), 16) > 0xffffff / 1.5 ? 'black' : 'white'
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 