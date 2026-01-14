import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
interface ArticleFeedbackProps {
  articleId?: string;
  onFeedbackSubmit?: (feedback: FeedbackData) => Promise<void>;
  className?: string;
}

interface FeedbackData {
  isHelpful: boolean | null;
  reason: string | null;
  additionalComment?: string;
  articleId?: string;
  timestamp?: string;
}

const ArticleFeedback: React.FC<ArticleFeedbackProps> = ({
  articleId,
  onFeedbackSubmit,
  className = "",
}) => {
  const [feedback, setFeedback] = useState<FeedbackData>({
    isHelpful: null,
    reason: null,
    additionalComment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const positiveOptions = [
    {
      value: "Accurate",
      label: "Accurately reflects the API's multi-model capabilities",
    },
    {
      value: "Solved my problem",
      label: "Helped me achieve my goal with multiple models",
    },
    {
      value: "Easy to understand",
      label: "Made requesting multiple models simple and clear",
    },
    {
      value: "Helped me decide",
      label: "Showed me the value of comparing or combining model outputs",
    },
    { value: "Another reason", label: "Another reason" },
  ];

  const negativeOptions = [
    { value: "Inaccurate", label: "Misrepresents how the API or models work" },
    {
      value: "Couldn't find",
      label: "Lacks details on model limits or supported types",
    },
    {
      value: "Hard to understand",
      label: "Confusing to set up or use multiple models",
    },
    {
      value: "Code sample errors",
      label: "Code examples for API requests don't work",
    },
    { value: "Another reason", label: "Another reason" },
  ];

  useEffect(() => {
    if (feedback.reason === "Another reason") {
      setIsSubmitDisabled(!feedback.additionalComment?.trim());
    } else {
      setIsSubmitDisabled(!feedback.reason);
    }
  }, [feedback.reason, feedback.additionalComment]);

  const handleInitialFeedback = (isHelpful: boolean): void => {
    if (feedback.isHelpful === null) {
      setFeedback({ isHelpful, reason: null, additionalComment: "" });
    }
  };

  const handleReasonSubmit = async (): Promise<void> => {
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    const fullFeedback: FeedbackData = {
      ...feedback,
      articleId,
      timestamp: new Date().toISOString(),
    };

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await onFeedbackSubmit?.(fullFeedback);
      toast.success(
        feedback.isHelpful
          ? "Thanks for your feedback! We're glad this was helpful."
          : "Thanks for your feedback. We'll work on improving this."
      );
      setFeedback({ isHelpful: null, reason: null, additionalComment: "" });
    } catch (error) {
      toast.error("Oops, something went wrong. Try again?", {
        // Optional: Add error styling or behavior
        style: { background: "rgba(239, 68, 68, 0.2)" }, // Mimics your red error bg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-xl pl-8 ${className}`}>
      <div className="dark:border-zinc-800 mt-8 pt-6">
        {feedback.isHelpful === null ? (
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-lg font-medium">Was this article helpful?</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleInitialFeedback(true)}
                className="flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                aria-label="Mark as helpful"
              >
                <ThumbsUp size={16} />
              </button>
              <button
                onClick={() => handleInitialFeedback(false)}
                className="flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                aria-label="Mark as not helpful"
              >
                <ThumbsDown size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <h4 className="text-md font-medium mb-2">
              {feedback.isHelpful ? "What did you like?" : "What went wrong?"}
            </h4>
            <div className="space-y-2">
              {(feedback.isHelpful ? positiveOptions : negativeOptions).map(
                (option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="feedback-reason"
                      value={option.value}
                      checked={feedback.reason === option.value}
                      onChange={() =>
                        setFeedback({
                          ...feedback,
                          reason: option.value,
                          additionalComment:
                            option.value === "Another reason"
                              ? ""
                              : feedback.additionalComment,
                        })
                      }
                      className="text-blue-500"
                    />
                    <div>
                      <div>{option.value}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.label}
                      </div>
                    </div>
                  </label>
                )
              )}
            </div>
            {feedback.reason === "Another reason" && (
              <div className="mt-4">
                <label className="text-sm font-medium">
                  Tell us more (required):
                </label>
                <textarea
                  value={feedback.additionalComment}
                  onChange={(e) =>
                    setFeedback({
                      ...feedback,
                      additionalComment: e.target.value,
                    })
                  }
                  className="w-full mt-1 p-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white"
                  rows={3}
                  placeholder="Please tell us more about your experience"
                  required
                />
              </div>
            )}
            <button
              onClick={handleReasonSubmit}
              disabled={isSubmitDisabled || isSubmitting}
              className={`mt-4 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                !isSubmitDisabled && !isSubmitting
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-zinc-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-current"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 0 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleFeedback;
