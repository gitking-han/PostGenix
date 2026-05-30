import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PenTool, Sparkles, Send, ArrowRight, CheckCircle2, Linkedin, Edit, BarChart3 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PenTool,
    title: "Share Your Idea",
    description: "Tell our AI what you want to share — a career insight, business lesson, personal story, or industry take. Be as brief or detailed as you like.",
    details: [
      "Share your expertise or experience",
      "Pitch a hot take on your industry",
      "Tell a story from your career",
    ],
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Crafts Your Post",
    description: "Our LinkedIn-trained AI creates a post optimized for engagement in your unique voice.",
    details: [
      "Scroll-stopping opening hooks",
      "Your unique tone and style",
      "Optimal format for LinkedIn",
    ],
  },
  {
    number: "03",
    icon: Edit,
    title: "Edit & Customize",
    description: "Use our distraction-free editor to refine your draft. Customize content and formatting exactly how you want it.",
    details: [
      "Rich text formatting options",
      "Add emojis and line breaks",
      "Smart hashtag suggestions",
    ],
  },
  {
    number: "04",
    icon: Send,
    title: "Publish Directly to LinkedIn",
    description: "Post directly to LinkedIn with one click. Your formatting, tone, and style are perfectly preserved.",
    details: [
      "One-click direct publishing",
      "Formatting automatically preserved",
      "Save for future reference",
    ],
  },
  {
    number: "05",
    icon: BarChart3,
    title: "Track & Grow",
    description: "Monitor engagement, track performance, and use insights to refine your strategy. Stay consistent with Brand Drift Alerts.",
    details: [
      "Advanced engagement analytics",
      "Performance insights",
      "Brand consistency tracking",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 bg-gradient-subtle">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in">
              <Linkedin className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Simple Process</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
              From Idea to Published
              <br />
              <span className="text-gradient-accent">LinkedIn Post</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up delay-200">
              Five simple steps to create, refine, and publish engaging LinkedIn content that grows your professional presence.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 lg:py-32">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-20 lg:mb-32 last:mb-0 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-1/2 top-32 bottom-0 w-px bg-border -translate-x-1/2" />
                )}

                {/* Content */}
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-accent" />
                    </div>
                    <span className="text-6xl font-bold text-accent/20">{step.number}</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                    {step.title}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                        <span className="text-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div className={`relative ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="editorial-card aspect-[4/3] flex items-center justify-center">
                    <step.icon className="w-20 h-20 text-accent/20" />
                  </div>
                  {/* Connection dot */}
                  <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-4 border-background z-10" 
                       style={{ [index % 2 === 0 ? 'right' : 'left']: '-2.5rem' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary Section */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              That's It. Publish with Confidence.
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              No complicated setup. No learning curve. Create, publish, and grow your LinkedIn presence consistently.
              PostGenix helps you stay on-brand and focused on what matters—your professional growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="group">
                  Start Drafting LinkedIn Posts
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="xl">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}