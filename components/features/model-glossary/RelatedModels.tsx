import { ModelDetails } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

interface RelatedModelsProps {
  currentModelId: string
  provider: string
  models: ModelDetails[]
}

export function RelatedModels({ currentModelId, provider, models }: RelatedModelsProps) {
  const relatedModels = models
    .filter(model => model.provider === provider && model.id !== currentModelId)
    .slice(0, 4)

  if (relatedModels.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">Other Models from {provider}</h2>
      <div className="grid grid-cols-2 max-[500px]:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedModels.map((model) => (
          <Link key={model.id} href={`/model-glossary/models/${model.id}`}>
            <div className="flex items-center gap-2 text-center p-4 rounded-lg border border-borderColorPrimary bg-transparent hover:bg-muted/90 transition-colors">
              <div className="w-10 h-10 rounded-lg overflow-hidden relative">
                <Image
                  src={model.image}
                  alt={model.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col items-start">
                <h3 className="font-medium text-sm text-foreground">{model.name}</h3>
                <p className="text-xs text-muted-foreground">{model.provider}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
