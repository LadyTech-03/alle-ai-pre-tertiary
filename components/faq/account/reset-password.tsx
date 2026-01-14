import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function ResetPassword() {
  return (
    <div>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Can't Reset Password?</h2>
        <p className="text-base leading-relaxed">
          If you're having trouble resetting your password, there are several
          common reasons this might be happening. Here's what you should check
          and how to resolve these issues:
        </p>
      </section>
      {/* Email issues  */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Email Issues</h2>
        <p className=" mb-2">
          The most common reason for password reset problems is email-related.
          Check if:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>The password reset email is in your spam or junk folder</li>
          <li>
            You're using the correct email address associated with your account
          </li>
          <li>Your email inbox isn't full</li>
          <li>Your email provider isn't blocking our messages</li>
        </ul>
      </section>
      {/* Link Expiration  */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Link Expiration</h2>
        <p className="">
          Password reset links typically expire after a certain period (usually
          24 hours) for security reasons. If you waited too long to use the
          link, you'll need to request a new one.
        </p>
      </section>
      {/* Account Status Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Account Status</h2>
        <p className="mb-2">
          Your account status might be preventing password resets if:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Your account has been temporarily locked due to too many failed
            login attempts
          </li>
          <li>Your account has been suspended or deactivated</li>
          <li>You haven't verified your email address</li>
        </ul>
      </section>
      {/* Still problems skem Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Still Having Problems?</h2>
        <p className=" mb-2">
          If you've checked all of the above and still can't reset your
          password:
        </p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Try using a different browser or device</li>
          <li>Wait 30 minutes and try again</li>
          <li className=" my-2  text-base">
            Contact our support team for assistance at
            <a
              href="mailto:support@alle-ai.com"
              className="text-blue-600 font-medium underline ml-1 hover:text-blue-800 transition-colors duration-300"
            >
              support@alle-ai.com
            </a>
          </li>
        </ol>
        <p className=" mt-4">
          For security reasons, our support team may require additional
          verification of your identity before helping with password-related
          issues.
        </p>
      </section>
    </div>
  );
}
