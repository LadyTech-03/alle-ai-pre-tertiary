import Link from "next/link";
const termsPoints = [
  {
    title: "Acceptance of Terms:",
    description:
      "By using Alle-AI, you agree to comply with these Terms and our Privacy Policy. Continued use after updates indicates acceptance of changes.",
  },
  {
    title: "User Eligibility:",
    description:
      "Alle-AI is available to individuals aged 13 or older. Organizations must have authorized representatives to bind them to these Terms.",
  },
  {
    title: "User Accounts:",
    description:
      "You are responsible for maintaining your account credentials and notifying us of any unauthorized access.",
  },
  {
    title: "Proper Use of Alle-AI:",
    description:
      "Use Alle-AI for lawful and legitimate purposes. Do not upload or share objectionable content.",
  },
  {
    title: "Intellectual Property:",
    description:
      "Alle-AI and its models are protected by intellectual property laws. Unauthorized use or distribution is prohibited.",
  },
  {
    title: "Third-Party Models:",
    description:
      "Alle-AI integrates third-party AI models. We strive for quality but cannot guarantee their availability or accuracy.",
  },
  {
    title: "Limitation of Liability:",
    description:
      "Alle-AI is provided 'as-is' and we are not liable for damages arising from its use.",
  },
  {
    title: "Indemnification:",
    description:
      "You agree to indemnify Alle-AI against claims or damages resulting from your use of the platform.",
  },
  {
    title: "Termination:",
    description:
      "We reserve the right to suspend or terminate access for any reason, including violation of these Terms.",
  },
];

export default function TermsSummary() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Terms and Conditions Summary
      </h2>
      <p className="text-lg mb-6">
        {`Below is a summary of our Terms and Conditions. For full details, please `}
        <Link href="/terms-of-service">
          <span className="text-blue-600 hover:text-blue-800 dark:text-muted-foreground dark:hover:text-gray-300 underline cursor-pointer">
            read the full Terms and Conditions here.
          </span>
        </Link>
      </p>
      <ul className="list-disc list-inside space-y-4">
        {termsPoints.map((point, index) => (
          <li key={index}>
            <strong className="text-gray-900 dark:text-white">
              {point.title}
            </strong>{" "}
            <span className="text-gray-700 dark:text-muted-foreground">
              {point.description}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-lg mt-6">
        For full details, please{" "}
        <Link href="/terms-of-service">
          <span className="text-blue-600 hover:text-blue-800 dark:text-muted-foreground dark:hover:text-gray-300 underline cursor-pointer">
            read our complete Terms and Conditions.
          </span>
        </Link>
      </p>
    </div>
  );
}
