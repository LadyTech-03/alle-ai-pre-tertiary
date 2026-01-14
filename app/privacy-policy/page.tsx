
import { Metadata } from "next"
import PrivacyPolicyContent from "@/components/features/policy/privacy-policy-content"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn about our privacy practices and how we protect your data."
}

export default function PrivacyPolicy() {
  return <PrivacyPolicyContent />
}