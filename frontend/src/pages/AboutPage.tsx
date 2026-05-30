import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Linkedin, Target, Heart, Shield, Zap } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Creator-First",
    description: "Every feature I build starts with one question: does this help LinkedIn creators grow their presence?"
  },
  {
    icon: Heart,
    title: "Authenticity Matters",
    description: "AI assists, but your voice leads. I help you sound like you, not like a robot."
  },
  {
    icon: Shield,
    title: "Consistency Counts",
    description: "Build trust by staying on-brand. Your audience deserves content that truly represents you."
  },
  {
    icon: Zap,
    title: "Speed Without Sacrifice",
    description: "Create faster without compromising quality. Write more, grow faster, stay consistent."
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
              I started PostGenix because I saw talented professionals spending hours crafting LinkedIn content with no consistency or strategy. I built this platform to help creators write better, publish faster, and grow their professional presence.
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
                To help every LinkedIn creator build a consistent, authentic professional presence through AI-powered writing and advanced insights.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                I believe every professional has valuable insights to share. PostGenix helps you write more, stay on-brand, and grow your influence on LinkedIn—without the guesswork.
              </p>
              {/* <div className="flex items-center gap-4">
                <Zap className="w-12 h-12 text-accent" />
                <div>
                  <p className="text-3xl font-bold text-foreground">50,000+</p>
                  <p className="text-muted-foreground">LinkedIn creators trust PostGenix</p>
                </div>
              </div> */}
            </div>
            <div className="glass rounded-2xl p-8">
              <blockquote className="text-xl text-foreground italic mb-4">
                "I wanted to help LinkedIn creators build authentic, consistent presence through AI—with all the tools they need to grow and succeed."
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
              Ready to Grow on LinkedIn?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start creating consistent, authentic LinkedIn content today. Write better, grow faster.
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
