import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import {
  Ghost,
  Shield,
  Sparkles,
  Send,
  Lock,
  Eye,
  CheckCircle2,
  ArrowRight,
  Play,
  Star,
  Quote,
  ChevronRight,
  Linkedin,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI LinkedIn Writer",
    description:
      "Generate high-quality, LinkedIn-ready posts in seconds with AI that adapts to your professional voice.",
  },
  {
    icon: Send,
    title: "LinkedIn-Ready Publishing (Coming Soon)",
    description:
      "Create perfectly formatted posts you can copy or export instantly. Direct LinkedIn publishing and scheduling are coming soon.",
  },
  {
    icon: Shield,
    title: "Content Ownership Signals",
    description:
      "Watermarks, timestamps, and attribution layers help signal authorship and discourage content copying.",
  },
  {
    icon: Lock,
    title: "Private Content Portfolio",
    description:
      "Save, organize, and showcase your best LinkedIn posts in a secure personal portfolio you fully control.",
  },
];

const steps = [
  {
    number: "01",
    title: "Enter Your Idea",
    description:
      "Share a thought, lesson, or story you want to post on LinkedIn.",
  },
  {
    number: "02",
    title: "AI Crafts the Post",
    description:
      "Get a structured, engagement-optimized LinkedIn post tailored to your tone.",
  },
  {
    number: "03",
    title: "Post or Save",
    description:
      "Copy and post on LinkedIn instantly, or save it to your portfolio. Direct LinkedIn integration is coming soon.",
  },
];

const testimonials = [
  {
    quote:
      "PostGenix helped me stay consistent on LinkedIn without overthinking every post.",
    author: "Early Beta User",
    role: "CS Student",
    avatar: "EB",
  },
  {
    quote:
      "I finally have one place where all my LinkedIn content lives.",
    author: "Early Creator",
    role: "Founder",
    avatar: "EC",
  },
  {
    quote:
      "The portfolio idea makes this more than just another AI writer.",
    author: "Beta Tester",
    role: "Content Enthusiast",
    avatar: "BT",
  },
];

const faqs = [
  {
    question: "How does the AI write LinkedIn posts?",
    answer:
      "The AI is optimized for LinkedIn-style writing, focusing on hooks, clarity, and storytelling patterns that perform well on the platform.",
  },
  {
    question: "Can I connect my LinkedIn account?",
    answer:
      "LinkedIn integration is coming soon. For now, you can easily copy or export your posts and publish them manually.",
  },
  {
    question: "What is a content portfolio?",
    answer:
      "Your portfolio is a private collection of all the posts you create — helping you track ideas, reuse winning content, and stay consistent.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The free plan lets you generate a limited number of LinkedIn-ready posts each day. You can upgrade anytime.",
  },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="section-container relative z-10 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
              <Linkedin className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                AI-Powered LinkedIn Writing Tool
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              Write Better LinkedIn Posts
              <br />
              <span className="text-gradient-accent">Consistently.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Create LinkedIn-ready posts with AI and store them in your personal content portfolio.
              Direct LinkedIn publishing is coming soon.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="group">
                  Start Writing for LinkedIn
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/portfolio/demo">
                <Button variant="heroOutline" size="xl" className="group">
                  <Play className="w-5 h-5" />
                  View Demo Portfolio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Built for LinkedIn Creators
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to write, save, and refine LinkedIn content — without complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="editorial-card">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-32">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              A simple workflow designed for consistency.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center lg:text-left">
                <div className="text-6xl font-bold text-accent/10 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 right-0 translate-x-1/2">
                    <ChevronRight className="w-8 h-8 text-accent/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 lg:py-32">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free. Upgrade when you post more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="editorial-card">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-6">PKR 0</div>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span>Limited AI-generated posts</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span>Basic content portfolio</span>
                </li>
              </ul>
              <Link to="/signup">
                <Button variant="outline" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            </div>

            <div className="editorial-card border-accent/50 bg-accent/5 relative">
              <div className="badge-premium absolute -top-3 right-4">
                <Star className="w-3 h-3" /> Popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">PKR 2,000</div>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span>Unlimited post generation</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span>Advanced portfolio features</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span>Early access to LinkedIn integration</span>
                </li>
              </ul>
              <Link to="/signup">
                <Button variant="accent" className="w-full">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              FAQs
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="editorial-card cursor-pointer">
                <summary className="flex items-center justify-between font-medium">
                  {faq.question}
                  <ChevronRight className="w-5 h-5" />
                </summary>
                <p className="mt-4 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
        <div className="section-container text-center">
          <Ghost className="w-16 h-16 text-accent mx-auto mb-8" />
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Build Your LinkedIn Content Portfolio
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Write consistently, save your ideas, and grow your LinkedIn presence.
            Direct LinkedIn integration is coming soon.
          </p>
          <Link to="/signup">
            <Button variant="accent" size="xl">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
