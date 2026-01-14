'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Search, Info } from "lucide-react"
import { models } from "@/lib/models"
import Image from "next/image"
import Footer from "@/components/features/model-glossary/Footer"
import Navbar from "./Navbar"

export default function ModelGlossary() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAllChat, setShowAllChat] = useState(false)
  const [showAllImage, setShowAllImage] = useState(false)
  const [showAllAudio, setShowAllAudio] = useState(false)
  const [showAllVideo, setShowAllVideo] = useState(false)

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const chatModels = filteredModels.filter(model => model.type === "chat")
  const imageModels = filteredModels.filter(model => model.type === "image")
  const audioModels = filteredModels.filter(model => model.type === "audio")
  const videoModels = filteredModels.filter(model => model.type === "video")

  const displayedChatModels = showAllChat ? chatModels : chatModels.slice(0, 6)
  const displayedImageModels = showAllImage ? imageModels : imageModels.slice(0, 6)
  const displayedAudioModels = showAllAudio ? audioModels : audioModels.slice(0, 6)
  const displayedVideoModels = showAllVideo ? videoModels : videoModels.slice(0, 6)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar linkText="Blog" />
      <div className="container pt-16 mx-auto py-6 px-4 max-w-6xl flex-grow">
        <h1 className="text-2xl font-bold text-center mb-8">MODEL GLOSSARY</h1>
        
        <div className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-10 focus-visible:outline-none focus:border-2 border-borderColorPrimary"
            placeholder="Find model..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-12">
          {/* Chat Models Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4">All Chat Models</h2>
            {displayedChatModels.length === 0 && searchQuery && (
              // <div className="flex items-center justify-center text-red-500">
              //   <Info className="w-5 h-5 mr-2" />
              //   <span>No matches found. The model you&apos;re looking for may not be available under this category or on Alle-AI.</span>
              // </div>
              ''
            )}
            <div className="grid grid-cols-2 max-[500px]:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedChatModels.map((model) => (
                <Link key={model.id} href={`/model-glossary/models/${model.id}`}>
                  <Card className="cursor-pointer bg-transparent border border-borderColorPrimary hover:bg-accent hover:text-accent-foreground transition-colors">
                    <CardHeader className="flex flex-row items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                        <Image
                          src={model.image}
                          alt={model.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xs text-foreground">{model.name}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">{model.provider}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
            {chatModels.length > 6 && (
              <button
                onClick={() => setShowAllChat(!showAllChat)}
                className="mt-4 text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                {showAllChat ? "Show Less" : `View ${chatModels.length - 6} More`}
              </button>
            )}
          </section>

          {/* Image Models Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4">All Image Models</h2>
            {displayedImageModels.length === 0 && searchQuery && (
              // <div className="flex items-center justify-center text-red-500">
              //   <Info className="w-5 h-5 mr-2" />
              //   <span>No matches found. The model you&apos;re looking for may not be available under this category or on Alle-AI </span>
              // </div>
              ''
            )}
            <div className="grid grid-cols-2 max-[500px]:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedImageModels.map((model) => (
                <Link key={model.id} href={`/model-glossary/models/${model.id}`}>
                  <Card className="cursor-pointer bg-transparent border border-borderColorPrimary hover:bg-accent hover:text-accent-foreground transition-colors">
                    <CardHeader className="flex flex-row items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                        <Image
                          src={model.image}
                          alt={model.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xs">{model.name}</CardTitle>
                        <CardDescription className="text-xs">{model.provider}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
            {imageModels.length > 6 && (
              <button
                onClick={() => setShowAllImage(!showAllImage)}
                className="mt-4 text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                {showAllImage ? "Show Less" : `View ${imageModels.length - 6} More`}
              </button>
            )}
          </section>


          {/* Audio Models Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4">All Audio Models</h2>
            {displayedAudioModels.length === 0 && searchQuery && (
              // <div className="flex items-center justify-center text-red-500">
              //   <Info className="w-5 h-5 mr-2" />
              //   <span>No matches found. The model you&apos;re looking for may not be available under this category or on Alle-AI </span>
              // </div>
              ''
            )}
            <div className="grid grid-cols-2 max-[500px]:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedAudioModels.map((model) => (
                <Link key={model.id} href={`/model-glossary/models/${model.id}`}>
                  <Card className="cursor-pointer bg-transparent border border-borderColorPrimary hover:bg-accent hover:text-accent-foreground transition-colors">
                    <CardHeader className="flex flex-row items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                        <Image
                          src={model.image}
                          alt={model.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xs">{model.name}</CardTitle>
                        <CardDescription className="text-xs">{model.provider}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
            {audioModels.length > 6 && (
              <button
                onClick={() => setShowAllImage(!showAllAudio)}
                className="mt-4 text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                {showAllAudio ? "Show Less" : `View ${audioModels.length - 6} More`}
              </button>
            )}
          </section>


          {/* Video Models Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4">All Video Models</h2>
            {displayedVideoModels.length === 0 && searchQuery && (
              // <div className="flex items-center justify-center text-red-500">
              //   <Info className="w-5 h-5 mr-2" />
              //   <span>No matches found. The model you&apos;re looking for may not be available under this category or on Alle-AI </span>
              // </div>
              ''
            )}
            <div className="grid grid-cols-2 max-[500px]:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedVideoModels.map((model) => (
                <Link key={model.id} href={`/model-glossary/models/${model.id}`}>
                  <Card className="cursor-pointer bg-transparent border border-borderColorPrimary hover:bg-accent hover:text-accent-foreground transition-colors">
                    <CardHeader className="flex flex-row items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                        <Image
                          src={model.image}
                          alt={model.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xs">{model.name}</CardTitle>
                        <CardDescription className="text-xs">{model.provider}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
            {videoModels.length > 6 && (
              <button
                onClick={() => setShowAllImage(!showAllVideo)}
                className="mt-4 text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                {showAllVideo ? "Show Less" : `View ${videoModels.length - 6} More`}
              </button>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}