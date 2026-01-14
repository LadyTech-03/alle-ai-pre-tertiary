'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Goal, Lightbulb, ChevronRight } from 'lucide-react';

interface SummaryContentProps {
  summary: string;
  consistencies: Array<{ point: string; models: string[] }>;
  inconsistencies: Array<{ point: string; variations: Array<{ model: string; response: string }> }>;
  finalAnswer: string;
}

export function SummaryContent({ summary, consistencies, inconsistencies, finalAnswer }: SummaryContentProps) {
  return (
    <Card className="bg-transparent border-none shadow-none p-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Combination
          </TabsTrigger>
          <TabsTrigger value="consistencies" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Consistencies
          </TabsTrigger>
          <TabsTrigger value="inconsistencies" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Inconsistencies
          </TabsTrigger>
          <TabsTrigger value="combined" className="flex items-center gap-2">
            <Goal className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-sm dark:prose-invert"
          >
            {summary}
          </motion.div>
        </TabsContent>

        <TabsContent value="consistencies" className="mt-0">
          <ScrollArea className="h-[400px] pr-4">
            {consistencies.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-4"
              >
                <Card className="p-4 bg-green-500/5 border-green-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
                    <div>
                      <p className="text-sm mb-2">{item.point}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.models.map(model => (
                          <Badge key={model} variant="outline" className="text-xs">
                            {model}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="inconsistencies" className="mt-0">
          <ScrollArea className="h-[400px] pr-4">
            {inconsistencies.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-4"
              >
                <Card className="p-4 bg-red-500/5 border-red-500/20">
                  <p className="text-sm font-medium mb-3">{item.point}</p>
                  {item.variations.map((variation, vIndex) => (
                    <div key={vIndex} className="ml-4 mb-2 last:mb-0">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 mt-1 text-muted-foreground" />
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">
                            {variation.model}
                          </Badge>
                          <p className="text-sm text-muted-foreground">{variation.response}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
              </motion.div>
            ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="combined" className="mt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-sm dark:prose-invert"
          >
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 mt-1" />
                <div className="space-y-4">
                  {finalAnswer}
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}