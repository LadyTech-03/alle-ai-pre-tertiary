"use client";
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes';
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function PrivacyPolicyContent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
      setMounted(true);
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(entry.target.id)
            }
          })
        },
        { rootMargin: '-50% 0px -50% 0px' }
      )
  
      document.querySelectorAll('section[id]').forEach((section) => {
        observer.observe(section)
      })
  
      return () => observer.disconnect()
    }, [])
  
    const scrollToSection = (sectionId: string) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  
    const sections = [
      { id: 'information-we-collect', title: '1. Information We Collect' },
      { id: 'how-we-use-your-information', title: '2. How We Use Your Information' },
      { id: 'cookies-and-tracking', title: '3. Cookies and Tracking Technologies' },
      { id: 'sharing-your-information', title: '4. Sharing Your Information' },
      { id: 'user-access-and-control', title: '5. User Access and Control' },
      { id: 'referral-program', title: '6. Referral Program' },
      { id: 'security', title: '7. Security' },
      { id: 'changes-to-policy', title: '8. Changes to this Privacy Policy' },
      { id: 'contact-information', title: '9. Contact Information' },
    ]
  
    const TableOfContents = () => (
      <nav>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <Button
                variant="ghost"
                className={`w-full justify-start ${activeSection === section.id ? 'bg-accent text-accent-foreground' : ''}`}
                onClick={() => scrollToSection(section.id)}
              >
                {section.title}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    )
  
    return (
      // <RootLayout title="Privacy Policy | Alle-AI" description="Learn about our privacy practices.">
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 flex h-14 items-center justify-between">
              {mounted && (
                <Image 
                src={resolvedTheme === 'dark' ? "/svgs/logo-desktop-full.webp" : "/svgs/logo-desktop-dark-full.webp"} 
                alt="Alle-AI Logo" 
                width={110} 
                height={110} />
              )}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href="/privacy-policy" className="text-muted-foreground text-lg hover:underline">
                  <Button
                  variant={'outline'}
                  className='p-2 h-8'
                  >
                      Blog
                  </Button>
                </Link>
              </div>
            </div>
          </header>
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:space-x-12 lg:space-x-16 xl:space-x-20">
              <aside className="hidden md:block md:w-64 lg:w-72 xl:w-80 shrink-0">
                <div className="sticky top-20">
                  <ScrollArea className="h-[calc(50svh-1rem)] border-r py-6">
                    <TableOfContents />
                  </ScrollArea>
                </div>
              </aside>
              <main className="flex-1 py-6 md:py-8 lg:py-10">
                <div className="mx-auto max-w-3xl">
                  <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
                  <p className="text-muted-foreground mb-6">Last Updated: November 11, 2024</p>
                  <p className="mb-8">
                    This Privacy Policy (&quot;Policy&quot;) outlines how we collect, use, and protect your personal information. 
                    Please read this Policy carefully to understand how your data will be handled when you use Alle-AI. 
                    By accessing or using our platform, you agree to the terms of this Policy.
                  </p>
  
                  <section id="information-we-collect" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                    <h3 className="text-xl font-medium mb-2">1.1 User Account Information</h3>
                    <p className="mb-4">When you create an account on Alle-AI, we may collect the following information:</p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                      <li>Your name</li>
                      <li>Email address</li>
                      <li>Password</li>
                      <li>Profile information (optional)</li>
                      <li>Any other information you provide voluntarily</li>
                    </ul>
                    <h3 className="text-xl font-medium mb-2">1.2 Usage Information</h3>
                    <p className="mb-4">We collect information about how you use Alle-AI, including:</p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                      <li>Interactions with the platform</li>
                      <li>Content you create and/or interact with</li>
                      <li>Device and browser information</li>
                      <li>Log data</li>
                      <li>Cookies and similar technologies (see &quot;Cookies and Tracking Technologies&quot; section below)</li>
                    </ul>
                    <h3 className="text-xl font-medium mb-2">1.3 Third-Party Models and Services</h3>
                    <p>
                      Alle-AI integrates various third-party AI models. While we do not collect data directly from these models, 
                      it is important to review the privacy policies of the providers of these AI models, as they may collect data 
                      when used through our platform.
                    </p>
                  </section>
  
                  <section id="how-we-use-your-information" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                    <p className="mb-4">We use your information to:</p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                      <li>Provide and maintain Alle-AI services</li>
                      <li>Improve and personalize your user experience</li>
                      <li>Respond to your requests and provide customer support</li>
                      <li>Comply with legal and regulatory requirements</li>
                    </ul>
                  </section>
  
                  <section id="cookies-and-tracking" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">3. Cookies and Tracking Technologies</h2>
                    <p>
                      We may use cookies and similar tracking technologies to enhance your experience on Alle-AI. 
                      You can manage your preferences related to these technologies through your browser settings.
                    </p>
                  </section>
  
                  <section id="sharing-your-information" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Information</h2>
                    <p className="mb-4">
                      We do not sell or share your personal information with third parties for their own marketing purposes. 
                      We may share your information with:
                    </p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                      <li>Third-party service providers who assist in the operation of Alle-AI</li>
                      <li>Legal authorities when required by law</li>
                    </ul>
                  </section>
  
                  <section id="user-access-and-control" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">5. User Access and Control</h2>
                    <p>
                      You have the right to access, correct, or delete your personal information on Alle-AI. 
                      You can do this by accessing your account settings or contacting us at contact@alle-ai.com. 
                      Please note that certain data may be retained for legal or legitimate business purposes.
                    </p>
                  </section>
  
                  <section id="referral-program" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">6. Referral Program</h2>
                    <p>
                      Our referral program allows users (&quot;Referrers&quot;) to earn tokens by referring new users (&quot;Referred Users&quot;) to sign up for our platform. 
                      When a Referred User successfully signs up, verifies their email address, and completes any other required steps on the platform, 
                      the Referrer earns tokens, which can be used exclusively on our platform.
                    </p>
  
                    <h3 className="text-xl font-medium mb-2">6.1 Data Collection in the Referral Program</h3>
                    <p>
                      To participate in our referral program, we collect the following data:
                    </p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                      <li>
                        <strong>Referrer Information:</strong> Your account details, including your name, email address, and any other information you provide when you refer someone.
                      </li>
                      <li>
                        <strong>Referred User Information:</strong> The email address and other details provided by the person you refer when they sign up on our platform.
                      </li>
                      <li>
                        <strong>Referral Activity Data:</strong> We track the referrals you have made, the sign-up status of your referred users, and the number of tokens earned from each successful referral.
                      </li>
                    </ul>
                    <p>
                      This information is collected and processed to:
                    </p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                      <li>Award tokens to Referrers when a Referred User successfully signs up and verifies their email.</li>
                      <li>Monitor the integrity of the referral process to ensure it is not abused or exploited by automated systems, bots, or fraudulent activities.</li>
                    </ul>
  
                    <h3 className="text-xl font-medium mb-2">6.2 Token Use and Restrictions</h3>
                    <p>
                      Tokens earned through the referral program can be used for various features and services within the platform, including but not limited to:
                    </p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                      <li>Premium features</li>
                      <li>In-app purchases</li>
                      <li>Account upgrades</li>
                      <li>Other offerings provided by the platform</li>
                    </ul>
                    <p>
                      <strong>Important Note:</strong> Tokens are non-transferable and can only be used within our platform. They cannot be redeemed for cash or exchanged outside the platform.
                    </p>
  
                    <h3 className="text-xl font-medium mb-2">6.3 Fraudulent Activities and Token Revocation</h3>
                    <p>
                      We take fraud prevention seriously to ensure a fair and secure experience for all users. We actively monitor for suspicious activities such as:
                    </p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                      <li>Referrals from non-human or bot accounts</li>
                      <li>Attempts to exploit the referral program through multiple fake accounts</li>
                      <li>Any other fraudulent or unethical referral practices</li>
                    </ul>
                    <p>
                      If we detect any such activity, we reserve the right to:
                    </p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                      <li>Immediately revoke or confiscate any tokens earned through fraudulent or suspicious referral activities.</li>
                      <li>Suspend or terminate the accounts of users found violating the program’s terms.</li>
                      <li>Take additional legal or corrective actions if necessary.</li>
                    </ul>
  
                    <h3 className="text-xl font-medium mb-2">6.4 Data Sharing and Third-Party Services</h3>
                    <p>
                      We may share your referral-related data with third-party service providers who assist us in managing the referral program and detecting fraud. 
                      These third-party services are obligated to handle your information securely and in accordance with applicable data protection laws.
                    </p>
                    <p>
                      We will never sell or rent your personal information to third parties for marketing purposes.
                    </p>
  
                    <h3 className="text-xl font-medium mb-2">6.5 Security and Data Retention</h3>
                    <p>
                      We use commercially reasonable measures to protect the information you provide as part of the referral program. 
                      However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                    </p>
                    <p>
                      We will retain referral-related data for as long as necessary to fulfill the purposes outlined in this policy, or as required by law.
                    </p>
  
                    <h3 className="text-xl font-medium mb-2">6.6 Your Rights</h3>
                    <p>
                      You have the right to:
                    </p>
                    <ul className="list-disc list-inside mb-4 ml-4">
                      <li>Access the personal information we hold about you.</li>
                      <li>Request corrections to any inaccurate or incomplete data.</li>
                      <li>Request the deletion of your referral-related data, subject to any legal obligations or business requirements.</li>
                    </ul>
                    <p>
                      To exercise these rights, please contact us at contact@alle-ai.com.
                    </p>
                  </section>
  
                  <section id="security" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">7. Security</h2>
                    <p>
                      We employ reasonable and appropriate security measures to protect your information from 
                      unauthorized access, disclosure, alteration, or destruction.
                    </p>
                  </section>
  
                  <section id="changes-to-policy" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">8. Changes to this Privacy Policy</h2>
                    <p>
                      Alle-AI reserves the right to update this Privacy Policy as necessary to reflect changes in our services 
                      or legal requirements. We will notify you of any material changes by posting a revised version on our platform.
                    </p>
                  </section>
  
                  <section id="contact-information" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
                    <p className="mb-4">
                      If you have any questions or concerns about this Privacy Policy or your data on Alle-AI, 
                      please contact us at <Link href="mailto:contact@alle-ai.com" className="text-primary hover:underline">contact@alle-ai.com</Link>.
                    </p>
                  </section>
  
                  <p className="mt-8 text-muted-foreground">
                    By using Alle-AI, you signify your agreement to this Privacy Policy. 
                    Thank you for choosing Alle-AI for your creative endeavors with Generative AI models.
                  </p>
  
                  {/* Link to Terms of Service */}
                  <div className="mt-6">
                    <p className="text-center">
                      <Link href="/terms-of-service" className="text-primary hover:underline">
                        See our Terms of Service
                      </Link>
                    </p>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
    )
  }