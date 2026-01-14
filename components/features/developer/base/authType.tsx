import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

// just testing the auth token
const authtoken = "oahfaohe79aw8e9fha";

export default function AuthType() {
  const [authType, setAuthType] = useState("Bearer Token");
  const [isCopied, setIsCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(authtoken);
    setIsCopied(true);
  };

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Select
              value={authType}
              onValueChange={(value: string) => setAuthType(value)}
              defaultValue="Bearer Token"
            >
              <SelectTrigger className="w-[180px] border-borderColorPrimary bg-backgroundSecondary/30">
                <SelectValue placeholder="Auth Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bearer Token">Bearer Token</SelectItem>
                <SelectItem value="API Key">API Key</SelectItem>
                <SelectItem value="OAuth">OAuth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Custom Token Display */}
        <div className="flex items-center space-x-2 p-2 bg-backgroundSecondary/30 border border-borderColorPrimary rounded-md">
          <span className="text-sm text-textPrimary font-mono truncate flex-1">
            {authtoken}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-backgroundHover rounded-md transition-colors"
            title={isCopied ? "Copied!" : "Copy to clipboard"}
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-textSecondary" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
