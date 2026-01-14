import Link from "next/link";
export default function ContactSupport() {
  return (
    <div>
      <div className="">
        <h1 className="text-2xl font-semibold mb-6">
          Reach Out for Our Support
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <p className="mb-6">
            We're here to help you get the most out of our AI platform. Here's
            how you can reach our support team.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded p-4 mb-8">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              For fastest support, please include your conversation ID and a
              clear description of your issue.
            </p>
          </div>

          <h2 className="text-xl font-medium mt-8 mb-4">Support Options</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Email Support</h3>
              <p className="">
                Send your questions to{" "}
                <a
                  href="mailto:support@alle-ai.com"
                  className="text-blue-600 font-medium underline ml-1 hover:text-blue-800 transition-colors duration-300"
                >
                  support@alle-ai.com
                </a>
                . We typically respond within 24 hours.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Help Center</h3>
              <p className="">
                Browse our documentation at{" "}
                <Link
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  href={"/faq"}
                >
                  Help Center
                </Link>{" "}
                for immediate answers to common questions.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-medium mt-8 mb-4">What to Include</h2>
          <ul className="space-y-2 ">
            <li> A brief description of what you were trying to do</li>
            <li> Any error messages you received</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
