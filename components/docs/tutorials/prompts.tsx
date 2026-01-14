import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import NavigationContainer from "@/components/NavigationContainer";
const UsingPromptsEffectively = () => {
  return (
    <div className="documentation-container">
      <p className="text-muted-foreground mb-8">
        This guide will help you understand how to craft effective prompts to
        get the best results from [Your Website Name]. Whether you're new to
        using AI models or looking to refine your skills, this guide will
        provide tips, examples, and best practices for structuring prompts
        effectively.
      </p>

      <h2 className="text-3xl mb-4">Why Are Prompts Important?</h2>
      <p className="text-muted-foreground mb-8">
        Prompts are the instructions or questions you provide to an AI model to
        generate a response. The quality of your prompt directly impacts the
        quality of the output. A well-structured prompt can lead to accurate,
        relevant, and detailed responses, while a poorly structured one may
        result in vague or irrelevant answers.
      </p>

      <h2 className="text-3xl mb-4">Tips for Crafting Effective Prompts</h2>
      <ul className="text-muted-foreground mb-8 space-y-4">
        <li>
          <strong>Be Clear and Specific:</strong> Avoid vague language. Clearly
          state what you want the model to do.
        </li>
        <li>
          <strong>Provide Context:</strong> Give the model enough background
          information to understand your request.
        </li>
        <li>
          <strong>Use Examples:</strong> If possible, include examples of the
          type of response you're looking for.
        </li>
        <li>
          <strong>Break Down Complex Tasks:</strong> For multi-part questions,
          break them into smaller, manageable steps.
        </li>
        <li>
          <strong>Iterate and Refine:</strong> If the response isn't what you
          expected, tweak your prompt and try again.
        </li>
      </ul>

      <h2 className="text-3xl mb-4">
        Examples of Effective vs. Ineffective Prompts
      </h2>
      <p className="text-muted-foreground mb-8">
        Below are examples of poorly structured prompts and how they can be
        improved for better results.
      </p>

      <div className="space-y-8">
        {/* Example 1: Writing a Blog Post */}
        <div>
          <h3 className="text-xl mb-4">Example 1: Writing a Blog Post</h3>
          <div className="space-y-4">
            <Card className="bg-accent">
              <CardHeader>
                <CardTitle className="text-base">
                  Ineffective Approach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">Prompt:</p>
                  <p className="text-muted-foreground">"Write a blog post."</p>
                </div>
                <div>
                  <p className="font-semibold">Response:</p>
                  <p className="text-muted-foreground">
                    "Blogs are a great way to share information. You can write
                    about anything you want. Make sure it's interesting and
                    engaging."
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Why It's Bad:</p>
                  <p className="text-muted-foreground">
                    The prompt is too vague. The model doesn't know the topic,
                    tone, or audience, so the response is generic and unhelpful.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent">
              <CardHeader>
                <CardTitle className="text-base">Effective Approach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">Prompt:</p>
                  <p className="text-muted-foreground">
                    "Write a 500-word blog post about the benefits of remote
                    work for small businesses. Use a professional tone and
                    include statistics or examples to support your points."
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Response:</p>
                  <p className="text-muted-foreground">
                    "Remote work has become a game-changer for small businesses,
                    offering cost savings, increased productivity, and access to
                    a global talent pool. According to a 2022 study by Buffer,
                    97% of employees prefer working remotely at least part-time.
                    For small businesses, this means..."
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Why It's Good:</p>
                  <p className="text-muted-foreground">
                    The prompt is specific, provides context, and sets clear
                    expectations for the response.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Example 2: Summarizing an Article */}
        <div>
          <h3 className="text-xl mb-4">Example 2: Summarizing an Article</h3>
          <div className="space-y-4">
            <Card className="bg-accent">
              <CardHeader>
                <CardTitle className="text-base">
                  Ineffective Approach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">Prompt:</p>
                  <p className="text-muted-foreground">
                    "Summarize this article."
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Response:</p>
                  <p className="text-muted-foreground">
                    "The article talks about many things. It's about technology
                    and how it's changing the world."
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Why It's Bad:</p>
                  <p className="text-muted-foreground">
                    The prompt doesn't specify which article to summarize or
                    what aspects to focus on, leading to a vague response.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent">
              <CardHeader>
                <CardTitle className="text-base">Effective Approach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">Prompt:</p>
                  <p className="text-muted-foreground">
                    "Summarize the key points of the article titled 'The Future
                    of AI in Healthcare' in 3-4 sentences. Focus on how AI is
                    improving patient outcomes and reducing costs."
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Response:</p>
                  <p className="text-muted-foreground">
                    "The article discusses how AI is transforming healthcare by
                    improving patient outcomes and reducing costs. It highlights
                    applications like predictive analytics for early disease
                    detection and AI-powered tools for personalized treatment
                    plans. The author also emphasizes the importance of ethical
                    considerations in AI adoption."
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Why It's Good:</p>
                  <p className="text-muted-foreground">
                    The prompt specifies the article, the desired length, and
                    the focus areas, resulting in a concise and relevant
                    summary.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Example 3: Generating Ideas */}
        <div>
          <h3 className="text-xl mb-4">Example 3: Generating Ideas</h3>
          <div className="space-y-4">
            <Card className="bg-accent">
              <CardHeader>
                <CardTitle className="text-base">
                  Ineffective Approach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">Prompt:</p>
                  <p className="text-muted-foreground">"Give me some ideas."</p>
                </div>
                <div>
                  <p className="font-semibold">Response:</p>
                  <p className="text-muted-foreground">
                    "Here are some ideas: start a business, write a book, learn
                    a new skill."
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Why It's Bad:</p>
                  <p className="text-muted-foreground">
                    The prompt is too broad, so the response is generic and not
                    actionable.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent">
              <CardHeader>
                <CardTitle className="text-base">Effective Approach</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">Prompt:</p>
                  <p className="text-muted-foreground">
                    "Generate 5 creative marketing ideas for a new eco-friendly
                    clothing brand targeting millennials. Include social media
                    strategies and partnerships."
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Response:</p>
                  <p className="text-muted-foreground">
                    "1. Collaborate with eco-conscious influencers to promote
                    your brand on Instagram and TikTok. 2. Launch a 'Sustainable
                    Style Challenge' where customers share outfits made from
                    your clothing. 3. Partner with local recycling centers to
                    offer discounts for bringing in old clothes. 4. Create
                    educational content on YouTube about the environmental
                    impact of fast fashion. 5. Host a pop-up shop at
                    eco-friendly events or festivals."
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Why It's Good:</p>
                  <p className="text-muted-foreground">
                    The prompt is specific about the target audience, industry,
                    and type of ideas, leading to actionable and creative
                    suggestions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <h2 className="text-3xl mb-4">Common Mistakes to Avoid</h2>
      <ul className="text-muted-foreground mb-8 space-y-4">
        <li>
          <strong>Being Too Vague:</strong> Example: "Tell me about history."
          Fix: "Explain the causes and effects of the Industrial Revolution in
          Europe."
        </li>
        <li>
          <strong>Overloading the Prompt:</strong> Example: "Write a story about
          a hero, include dragons, magic, a love story, and a twist ending, and
          make it funny but also serious." Fix: "Write a short fantasy story
          about a hero who must defeat a dragon to save their village. Focus on
          the hero's journey and include a twist ending."
        </li>
        <li>
          <strong>Ignoring Context:</strong> Example: "Explain this concept."
          Fix: "Explain the concept of blockchain technology to a beginner in
          simple terms."
        </li>
      </ul>

      <h2 className="text-3xl mb-4">Need Help?</h2>
      <p className="text-muted-foreground mb-4">
        If you have any questions or need further assistance with crafting
        effective prompts, please contact our support team at{" "}
        <strong>[support email]</strong> or visit our{" "}
        <strong>[Help Center]</strong>.
      </p>
      <NavigationContainer
        previousTitle="Video Generation"
        // previousDescription="Utilize AI for video creation, editing, and automated scene generation"
        preUrl="/docs/tutorials/video-ai"
        // nextDesciption="View, manage, and delete past interactions with AI to keep track of your generated content."
        nextTitle="Managing history"
        nextUrl="/docs/tutorials/history"
      />
    </div>
  );
};

export default UsingPromptsEffectively;
