export const docsTableOfContents = {
  RateLimits: [
    {
      title: "introduction",
    },
    {},
  ],
};

// user guides 2
interface subsections {
  id: string;
  title: string;
  href?: string;
}
interface guideSections {
  id: string;
  href?: string;
  title: string;
  sections?: subsections[];
}
interface mainGuides {
  id: string;
  title: string;
  sections: guideSections[];
}

export const mainUserGuides: mainGuides[] = [
  {
    id: "get-started",
    title: "Get Started",
    sections: [
      {
        id: "platform-overview",
        title: "Overview",
      },
      {
        id: "account-setup",
        title: "Account Setup",
      },
      {
        id: "subscriptions",
        title: "Subscription Plans",
      },
      {
        id: "understanding-models",
        title: "Understanding AI Models",
      },
    ],
  },
  {
    id: "platform-usage",
    title: "Capabilities",
    sections: [
      {
        id: "text-generation",
        title: "Chat",
      },
      {
        id: "image-generation",
        title: "Image Generation",
      },
      {
        id: "audio-generation",
        title: "Audio Generation",
      },
      {
        id: "video-generation",
        title: "Video Generation",
      },
      {
        id: "file-uploads",
        title: "Attachments",
      },
    ],
  },
  {
    id: "developer-quickstart",
    title: "For developers",
    sections: [
      {
        id: "start-developing",
        title: "Start developing",
        sections: [
          {
            id: "setup-environment",
            title: "Setup Environment",
          },
          {
            id: "first-request",
            title: "Make your first request",
          },
          {
            id: "sdk&libraries",
            title: "SDKs & libraries",
          },
        ],
      },
      {
        id: "about-api",
        title: "About APIs",
        sections: [
          {
            id: "pricing",
            title: "Pricing",
          },
          {
            id: "models",
            title: "Models",
          },
          {
            id: "best-practise",
            title: "Best Practices",
          },
        ],
      },
    ],
  },
  {
    id: "support",
    title: "Help & Support",
    sections: [
      {
        id: "faq",
        title: "FAQ",
        href: "/faq",
      },
      {
        id: "contact-us",
        title: "Contact Us",
        href: "/contact-us",
      },
      {
        id: "model_glossary",
        title: "Model Glossary",
        href: "/model-glossary",
      },
      {
        id: "changelog",
        title: "changelog",
        href: "/changelog",
      },
    ],
  },
];
const fordevs = {
  id: "developers",
  title: "For developers",
  href: "",
  description: "",
  sections: [
    {
      id: "start-devoping",
      title: "Start developing",
      href: "",
      sections: [
        {
          id: "developer-environment",
          href: "",
          title: "Setup developement Environment",
        },
        {
          id: "first-request",
          title: "Send your first request",
          href: "",
        },
        {
          id: "sdks-libraries",
          title: "Libraries",
          href: "",
        },
      ],
    },
    {
      id: "about-api",
      title: "About APIs",
      href: "",
      sections: [
        {
          id: "pricing-api",
          title: "Pricing",
          href: "",
        },
        {
          id: "models",
          title: "Models",
          href: "",
        },
      ],
    },
  ],
};
