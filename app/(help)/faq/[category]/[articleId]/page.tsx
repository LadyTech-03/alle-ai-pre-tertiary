import { notFound } from "next/navigation";
import { helpCategories } from "@/app/(help)/faq/constants";
import { CategoryKeys } from "@/lib/types";
import { ArticleContent } from "./articleContent";

export default async function ArticlePage({ 
  params 
}: { 
  params: Promise<{ category: CategoryKeys; articleId: string }> 
}) {
  const resolvedParams = await params;
  const category = helpCategories[resolvedParams.category];
  if (!category) notFound();

  // Find article across all sections
  const article = category.sections
    .flatMap(section => section.articles)
    .find(article => article.id === resolvedParams.articleId);
    
  if (!article) notFound();

  return <ArticleContent 
    category={category} 
    article={article} 
    categorySlug={resolvedParams.category}
  />;
}