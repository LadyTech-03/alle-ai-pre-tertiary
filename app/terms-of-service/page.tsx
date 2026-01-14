
import { Metadata } from "next"
import TermsOfServiceContent from "@/components/features/policy/terms-of-service-content"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read our terms of service and usage guidelines."
}

export default function TermsOfService() {
  return <TermsOfServiceContent />
}