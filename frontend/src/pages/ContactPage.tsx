import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Linkedin, Mail, MessageSquare, HelpCircle, Clock } from "lucide-react";

const contactOptions = [
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Chat with me directly in real-time",
    action: "Start Chat",
    availability: "Available 24/7"
  },
  {
    icon: Mail,
    title: "Email Me",
    description: "Send me an email and I'll respond as soon as possible",
    action: "hello@PostGenix.com",
    availability: "Usually within 24h"
  },
  {
    icon: HelpCircle,
    title: "Knowledge Base",
    description: "Browse helpful guides and tips",
    action: "Visit Guides",
    availability: "Self-service"
  }
];

export default function ContactPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Linkedin className="w-4 h-4" />
              <span className="text-sm font-medium">Get in Touch</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              I'd Love to
              <span className="text-gradient"> Hear From You</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether it’s a question, feedback, or a project idea, feel free to reach out.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="pb-20">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {contactOptions.map((option, index) => (
              <div key={index} className="glass rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                  <option.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{option.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3 h-3" />
                  {option.availability}
                </div>
                <Button variant={index === 0 ? "accent" : "outline"} className="w-full">
                  {option.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-secondary/30">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Send Me a Message
              </h2>
              <p className="text-muted-foreground">
                Fill out the form below and I'll get back to you as soon as I can.
              </p>
            </div>
            <form className="glass rounded-2xl p-8 lg:p-12 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  placeholder="Tell me how I can help..."
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-accent focus:outline-none resize-none"
                />
              </div>
              <Button variant="accent" size="lg" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
