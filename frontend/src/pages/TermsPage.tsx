import { PublicLayout } from "@/components/layout/PublicLayout";
import { Linkedin } from "lucide-react";

export default function TermsPage() {
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
              Terms of Service
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
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-6">
                By accessing or using PostGenix ("Service"), you agree to be bound by these Terms of Service. 
                If you disagree with any part of these terms, you may not access the Service.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-6">
                PostGenix provides AI-powered LinkedIn post writing tools and secure portfolio protection 
                features. Our Service helps you create, manage, and protect your professional content.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3">3.1 Registration</h3>
              <p className="text-muted-foreground mb-4">
                You must register for an account to access certain features. You agree to provide accurate 
                information and keep your account credentials secure.
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-3">3.2 Account Responsibility</h3>
              <p className="text-muted-foreground mb-6">
                You are responsible for all activities that occur under your account. Notify us immediately 
                of any unauthorized use.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. Content Ownership</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3">4.1 Your Content</h3>
              <p className="text-muted-foreground mb-4">
                You retain all ownership rights to content you create using our Service. PostGenix claims 
                no intellectual property rights over your LinkedIn posts, articles, or portfolio content.
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-3">4.2 License Grant</h3>
              <p className="text-muted-foreground mb-6">
                By using our Service, you grant us a limited license to host, display, and process your 
                content solely for the purpose of providing the Service to you.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. AI-Generated Content</h2>
              <p className="text-muted-foreground mb-6">
                Our AI tools assist in content creation. You are responsible for reviewing and editing 
                AI-generated content before publishing. You represent that any content you publish is 
                your own work and does not infringe on others' rights.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li>Use the Service for any unlawful purpose</li>
                <li>Generate content that is defamatory, obscene, or harmful</li>
                <li>Attempt to bypass our content protection features</li>
                <li>Plagiarize or steal content from other users</li>
                <li>Violate LinkedIn's terms of service</li>
                <li>Interfere with the Service's operation</li>
                <li>Share your account credentials with others</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Subscription & Payments</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3">7.1 Billing</h3>
              <p className="text-muted-foreground mb-4">
                Pro subscriptions are billed monthly or yearly as selected. All payments are processed 
                securely through our payment provider.
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-3">7.2 Refunds</h3>
              <p className="text-muted-foreground mb-4">
                We offer a 14-day money-back guarantee for new Pro subscriptions. After this period, 
                refunds are provided at our discretion.
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-3">7.3 Cancellation</h3>
              <p className="text-muted-foreground mb-6">
                You may cancel your subscription at any time. Access continues until the end of your 
                current billing period.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">8. Portfolio Protection</h2>
              <p className="text-muted-foreground mb-6">
                We implement various measures to protect your portfolio content from unauthorized copying. 
                While we strive to prevent plagiarism, we cannot guarantee complete protection against 
                all forms of content theft.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-6">
                PostGenix is provided "as is" without warranties of any kind. We are not liable for 
                any indirect, incidental, or consequential damages arising from your use of the Service.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">10. Termination</h2>
              <p className="text-muted-foreground mb-6">
                We may terminate or suspend your account immediately for violations of these Terms. 
                Upon termination, your right to use the Service ceases immediately.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">11. Changes to Terms</h2>
              <p className="text-muted-foreground mb-6">
                We reserve the right to modify these Terms at any time. We will notify users of 
                significant changes via email or through the Service.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground mb-6">
                These Terms are governed by the laws of the State of California, United States, 
                without regard to conflict of law provisions.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">13. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these Terms, contact us at:
              </p>
              <p className="text-accent mt-2">legal@PostGenix.com</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
