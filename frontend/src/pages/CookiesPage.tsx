import { PublicLayout } from "@/components/layout/PublicLayout";
import { Linkedin } from "lucide-react";

export default function CookiesPage() {
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
              Cookie Policy
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
              <h2 className="text-2xl font-bold text-foreground mb-4">1. What Are Cookies?</h2>
              <p className="text-muted-foreground mb-6">
                Cookies are small text files that are stored on your device when you visit a website. 
                They help the website remember information about your visit, which makes your next visit 
                easier and the site more useful to you.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Cookies</h2>
              <p className="text-muted-foreground mb-4">
                PostGenix uses cookies and similar technologies for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
                <li><strong>Authentication:</strong> Keep you logged in during your session</li>
                <li><strong>Preferences:</strong> Remember your settings like theme and language</li>
                <li><strong>Analytics:</strong> Understand how users interact with our Service</li>
                <li><strong>Performance:</strong> Improve speed and optimize user experience</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">3.1 Strictly Necessary Cookies</h3>
              <p className="text-muted-foreground mb-4">
                These cookies are essential for the website to function. They cannot be switched off. 
                They are usually set in response to actions like logging in or filling in forms.
              </p>
              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Examples:</strong> Session cookies, authentication tokens, CSRF protection
                </p>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">3.2 Functional Cookies</h3>
              <p className="text-muted-foreground mb-4">
                These cookies enable enhanced functionality and personalization, such as remembering 
                your preferences and settings.
              </p>
              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Examples:</strong> Theme preference (light/dark mode), language settings
                </p>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">3.3 Analytics Cookies</h3>
              <p className="text-muted-foreground mb-4">
                These cookies help us understand how visitors interact with our website by collecting 
                and reporting information anonymously.
              </p>
              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Examples:</strong> Page views, time on site, navigation paths
                </p>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-4">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Some cookies are placed by third-party services that appear on our pages:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li><strong>Analytics providers</strong> (e.g., Google Analytics) for usage statistics</li>
                <li><strong>Payment processors</strong> for secure transactions</li>
                <li><strong>Support chat</strong> for customer service functionality</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">5. Cookie Duration</h2>
              <p className="text-muted-foreground mb-4">
                Cookies can be either session-based or persistent:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain for a set period (e.g., 30 days to 1 year)</li>
              </ul>

              <h2 className="text-2xl font-bold text-foreground mb-4">6. Managing Cookies</h2>
              <p className="text-muted-foreground mb-4">
                You can control and manage cookies in several ways:
              </p>
              <h3 className="text-xl font-semibold text-foreground mb-3">Browser Settings</h3>
              <p className="text-muted-foreground mb-4">
                Most browsers allow you to view, delete, and block cookies. Note that blocking all 
                cookies may affect the functionality of many websites.
              </p>
              <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Our Cookie Preferences</h3>
              <p className="text-muted-foreground mb-6">
                When you first visit our site, you'll see a cookie consent banner where you can 
                choose which types of cookies to accept. You can update these preferences at any 
                time in your account settings.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">7. Do Not Track</h2>
              <p className="text-muted-foreground mb-6">
                Some browsers have a "Do Not Track" feature that signals to websites that you do not 
                want your online activity tracked. We honor Do Not Track signals when possible.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">8. Updates to This Policy</h2>
              <p className="text-muted-foreground mb-6">
                We may update this Cookie Policy from time to time. Any changes will be posted on 
                this page with an updated revision date.
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about our use of cookies, please contact us at:
              </p>
              <p className="text-accent mt-2">privacy@PostGenix.com</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
