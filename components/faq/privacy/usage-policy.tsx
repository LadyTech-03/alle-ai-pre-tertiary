const UsagePolicy = () => {
  return (
    <div className="min-h-screen w-full ">
      <div className="">
        <div className="p-6 md:p-8">
          {/* Main Title */}
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Usage Policies
          </h1>

          {/* Overview  */}
          <section className="mb-8">
            <p className="text-gray-700 dark:text-muted-foreground leading-relaxed">
              Our platform provides access to a wide array of AI models,
              including Claude, ChatGPT, and many others, allowing users to
              interact and engage with cutting-edge technology. These Usage
              Policies are designed to ensure that our services are used
              responsibly, fairly, and in compliance with applicable laws. By
              using our platform, you agree to these terms.
            </p>
          </section>

          {/* Guidelines  */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Guidelines for Using Our Services
            </h2>

            <div className="space-y-6">
              {/*  Access */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  1. Authorized Access
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground pl-4">
                  Only authorized users should access our platform. You must
                  ensure that your account is used solely by you and that any
                  actions taken using your account are your responsibility.
                </p>
              </div>

              {/* Legal Compliance */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  2. Legal Compliance
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground pl-4">
                  You must comply with all applicable laws and regulations in
                  your jurisdiction. This includes, but is not limited to,
                  intellectual property laws, privacy laws, and any other
                  relevant legal frameworks.
                </p>
              </div>

              {/* Ethical Use */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  3. Ethical Use
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground pl-4">
                  You are expected to use our platform in a manner that is
                  ethical and does not promote harm, discrimination, harassment,
                  or illegal activities.
                </p>
              </div>

              {/* Prohibited Activities */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  4. Prohibited Activities
                </h3>
                <div className="pl-4 space-y-2">
                  <p className="text-gray-700 dark:text-muted-foreground">
                    <span className="font-medium">
                      Fraudulent or deceptive behavior:
                    </span>{" "}
                    Do not attempt to deceive, defraud, or manipulate the
                    platform, including impersonating others.
                  </p>
                  <p className="text-gray-700 dark:text-muted-foreground">
                    <span className="font-medium">Harmful use:</span> Do not use
                    our AI services to create harmful, abusive, or malicious
                    content.
                  </p>
                  <p className="text-gray-700 dark:text-muted-foreground">
                    <span className="font-medium">
                      Interference with the platform:
                    </span>{" "}
                    Do not attempt to interfere with the operation or security
                    of the platform in any way.
                  </p>
                </div>
              </div>

              {/* Security */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  5. Security
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground pl-4">
                  You should protect your login information and take steps to
                  prevent unauthorized access to your account. Notify us
                  immediately if you suspect any unauthorized use.
                </p>
              </div>

              {/* Data Usage */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  6. Data Usage
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground pl-4">
                  Any data shared with our platform must comply with our privacy
                  policy. We prioritize user privacy and confidentiality and
                  ensure that all interactions with the AI models are handled
                  securely.
                </p>
              </div>

              {/* Service Availability */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  7. Service Availability
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground pl-4">
                  We make every effort to ensure our platform is available and
                  functioning properly. However, occasional maintenance or
                  issues may arise, and we cannot guarantee uninterrupted access
                  at all times.
                </p>
              </div>

              {/* Termination of Access */}
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                  8. Termination of Access
                </h3>
                <p className="text-gray-700 dark:text-muted-foreground pl-4">
                  We reserve the right to suspend or terminate your access to
                  the platform if you violate any of these usage policies.
                </p>
              </div>
            </div>
          </section>

          {/* Changes Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Changes to Usage Policies
            </h2>
            <p className="text-gray-700 dark:text-muted-foreground">
              {`We reserve the right to modify these usage policies at any time.
              It's important to review them regularly to stay updated on any
              changes.`}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UsagePolicy;
