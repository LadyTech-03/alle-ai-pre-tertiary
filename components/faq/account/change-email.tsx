export default function PhoneVerification() {
  return (
    <div>
      <section>
        <h1 className="text-2xl   mb-4">Updating your email address</h1>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Important Note</h2>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              {` We do not support email address changes at this time. Your email
              address is linked to your authentication method - whether that's
              through email/password login or via providers like Google,
              Facebook, or Apple.`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
