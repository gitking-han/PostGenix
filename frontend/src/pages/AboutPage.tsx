import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Linkedin, Target, Heart, Shield, Zap } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Creator-First",
    description: "Every feature I build starts with one question: does this help LinkedIn creators succeed?"
  },
  {
    icon: Heart,
    title: "Authenticity Matters",
    description: "AI assists, but your voice leads. I help you sound like you, not like a robot."
  },
  {
    icon: Shield,
    title: "Protect What's Yours",
    description: "Your content is your intellectual property. I build tools to keep it that way."
  },
  {
    icon: Zap,
    title: "Speed Without Sacrifice",
    description: "Create faster without compromising quality. Efficiency meets excellence."
  }
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Linkedin className="w-4 h-4" />
              <span className="text-sm font-medium">My Story</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Empowering LinkedIn
              <span className="text-gradient"> Creators Worldwide</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              I started PostGenix as a solo project because I saw a problem: talented professionals spending hours crafting LinkedIn content, only to have it stolen or go unnoticed. I built this platform to change that.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-secondary/30">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                My Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                To democratize professional content creation by giving every LinkedIn creator the AI tools to write compelling posts and the security to protect their original work.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                I believe your ideas deserve to be shared — and credited to you. That's why I built PostGenix as a solo project, combining AI writing assistance with content protection features.
              </p>
              <div className="flex items-center gap-4">
                <Zap className="w-12 h-12 text-accent" />
                <div>
                  <p className="text-3xl font-bold text-foreground">50,000+</p>
                  <p className="text-muted-foreground">LinkedIn creators trust PostGenix</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-8">
              <blockquote className="text-xl text-foreground italic mb-4">
                "I wanted a way to help LinkedIn creators protect their content while saving time writing. PostGenix is my solo effort to make that happen."
              </blockquote>
              <p className="text-muted-foreground">— Hanzala Rehman, Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              My Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything I build
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="glass rounded-xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solo Creator CTA Section */}
      <section className="py-20">
        <div className="section-container">
          <div className="glass rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Join My Mission
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start creating protected LinkedIn content today with my solo-built platform
            </p>
            <Link to="/signup">
              <Button variant="accent" size="lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
