import Link from "next/link";
const policyPoints = [
  {
    title: "Data Collection:",
    description:
      "We collect account details (e.g., name, email, and password), usage data, and referral program activity to provide, personalize, and enhance our services.",
  },
  {
    title: "Data Usage:",
    description:
      "Your information is used to maintain services, improve user experience, and comply with legal requirements.",
  },
  {
    title: "Cookies:",
    description:
      "We use cookies to enhance your experience, with settings you can adjust.",
  },
  {
    title: "Data Sharing:",
    description:
      "We do not sell your personal information. Data is shared only with service providers or as required by law.",
  },
  {
    title: "User Rights:",
    description:
      "You can access, correct, or delete your data via account settings or by contacting us.",
  },
  {
    title: "Security:",
    description: "We implement reasonable measures to protect your data.",
  },
];
export default function Privacy() {
  return (
    <div className=" text-gray-800 dark:text-white ">
      <h2 className="text-2xl font-semibold mb-4">Privacy Policy Summary</h2>
      <p className="text-lg mb-6">
        {`For a quick overview, we've summarized our privacy policy below. To learn more, please `}
        <Link href="/privacy-policy">
          <span className="text-blue-600 hover:text-blue-800 dark:text-muted-foreground dark:hover:text-gray-300 underline cursor-pointer">
            read the full policy here.
          </span>
        </Link>
      </p>
      <ul className="list-disc list-inside space-y-4">
        {policyPoints.map((point, index) => (
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
        <Link href="/privacy-policy">
          <span className="text-blue-600 hover:text-blue-800 dark:text-muted-foreground dark:hover:text-gray-300 underline cursor-pointer">
            read our complete Privacy Policy.
          </span>
        </Link>
      </p>
    </div>
  );
}
