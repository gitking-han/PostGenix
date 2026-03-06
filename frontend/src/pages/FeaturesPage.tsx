import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import {
  Sparkles,
  Send,
  Shield,
  Lock,
  PenTool,
  Calendar,
  BarChart3,
  Users,
  Globe,
  Palette,
  CheckCircle2,
  ArrowRight,
  Zap,
  Eye,
  FileText,
  Settings,
  Linkedin,
  TrendingUp,
  Hash,
  MessageSquare,
} from "lucide-react";

const mainFeatures = [
  {
    icon: Sparkles,
    title: "AI LinkedIn Post Writer",
    description: "Generate viral LinkedIn posts in seconds. Our AI is trained specifically on high-performing LinkedIn content.",
    highlights: [
      "Attention-grabbing hooks that stop the scroll",
      "Story-driven posts that drive engagement",
      "Professional tone matching your voice",
      "Hashtag suggestions for maximum reach",
    ],
  },
  {
    icon: Send,
    title: "One-Click LinkedIn Publishing",
    description: "Connect your LinkedIn account and publish posts with a single click. Schedule for optimal engagement times.",
    highlights: [
      "Direct LinkedIn integration",
      "Smart scheduling based on your audience",
      "Queue management for consistent posting",
      "Posting time optimization",
    ],
  },
  {
    icon: Shield,
    title: "Content Protection",
    description: "Multiple layers of security ensure your viral posts stay yours. Deter copycats and prove ownership.",
    highlights: [
      "Dynamic watermarks",
      "Copy protection",
      "Screenshot deterrents",
      "Ownership verification",
    ],
  },
  {
    icon: Globe,
    title: "Secure Portfolio",
    description: "Showcase your best LinkedIn posts publicly without fear. Professional portfolios with built-in protection.",
    highlights: [
      "Custom portfolio URLs",
      "Editorial design",
      "Engagement analytics",
      "SEO optimization",
    ],
  },
];

const additionalFeatures = [
  { icon: Hash, title: "Smart Hashtags", description: "AI-suggested hashtags for maximum LinkedIn reach" },
  { icon: Calendar, title: "Content Calendar", description: "Plan and schedule your LinkedIn content strategy" },
  { icon: BarChart3, title: "Post Analytics", description: "Track impressions, reactions, and growth" },
  { icon: TrendingUp, title: "Engagement Insights", description: "Learn what resonates with your audience" },
  { icon: MessageSquare, title: "Hook Generator", description: "Create scroll-stopping opening lines" },
  { icon: Eye, title: "View Tracking", description: "See who's viewing your portfolio" },
  { icon: FileText, title: "Draft Management", description: "Organize and manage all your posts" },
  { icon: Settings, title: "Custom Settings", description: "Full control over your experience" },
];

export default function FeaturesPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 bg-gradient-subtle">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in">
              <Linkedin className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">LinkedIn-Focused Features</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
              Everything You Need for
              <br />
              <span className="text-gradient-accent">LinkedIn Success</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
              From AI-powered LinkedIn post writing to secure portfolios, PostGenix gives you all the tools 
              to grow your professional presence and protect your content.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 lg:py-32">
        <div className="section-container">
          <div className="space-y-20 lg:space-y-32">
            {mainFeatures.map((feature, index) => (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 mb-6">
                    <feature.icon className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent">Feature</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    {feature.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`relative ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="editorial-card aspect-video flex items-center justify-center">
                    <feature.icon className="w-24 h-24 text-accent/20" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              And So Much More
            </h2>
            <p className="text-lg text-muted-foreground">
              Every tool you need to dominate LinkedIn content creation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="editorial-card text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
        <div className="section-container text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your LinkedIn Presence?
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Start your free account today and unlock the full power of AI-driven LinkedIn content creation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="accent" size="xl" className="group">
                Get Started Free
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="glass" size="xl">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
