// @ts-nocheck
"use client";
import {
  ChevronRight,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HelpCategory, Article } from "@/lib/types";
import { useEffect, useState } from "react";
import { IconComponent } from "@/components/IconComponent";
import DynamicFaq from "@/components/faq/DynamicFaq";
import { languages } from "@/lib/constants";
import { toast } from "sonner"
import CustomHead from "@/components/faq/CustomHead";
type FeedbackType = "helpful" | "not-helpful" | null;

export function ArticleContent({
  category,
  article,
  categorySlug,
}: {
  category: HelpCategory;
  article: Article;
  categorySlug: string;
}) {
  const [feedbackGiven, setFeedbackGiven] = useState<FeedbackType>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  useEffect(() => {
    // alert(article.id)
    if (selectedLanguage.code !== "en") {
      toast.info('this language translation will be available soon')
    }
  }, [selectedLanguage.code, toast]);

  const handleFeedback = (type: FeedbackType) => {
    setFeedbackGiven(type);
  };

  // Get all articles from all sections for related articles
  const allArticles = category.sections.flatMap((section) => section.articles);

  return (
    <>
      <CustomHead title={`${article.title} | Alle-AI`} />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/5 to-background border-b">
          <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Back to Category */}
            <Link
              href={`/faq/${categorySlug}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to {category.title}
            </Link>

            {/* Article Header */}
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {article.description}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{article.readingTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconComponent
                      name={category.iconName}
                      className="h-4 w-4"
                    />
                    <span>{category.title}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <article className="prose prose-neutral dark:prose-invert max-w-none">
            {/* dynamically get article content  */}
            <div className="space-y-8">
              <DynamicFaq faqName={`${article.id}`} />
            </div>
            {/* Feedback Section */}
            <div className="mt-10 pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">
                Was this article helpful?
              </h3>
              <div className="flex items-center gap-4">
                <Button
                  variant={feedbackGiven === "helpful" ? "default" : "outline"}
                  className="flex items-center gap-2 select-none"
                  onClick={() => handleFeedback("helpful")}
                  disabled={feedbackGiven !== null}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Yes, it helped
                </Button>
                <Button
                  variant={
                    feedbackGiven === "not-helpful" ? "default" : "outline"
                  }
                  className="flex items-center gap-2 select-none"
                  onClick={() => handleFeedback("not-helpful")}
                  disabled={feedbackGiven !== null}
                >
                  <ThumbsDown className="h-4 w-4" />
                  No, I need more help
                </Button>
              </div>
              {feedbackGiven && (
                <div className="mt-4 p-4 rounded-lg bg-primary/5 text-sm text-muted-foreground">
                  {`Thank you for your feedback! We'll use this to improve our
                documentation.`}
                </div>
              )}
            </div>

            {/* Related Articles */}
            <div className="mt-16">
              <h3 className="text-lg font-semibold mb-6">Related Articles</h3>
              <div className="grid gap-4">
                {allArticles
                  .filter((a: Article) => a.id !== article.id)
                  .slice(0, 3)
                  .map((relatedArticle: Article) => (
                    <Link
                      key={relatedArticle.id}
                      href={`/faq/${categorySlug}/${relatedArticle.id}`}
                      className="group p-4 rounded-xl border bg-backgroundSecondary hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium mb-2 group-hover:text-primary transition-colors">
                            {relatedArticle.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {relatedArticle.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
