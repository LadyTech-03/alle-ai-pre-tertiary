import React from "react";

export default function PaymentFAQPage() {
  return (
    <div className="">
      <h1 className="text-2xl font-semibold mb-6">
        Have questions about your subscriptions ?
      </h1>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-4 mb-8">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          Having trouble with your subscription? Contact our support team at{" "}
          <a
            href="mailto:support@alle-ai.com"
            className="underline hover:text-blue-600 dark:hover:text-blue-400"
          >
            support@alle-ai.com
          </a>
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>

          <div>
            <h3 className="font-medium mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-muted-foreground">
              We accept all major credit cards (Visa, MasterCard, American
              Express), PayPal, and Apple Pay. For business accounts, we also
              support wire transfers and ACH payments.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">
              Is my payment information secure?
            </h3>
            <p className="text-muted-foreground">
              Yes, all payments are processed through secure payment providers.
              We never store your full credit card details on our servers.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>

          <div>
            <h3 className="font-medium mb-2">How does billing work?</h3>
            <p className="text-muted-foreground">
              {`Subscriptions are billed monthly or annually, depending on your
              chosen plan. You'll be charged automatically at the start of each
              billing period.`}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Can I change my plan?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes
              take effect immediately, and billing is prorated based on your
              usage.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            Cancellations & Refunds
          </h2>

          <div>
            <h3 className="font-medium mb-2">
              How do I cancel my subscription?
            </h3>
            <p className="text-muted-foreground">
              You can cancel your subscription at any time from your account
              settings. Your acess will continue until the end of your current
              billing period.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2"> {`What's your refund policy?`} </h3>
            <p className="text-muted-foreground">
              We offer a 30-day money-back guarantee for annual subscriptions.
              Monthly subscriptions can be cancelled but are not refundable for
              partial months.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">
              What happens to my data after cancellation?
            </h3>
            <p className="text-muted-foreground">
              Your data remains accessible after cancellation. After this
              period, your data will still be available untill you request for
              it being permanently deleted from our servers. You can subscribe
              again any moment
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
