import React, { useState } from "react";
import { ArrowDown } from "lucide-react";
import NavigationContainer from "@/components/NavigationContainer";
const ManagingChatHistory = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const faqs = [
    {
      question: "Can I recover a deleted chat?",
      answer:
        "No, once a chat is deleted, it cannot be recovered. Please ensure you want to delete a chat before proceeding.",
    },
    {
      question: "How far back does my chat history go?",
      answer:
        "Your chat history is stored for [X months/years], after which it may be automatically archived or deleted.",
    },
    {
      question: "Can I export chats in multiple formats?",
      answer:
        "Yes, you can export chats in PDF, CSV, or TXT formats, depending on your needs.",
    },
  ];

  return (
    <div className="documentation-container">
      <p className="text-muted-foreground mb-8">
        This guide will help you understand how to manage your chat history on
        [Your Website Name]. Whether you want to review past conversations,
        delete specific chats, or export your chat history, this guide has you
        covered.
      </p>

      <h2 className="text-3xl mb-4">1. Accessing Your Chat History</h2>
      <p className="mb-4">To view your chat history:</p>
      <ol className="text-muted-foreground mb-8 space-y-2">
        <li>Log in to your account on [Your Website Name].</li>
        <li>
          Navigate to the <strong>Chat</strong> section from the main menu or
          dashboard.
        </li>
        <li>
          Click on <strong>Chat History</strong> or a similar option
          {` (e.g.,
          "Past Conversations").`}
        </li>
        <li>
          Your chat history will be displayed in chronological order, with the
          most recent chats at the top.
        </li>
      </ol>
      {/* VIDEO_PLACEHOLDER: Add video for accessing chat history */}
      <div className="video-placeholder mb-8">
        {/* Replace this comment with your video embed code */}
        {/* Example: <iframe src="your-video-url" /> */}
      </div>

      <h2 className="text-3xl mb-4">2. Searching and Filtering Chats</h2>
      <p className="mb-4">
        If you have a long chat history, you can use the search and filter
        options to find specific conversations:
      </p>
      <ul className="text-muted-foreground mb-8 space-y-2">
        <li>
          <strong>Search Bar</strong>: Enter keywords, dates, or participant
          names to locate specific chats.
        </li>
        <li>
          <strong>Filters</strong>: Use filters like date range, chat type
          (e.g., group or individual), or tags to narrow down your results.
        </li>
      </ul>
      {/* VIDEO_PLACEHOLDER: Add video for searching and filtering chats */}
      <div className="video-placeholder mb-8">
        <aside className="mb-8">
          <iframe
            src="https://scribehow.com/embed/Accessing_GPT-4o_Chat_and_Saving_Summary__NQZpM_PXQ6mfOV17aHIq2A?as=video"
            width="70%"
            height="400"
          ></iframe>
        </aside>
      </div>

      <h2 className="text-3xl mb-4">3. Deleting Chat History</h2>
      <p className="mb-4">
        If you want to delete a chat or clear your history:
      </p>
      <ol className="text-muted-foreground mb-8 space-y-2">
        <li>
          Go to the <strong>Chat History</strong> section.
        </li>
        <li>
          Select the chat(s) you want to delete by checking the box next to each
          conversation.
        </li>
        <li>
          Click the <strong>Delete</strong> button (usually represented by a
          trash bin icon).
        </li>
        <li>Confirm the deletion when prompted.</li>
      </ol>
      <p className="mb-8">
        <strong>Note</strong>: Deleted chats cannot be recovered, so proceed
        with caution.
      </p>
      {/* VIDEO_PLACEHOLDER: Add video for deleting chat history */}
      <div className="video-placeholder mb-8">
        <aside className="mb-8">
          <iframe
            src="https://scribehow.com/embed/Accessing_GPT-4o_Chat_and_Saving_Summary__NQZpM_PXQ6mfOV17aHIq2A?as=video"
            width="70%"
            height="400"
          ></iframe>
        </aside>
      </div>

      <h2 className="text-3xl mb-4">4. Archiving Chats</h2>
      <div className="text-muted-foreground mb-8">
        <p className="mb-4">
          To keep your chat history organized without deleting important
          conversations, you can archive chats:
        </p>
        <ol className="space-y-2">
          <li>
            Go to the <strong>Chat History</strong> section.
          </li>
          <li>Select the chat(s) you want to archive.</li>
          <li>
            Click the <strong>Archive</strong> button.
          </li>
          <li>
            Archived chats will be moved to a separate{" "}
            <strong>Archived Chats</strong> folder, which you can access
            anytime.
          </li>
        </ol>
      </div>

      {/* VIDEO_PLACEHOLDER: Add video for archiving chats */}
      <div className="video-placeholder mb-8">
        {/* Replace this comment with your video embed code */}
      </div>

      <h2 className="text-3xl mb-4">5. Exporting Chat History</h2>
      <div className="text-muted-foreground mb-8">
        <p className="mb-4">
          If you need a copy of your chat history for record-keeping or other
          purposes, you can export it:
        </p>
        <ol className="space-y-2">
          <li>
            Go to the <strong>Chat History</strong> section.
          </li>
          <li>Select the chat(s) you want to export.</li>
          <li>
            Click the <strong>Export</strong> button.
          </li>
          <li>Choose your preferred format (e.g., PDF, CSV, or TXT).</li>
          <li>Download the file to your device.</li>
        </ol>
      </div>

      {/* VIDEO_PLACEHOLDER: Add video for exporting chat history */}
      <div className="video-placeholder mb-8">
        {/* Replace this comment with your video embed code */}
      </div>

      <h2 className="text-3xl mb-4">6. Managing Chat Notifications</h2>
      <div className="text-muted-foreground mb-8">
        <p className="mb-4">
          To control how you’re notified about chat activity:
        </p>
        <ol className="space-y-2">
          <li>
            Go to <strong>Settings</strong> &gt; <strong>Notifications</strong>.
          </li>
          <li>
            Adjust your preferences for chat notifications (e.g., email alerts,
            push notifications).
          </li>
          <li>Save your changes.</li>
        </ol>
      </div>

      {/* VIDEO_PLACEHOLDER: Add video for managing chat notifications */}
      <div className="video-placeholder mb-8">
        {/* Replace this comment with your video embed code */}
      </div>

      <h2 className="text-3xl mb-4">7. Troubleshooting Chat History Issues</h2>
      <div className="text-muted-foreground mb-8">
        <p className="mb-4">
          If you encounter any issues with your chat history, such as missing
          chats or errors, try the following:
        </p>
        <ul className="space-y-2">
          <li>Refresh the page or log out and log back in.</li>
          <li>Clear your browser cache and cookies.</li>
          <li>
            Contact <strong>[Support Team]</strong> for further assistance.
          </li>
        </ul>
      </div>

      {/* VIDEO_PLACEHOLDER: Add video for troubleshooting */}
      <div className="video-placeholder mb-8">
        {/* Replace this comment with your video embed code */}
      </div>

      <h2 className="text-3xl mb-4">8. FAQs</h2>
      <div className="space-y-4 mb-8">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center text-left"
            >
              <span className="font-medium">{faq.question}</span>
              <ArrowDown
                className={`h-5 w-5 transition-transform ${
                  expandedFAQ === index ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedFAQ === index && (
              <p className="mt-2 text-muted-foreground">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-3xl mb-4">9. Need Help?</h2>
      <p className="text-muted-foreground mb-4">
        If you have any questions or need further assistance with managing your
        chat history, please contact our support team at{" "}
        <strong>[support email]</strong> or visit our{" "}
        <strong>[Help Center]</strong>.
      </p>
      <NavigationContainer
        previousTitle="Prompts Engineering"
        // previousDescription="Learn how to craft effective prompts to get the best results from AI models"
        preUrl="/docs/tutorials/prompts"
        // nextDesciption="Learn how to craft effective prompts to get the best results from AI models."
        nextTitle="Ready to Get Started? 🚀 "
        nextUrl="/"
      />
    </div>
  );
};

export default ManagingChatHistory;
