"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes';
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function TermsOfServiceContent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    setMounted(true);
  }, []);
  
    useEffect(() => {
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
      { id: 'acceptance-of-terms', title: '1. Acceptance of Terms' },
      { id: 'user-eligibility', title: '2. User Eligibility' },
      { id: 'user-accounts', title: '3. User Accounts' },
      { id: 'proper-use', title: '4. Proper Use of Alle-AI' },
      { id: 'third-party-models', title: '5. Third-Party Models and Services' },
      { id: 'limitation-of-liability', title: '6. Limitation of Liability' },
      { id: 'indemnification', title: '7. Indemnification' },
      { id: 'termination', title: '8. Termination' },
      { id: 'contact-information', title: '9. Contact Information' },
    ]
  
    const TableOfContents = () => (
      <nav>
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  activeSection === section.id ? 'bg-accent text-accent-foreground' : ''
                }`}
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
      // <RootLayout title="Terms of Service | Alle-AI" description="Learn about our terms of service.">
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
                <Link href="/terms-of-service" className="text-muted-foreground text-lg hover:underline">
                <Button
                variant={`outline`}
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
                  <ScrollArea className="h-[calc(60svh-5rem)] py-6">
                    <TableOfContents />
                  </ScrollArea>
                </div>
              </aside>
              <main className="flex-1 py-6 md:py-8 lg:py-10">
                <div className="mx-auto max-w-3xl">
                  <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
                  <p className="text-muted-foreground mb-6">Last Updated: November 11, 2024</p>
                  <p className="mb-8">
                    Welcome to Alle-AI. These Terms of Service (&quot;Terms&quot;) govern your use of the Alle-AI website and services, 
                    so please read them carefully. By accessing or using Alle-AI, you agree to be bound by these Terms. 
                    If you do not agree with any part of these Terms, you may not use the platform.
                  </p>
  
                  <section id="acceptance-of-terms" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p>
                      By using Alle-AI, you acknowledge that you have read, understood, and agree to comply with these Terms, 
                      as well as our Privacy Policy. These Terms constitute a legally binding agreement between you and Alle-AI, 
                      so it is essential to review them regularly, as they may be updated from time to time. Continued use of the 
                      platform after any modifications to the Terms indicates your acceptance of such changes.
                    </p>
                  </section>
  
                  <section id="user-eligibility" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">2. User Eligibility</h2>
                    <p>
                      Alle-AI is available to  individuals who are at least 13 years old or the age of majority in their jurisdiction. 
                      If you are accessing Alle-AI on behalf of an organization, you represent and warrant that you have the authority 
                      to bind the organization to these Terms.
                    </p>
                  </section>
  
                  <section id="user-accounts" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                    <p>
                      To access certain features of Alle-AI, you may need to create an account. You are responsible for maintaining 
                      the confidentiality of your account credentials and are solely liable for all activities that occur under your account. 
                      If you suspect any unauthorized access to your account, you must notify us immediately.
                    </p>
                  </section>
  
                  <section id="proper-use" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">4. Proper Use of Alle-AI</h2>
                    <h3 className="text-xl font-medium mb-2">Your Usage</h3>
                    <p className="mb-4">
                      You may use Alle-AI solely for lawful and legitimate purposes. You agree not to use the platform in a manner 
                      that violates any applicable laws, infringes on the rights of others, or is harmful, offensive, or disruptive.
                    </p>
                    <h3 className="text-xl font-medium mb-2">Content Guidelines</h3>
                    <p className="mb-4">
                      When using Alle-AI, you must not upload, publish, or share any content that is unlawful, abusive, discriminatory, 
                      defamatory, or otherwise objectionable. You retain ownership of the content you submit, but you grant Alle-AI a 
                      non-exclusive, royalty-free, worldwide license to use, reproduce, modify, adapt, publish, translate, and distribute 
                      it for the purpose of providing the services.
                    </p>
                    <h3 className="text-xl font-medium mb-2">Intellectual Property</h3>
                    <p>
                      Alle-AI and its associated models are protected by copyright, trademark, and other intellectual property laws. 
                      You may not use, copy, modify, distribute, or reproduce any part of Alle-AI or its content without prior written 
                      permission from Alle-AI.
                    </p>
                  </section>
  
                  <section id="third-party-models" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">5. Third-Party Models and Services</h2>
                    <p>
                      Alle-AI integrates various third-party AI models, including ChatGPT, Bard, Claude, Dalle-E, Stable Difusion, 
                      Midjourney, and others. While we strive to provide the best user experience, we do not guarantee the availability, 
                      accuracy, or performance of these models. The providers of these AI models also operate these models on their 
                      respective platforms. The AI models we provide on Alle-AI run on similar engines as the models on their respective 
                      platforms but may not be identical to the versions hosted on their respective platforms. We have tailored their 
                      implementations to suit the Alle-AI environment while maintaining their high-quality performance.
                    </p>
                  </section>
  
                  <section id="limitation-of-liability" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
                    <p>
                      Alle-AI provides the platform on an &quot;as-is&quot; and &quot;as-available&quot; basis. We do not make any warranties, express or implied, 
                      regarding the platform&apos;s reliability, accuracy, availability, fitness for a particular purpose, or non-infringement. 
                      We shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages arising out 
                      of or in connection with your use of Alle-AI.
                    </p>
                  </section>
  
                  <section id="indemnification" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">7. Indemnification</h2>
                    <p>
                      You agree to indemnify and hold Alle-AI, its officers, directors, employees, and affiliates harmless from any claims, 
                      losses, damages, liabilities, costs, and expenses (including attorneys&apos; fees) arising out of or in connection with your 
                      use of Alle-AI, violation of these Terms, or infringement of any rights of another person or entity.
                    </p>
                  </section>
  
                  <section id="termination" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                    <p>
                      Alle-AI reserves the right to suspend or terminate your access to the platform at any time for any reason, including 
                      if you violate these Terms. Upon termination, all provisions that would reasonably be expected to survive termination 
                      shall remain in effect.
                    </p>
                  </section>
  
                  <section id="contact-information" className="mb-10">
                    <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
                    <p>
                      If you have any questions or concerns regarding these Terms or Alle-AI, you may contact us at{' '}
                      <Link href="mailto:contact@alle-ai.com" className="text-primary hover:underline">contact@alle-ai.com</Link>.
                    </p>
                  </section>
  
                  <p className="mt-8 text-muted-foreground">
                    By using Alle-AI, you signify your agreement to these Terms. Thank you for using Alle-AI, and we hope you enjoy 
                    your creative journey with the Generative AI models on our platform!
                  </p>
  
                  {/* Link to Privacy Policy */}
                  <div className="mt-6">
                    <p className="text-center">
                      <Link href="/privacy-policy" className="text-primary hover:underline">
                        See our Privacy Policy
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