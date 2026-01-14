const ContentPolicy = () => {
  return (
    <div className="min-h-screen w-full ">
      <div>
        <div className="p-6 md:p-8">
          {/* Main Title */}
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Content Policy
          </h1>

          {/* Overview Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Overview
            </h2>
            <p className="text-gray-700 dark:text-muted-foreground leading-relaxed">
              Our platform enables users to generate and interact with AI-driven
              content across various use cases. This Content Policy defines the
              standards for content creation, ensuring that interactions with
              our services remain appropriate and aligned with our values. By
              using our platform, you agree to comply with these content
              guidelines.
            </p>
          </section>

          {/* Understanding Content Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Understanding What Content is Allowed
            </h2>

            <div className="space-y-6">
              {/* Permitted Content */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  1. Permitted Content
                </h3>
                <div className="pl-4 space-y-2">
                  <p className="text-gray-700 dark:text-muted-foreground">
                    <span className="font-medium">General Use:</span> You are
                    welcome to create content for a wide range of purposes, such
                    as research, learning, entertainment, creativity, and
                    innovation. AI-generated content must adhere to ethical and
                    legal standards.
                  </p>
                  <p className="text-gray-700 dark:text-muted-foreground">
                    <span className="font-medium">
                      Respect for Intellectual Property:
                    </span>{" "}
                    All content generated using the platform must respect
                    intellectual property rights. Ensure that you do not
                    infringe on any copyrights, trademarks, or patents when
                    creating content.
                  </p>
                </div>
              </div>

              {/* Prohibited Content */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  2. Prohibited Content
                </h3>
                <div className="pl-4 space-y-2">
                  <p className="text-gray-700 dark:text-muted-foreground">
                    <span className="font-medium">Illegal Content:</span> You
                    may not use our platform to create or distribute content
                    that violates any laws, including content related to fraud,
                    identity theft, illegal activities, or material that
                    promotes violence or illegal behavior.
                  </p>
                  <p className="text-gray-700 dark:text-muted-foreground">
                    <span className="font-medium">
                      Hate Speech and Harassment:
                    </span>{" "}
                    Content promoting hate speech, discrimination, or harassment
                    based on race, gender, religion, nationality, disability, or
                    any other protected characteristic is strictly prohibited.
                  </p>
                  <p className="text-gray-700 dark:text-muted-foreground">
                    <span className="font-medium">
                      Explicit or Adult Content:
                    </span>{" "}
                    You must refrain from generating sexually explicit,
                    pornographic, or other adult content using our platform.
                  </p>
                  <p className="text-gray-700 dark:text-muted-foreground">
                    <span className="font-medium">
                      Violent or Graphic Content:
                    </span>{" "}
                    Content depicting violence, abuse, or harm towards
                    individuals or animals is not allowed.
                  </p>
                  <p className="text-gray-700 dark:text-muted-foreground">
                    <span className="font-medium">
                      Malicious or Harmful Content:
                    </span>{" "}
                    Content created to harm others, including phishing, malware,
                    or any other form of cyber attack, is prohibited.
                  </p>
                </div>
              </div>

              {/* Content Moderation */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  3. Content Moderation
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground pl-4">
                  Our platform may use automated systems and human moderation to
                  review generated content and ensure compliance with these
                  policies. If content violates our policy, we may remove it and
                  suspend or terminate user access.
                </p>
              </div>

              {/* Personal Data Protection */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  4. Personal Data Protection
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground pl-4">
                  {`   Any content generated on our platform that involves the use of
                  personal data must comply with relevant data protection and
                  privacy laws. Do not input any sensitive personal data unless
                  explicitly allowed by the platform's privacy policy.`}
                </p>
              </div>

              {/* AI-Generated Content Attribution */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  5. AI-Generated Content Attribution
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground pl-4">
                  While AI models like Claude and ChatGPT generate content based
                  on user input, you must acknowledge that the content is
                  generated by an AI and not an individual human unless
                  specified otherwise.
                </p>
              </div>
            </div>
          </section>

          {/* Reporting Violations Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Reporting Violations
            </h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              If you encounter content that violates these guidelines, we
              encourage you to report it to us. We will take appropriate action
              in accordance with our policies.
            </p>
          </section>

          {/* Changes Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Changes to Content Policy
            </h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              {`We reserve the right to update this content policy at any time.
              It's important to review the policy periodically to ensure your
              content remains compliant with our standards.`}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContentPolicy;
