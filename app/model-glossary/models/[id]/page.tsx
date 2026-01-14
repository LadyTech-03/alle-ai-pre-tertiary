import { models } from '@/lib/models';
import ModelDetails from '@/components/features/model-glossary/ModelDetails';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const model = models.find((m) => m.id === resolvedParams.id);
  return {
    title: model ? `${model.name} | Alle-AI Model Glossary` : 'Model Not Found',
    description: model?.description || 'Model details not found',
  };
}

export function generateStaticParams() {
  return models.map((model) => ({
    id: model.id,
  }));
}

export default async function ModelPage({ params }: PageProps) {
  const resolvedParams = await params;
  const model = models.find((m) => m.id === resolvedParams.id);
  return <ModelDetails model={model} />;
}