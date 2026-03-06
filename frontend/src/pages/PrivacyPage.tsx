import { PublicLayout } from "@/components/layout/PublicLayout";
import { Linkedin } from "lucide-react";

export default function PrivacyPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Linkedin className="w-4 h-4" />
              <span className="text-sm font-medium">Legal</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: January 15, 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto glass rounded-2xl p-8 lg:p-12">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-6">
                PostGenix Inc. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our LinkedIn 
                post writing and portfolio protection service ("Service").
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3">2.1 Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                We may collect personal information that you voluntarily provide when using our Service, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Name and email address</li>
                <li>LinkedIn profile information (when connected)</li>
                <li>Payment information (processed securely through our payment provider)</li>
                <li>Content you create using our AI writing tools</li>
                <li>Portfolio content and settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">2.2 Automatically Collected Information</h3>
              <p className="text-muted-foreground mb-6">
                When you access our Service, we may automatically collect certain information, including device 
                information, IP address, browser type, and usage patterns to improve our Service.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use the collected information for:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Providing and maintaining our Service</li>
                <li>Processing your transactions</li>
                <li>Improving our AI writing capabilities</li>
                <li>Protecting your content from plagiarism</li>
                <li>Sending you service-related communications</li>
                <li>Analyzing usage patterns to enhance user experience</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. Content Ownership & Protection</h2>
              <p className="text-muted-foreground mb-6">
                You retain full ownership of all content you create using PostGenix. We do not claim any 
                intellectual property rights over your LinkedIn posts, articles, or portfolio content. Our 
                AI tools assist in content creation, but the resulting work belongs entirely to you.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Sharing</h2>
              <p className="text-muted-foreground mb-4">We may share your information with:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Service providers who assist in operating our platform</li>
                <li>Analytics partners to understand usage patterns</li>
                <li>Legal authorities when required by law</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                We never sell your personal information or content to third parties.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. Data Security</h2>
              <p className="text-muted-foreground mb-6">
                We implement industry-standard security measures including encryption, secure servers, 
                and regular security audits to protect your data. However, no method of transmission 
                over the internet is 100% secure.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your content</li>
                <li>Opt-out of marketing communications</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">8. Cookies</h2>
              <p className="text-muted-foreground mb-6">
                We use cookies and similar tracking technologies to enhance your experience. You can 
                control cookie preferences through your browser settings. For more details, see our 
                Cookie Policy.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground mb-6">
                Our Service is not intended for users under 18 years of age. We do not knowingly 
                collect information from children.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground mb-6">
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-accent mt-2">privacy@PostGenix.com</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
