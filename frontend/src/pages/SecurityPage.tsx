import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Ban,
  Camera,
  Copy,
  Linkedin,
} from "lucide-react";

const protectionLayers = [
  {
    icon: Copy,
    title: "Copy Protection",
    description: "Text selection and right-click are disabled for visitors, preventing easy copying of your LinkedIn posts (Coming Soon).",
  },
  {
    icon: Camera,
    title: "Screenshot Deterrent",
    description: "Overlay messages appear when screenshots are attempted, discouraging casual content theft (Coming Soon).",
  },
  {
    icon: Fingerprint,
    title: "Dynamic Watermarks",
    description: "Your name and PostGenix branding are subtly overlaid on all content, proving ownership (Coming Soon).",
  },
  {
    icon: EyeOff,
    title: "Partial Content Blur",
    description: "Non-authenticated visitors see blurred content, encouraging legitimate engagement (Coming Soon).",
  },
  {
    icon: FileCheck,
    title: "Timestamp Verification",
    description: "All LinkedIn posts are timestamped and stored, providing proof of original authorship (Coming Soon).",
  },
  {
    icon: Lock,
    title: "Secure Portfolio URLs",
    description: "Your portfolio has unique, secure URLs that are difficult to scrape or replicate (Coming Soon).",
  },
];


const authorBenefits = [
  "Full access to your own LinkedIn posts without any restrictions",
  "Easy copying for repurposing your content",
  "Complete control over what's public and private",
  "Analytics on who's viewing your portfolio",
  "Instant removal of any content",
  "Export all your posts anytime",
];

export default function SecurityPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 bg-gradient-subtle">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">LinkedIn Content Security</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
              Your LinkedIn Posts Are
              <br />
              <span className="text-gradient-accent">Protected</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up delay-200">
              Tired of seeing your viral LinkedIn posts copied without credit? PostGenix uses multiple 
              layers of protection to ensure your content stays yours.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 lg:py-32">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive mb-6">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">The Problem</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                LinkedIn Content Theft is Rampant
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Every day, LinkedIn creators see their posts copied word-for-word by others 
                with larger followings. Their insights are stolen, their stories are plagiarized, 
                and they get zero credit.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-destructive">•</span>
                  <span>Viral LinkedIn posts are copied within hours of posting</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive">•</span>
                  <span>Copycats often get more engagement than the original creator</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive">•</span>
                  <span>LinkedIn offers no built-in protection against plagiarism</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="editorial-card p-8 border-destructive/20">
                <div className="flex items-center gap-3 mb-4">
                  <Ban className="w-8 h-8 text-destructive" />
                  <span className="text-xl font-semibold text-destructive">Unprotected Content</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Without protection, your viral LinkedIn posts can be copied in seconds, 
                  reposted by influencers, and go viral under someone else's name.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 border border-dashed border-destructive/30">
                  <p className="text-sm text-muted-foreground italic">
                    "I posted about my startup journey and it got 50K impressions. Two days later, 
                    I saw the exact same post from an 'influencer' with 500K followers. Nothing I could do."
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">— A frustrated LinkedIn creator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protection Layers Section */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 mb-6">
              <Lock className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Our Solution</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              6 Layers of Protection
            </h2>
            <p className="text-lg text-muted-foreground">
              Multiple security measures work together to keep your LinkedIn content safe.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {protectionLayers.map((layer, index) => (
              <div
                key={index}
                className="editorial-card animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <layer.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{layer.title}</h3>
                <p className="text-muted-foreground text-sm">{layer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author Experience Section */}
      <section className="py-20 lg:py-32">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="editorial-card p-8 border-accent/30 bg-accent/5">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                  <span className="text-xl font-semibold text-foreground">Author Access</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  As the author, you have complete, unrestricted access to all your LinkedIn posts. 
                  No protection measures affect your experience.
                </p>
                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Linkedin className="w-4 h-4 text-accent" />
                    <p className="text-sm text-foreground font-medium">Your LinkedIn Post</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-serif">
                    "I quit my 6-figure job last year. Everyone thought I was crazy. 
                    But here's what happened next that nobody expected..."
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-accent">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Full access • Copy enabled • No restrictions</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 mb-6">
                <Eye className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Author Benefits</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                You're Never Restricted
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Protection is for visitors, not for you. As the author, you maintain 
                complete control and access to your LinkedIn content at all times.
              </p>
              <ul className="space-y-3">
                {authorBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
        <div className="section-container text-center">
          <Shield className="w-16 h-16 text-accent mx-auto mb-8 animate-float" />
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Protect Your LinkedIn Posts Today
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Don't wait until your viral post is stolen. Start using PostGenix and 
            ensure your LinkedIn content stays yours — forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="accent" size="xl" className="group">
                Start Writing Securely
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="glass" size="xl">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
