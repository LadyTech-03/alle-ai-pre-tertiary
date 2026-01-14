'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowUpRight, Info, MessageSquare, Home } from "lucide-react"
import Image from "next/image"
import { ModelDetails as ModelDetailsType } from "@/lib/types"
import { models } from "@/lib/models"
import { RelatedModels } from "./RelatedModels"
import Footer from "@/components/features/model-glossary/Footer"
import Navbar from "@/components/features/model-glossary/Navbar"

export default function ModelDetails({ model }: { model?: ModelDetailsType }) {
  if (!model) {
    return <div>Model not found</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar linkText="Home"/>
      <div className="container mx-auto pt-18 py-20 px-1 max-w-full md:max-w-4xl flex-grow">
        <div className="flex justify-between mb-4">
          <div onClick={() => window.history.back()} className="cursor-pointer flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back
          </div>
        </div>

        <h1 className="hidden md:flex text-xl md:text-2xl font-bold text-center mb-8">About {model.name}</h1>
        
        <div className="">
          <div className="flex items-start gap-6 mb-8 mx-1">
            <div className="w-10 h-10 md:w-24 md:h-24 rounded-lg overflow-hidden relative">
              <Image
                src={model.image}
                alt={model.name}
                fill
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold">{model.name}</h1>
                <Badge variant="secondary" className="hidden md:block">{model.version}</Badge>
              </div>
              <p className="text-muted-foreground">{model.provider}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs md:text-sm rounded-md md:rounded-full">
                  Released: {model.releaseDate}
                </Badge>
                <Badge variant="outline" className="text-xs md:text-sm rounded-md md:rounded-full capitalize">
                  Type: {model.type}
                </Badge>
              </div>
            </div>
            <Button size="sm" className="gap-2">
              Try Model <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full h-10 overflow-auto">
              <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
              <TabsTrigger value="technical" className="text-sm">Technical</TabsTrigger>
              <TabsTrigger value="performance" className="text-sm">Performance</TabsTrigger>
              <TabsTrigger value="usecases" className="text-sm">Use Cases</TabsTrigger>
              <TabsTrigger value="limitations" className="text-sm">Limitations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="bg-transparent border border-borderColorPrimary">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h3 className="font-medium mb-3">Key Capabilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {model.capabilities.map((capability, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical">
              <Card className="bg-transparent border border-borderColorPrimary">
                <CardHeader>
                  <CardTitle>Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {Object.entries(model.technicalSpecs).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <Badge variant="secondary">{value}</Badge>
                        </div>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card className="bg-transparent border border-borderColorPrimary">
                <CardHeader>
                  <CardTitle>Benchmark Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {model.benchmarks.map((benchmark, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{benchmark.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {benchmark.score}/{benchmark.maxScore}
                          </span>
                        </div>
                        <Progress className="h-2" value={(benchmark.score / benchmark.maxScore) * 100} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usecases">
              <Card className="bg-transparent border border-borderColorPrimary">
                <CardHeader>
                  <CardTitle>Use Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {model.useCases.map((useCase, index) => (
                      <div key={index} className="space-y-1">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          {useCase.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{useCase.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="limitations">
              <Card className="bg-transparent border border-borderColorPrimary">
                <CardHeader>
                  <CardTitle>Limitations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {model.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <RelatedModels 
          currentModelId={model.id}
          provider={model.provider}
          models={models}
        />
      </div>

      <Footer />
    </div>
  )
}
