import { notFound } from "next/navigation";
import { helpCategories } from "@/app/(help)/faq/constants";
import { CategoryKeys } from "@/lib/types";
import { CategoryContent } from "./categoryContent";

export default async function CategoryPage({ 
  params 
}: { 
  params: Promise<{ category: CategoryKeys }> 
}) {
  const resolvedParams = await params;
  const category = helpCategories[resolvedParams.category];
  
  if (!category) {
    notFound();
  }

  return <CategoryContent 
    category={category} 
    categorySlug={resolvedParams.category} 
  />;
}