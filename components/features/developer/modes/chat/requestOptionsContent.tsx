import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { PopoverContent } from "@/components/ui/popover";

interface SearchSettings {
  webSearch: boolean;
  combination: boolean;
  comparison: boolean;
  fileUpload: {
    enabled: boolean;
    type: "pdf" | "image" | "docx" | "text" | "code" | "document" | null;
  };
}

interface RequestOptionsContentProps {
  searchSettings: SearchSettings;
  setSearchSettings: React.Dispatch<React.SetStateAction<SearchSettings>>;
  temperature: number;
  setTemperature: React.Dispatch<React.SetStateAction<number>>;
  maxTokens: number;
  setMaxTokens: React.Dispatch<React.SetStateAction<number>>;
  chatMode: "search" | "completions" | "combination" | "summary"|"comparison";
}

const RequestOptionsContent: React.FC<RequestOptionsContentProps> = ({
  searchSettings,
  setSearchSettings,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  chatMode,
}) => (
  <PopoverContent className="w-80 bg-backgroundSecondary border-borderColorPrimary">
    <ScrollArea className="h-[300px] pr-3">
      <Card className="border-borderColorPrimary bg-transparent space-y-4 p-4">
        <div className="flex items-center justify-between p-2 hover:bg-backgroundSecondary/30 rounded-lg transition-colors">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Web Search</label>
            <p className="text-xs text-muted-foreground">
              Enable web search capability
            </p>
          </div>
          <Switch
            checked={chatMode === "search" ? true : searchSettings.webSearch}
            onCheckedChange={(checked: boolean) =>
              setSearchSettings((prev) => ({ ...prev, webSearch: checked }))
            }
            disabled={chatMode === "search"}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {chatMode === "completions" && (
          <>
            <div className="flex items-center justify-between p-2 hover:bg-backgroundSecondary/30 rounded-lg transition-colors">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Combination</label>
                <p className="text-xs text-muted-foreground">
                  Combine outputs from all models
                </p>
              </div>
              <Switch
                checked={searchSettings.combination}
                onCheckedChange={(checked: boolean) =>
                  setSearchSettings((prev) => ({
                    ...prev,
                    combination: checked,
                  }))
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex items-center justify-between p-2 hover:bg-backgroundSecondary/30 rounded-lg transition-colors">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Comparison</label>
                <p className="text-xs text-muted-foreground">
                  Get a comparison from all models
                </p>
              </div>
              <Switch
                checked={searchSettings.comparison}
                onCheckedChange={(checked: boolean) =>
                  setSearchSettings((prev) => ({ ...prev, comparison: checked }))
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </>
        )}

        <h3 className="font-medium">Model Parameters</h3>
        <div className="space-y-4 p-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Temperature</label>
              <span className="text-xs text-muted-foreground">
                {temperature}
              </span>
            </div>
            <Slider
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Max Tokens</label>
              <span className="text-xs text-muted-foreground">{maxTokens}</span>
            </div>
            <Slider
              value={[maxTokens]}
              onValueChange={(value) => setMaxTokens(value[0])}
              max={4000}
              step={100}
              className="w-full"
            />
          </div>
        </div>
      </Card>
    </ScrollArea>
  </PopoverContent>
);

export default RequestOptionsContent;
