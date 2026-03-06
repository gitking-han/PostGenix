import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Linkedin, MapPin, Clock, Briefcase, Heart, Zap, Users, Coffee } from "lucide-react";

const benefits = [
  { icon: Heart, title: "Health & Wellness", description: "Comprehensive health, dental, and vision coverage for you and your family" },
  { icon: Zap, title: "Flexible Work", description: "Work from anywhere with flexible hours that fit your life" },
  { icon: Users, title: "Team Retreats", description: "Annual company retreats to connect and collaborate in person" },
  { icon: Coffee, title: "Learning Budget", description: "$2,000 yearly budget for courses, conferences, and books" }
];

const openPositions = [
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote (US/EU)",
    type: "Full-time",
    description: "Build beautiful, performant UIs that empower LinkedIn creators to write and protect their content."
  },
  {
    title: "AI/ML Engineer",
    department: "Engineering",
    location: "Remote (Worldwide)",
    type: "Full-time",
    description: "Develop and improve our AI writing models to help creators produce authentic, engaging content."
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote (US/EU)",
    type: "Full-time",
    description: "Design intuitive experiences that make content creation and protection seamless."
  },
  {
    title: "Content Marketing Manager",
    department: "Marketing",
    location: "Remote (Worldwide)",
    type: "Full-time",
    description: "Lead our content strategy and help grow our community of LinkedIn creators."
  },
  {
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Remote (US)",
    type: "Full-time",
    description: "Help our Pro customers succeed and get the most value from PostGenix."
  },
  {
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote (Worldwide)",
    type: "Full-time",
    description: "Scale our infrastructure to support millions of creators and their content."
  }
];

export default function CareersPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Linkedin className="w-4 h-4" />
              <span className="text-sm font-medium">Join Our Team</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Help Us Empower
              <span className="text-gradient"> LinkedIn Creators</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              We're building the future of professional content creation. Join a team that's 
              passionate about helping creators succeed and protecting their work.
            </p>
            <Button variant="accent" size="lg">
              View Open Positions
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 bg-secondary/30">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Work at PostGenix?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're building something meaningful, and we want you to be part of it
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="glass rounded-xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-20">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Culture
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Remote-First</h3>
                  <p className="text-muted-foreground">
                    We believe great work happens anywhere. Our team is distributed across 15 countries, 
                    collaborating asynchronously with intentional communication.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Creator Obsessed</h3>
                  <p className="text-muted-foreground">
                    Everyone at PostGenix uses LinkedIn actively. We eat our own cooking and deeply 
                    understand the problems we're solving.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Impact Over Hours</h3>
                  <p className="text-muted-foreground">
                    We measure success by outcomes, not time in seat. Work smart, make an impact, 
                    and enjoy your life outside of work.
                  </p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-accent/5 rounded-xl">
                  <p className="text-4xl font-bold text-accent mb-2">50+</p>
                  <p className="text-muted-foreground text-sm">Team Members</p>
                </div>
                <div className="text-center p-6 bg-accent/5 rounded-xl">
                  <p className="text-4xl font-bold text-accent mb-2">15</p>
                  <p className="text-muted-foreground text-sm">Countries</p>
                </div>
                <div className="text-center p-6 bg-accent/5 rounded-xl">
                  <p className="text-4xl font-bold text-accent mb-2">100%</p>
                  <p className="text-muted-foreground text-sm">Remote</p>
                </div>
                <div className="text-center p-6 bg-accent/5 rounded-xl">
                  <p className="text-4xl font-bold text-accent mb-2">4.9</p>
                  <p className="text-muted-foreground text-sm">Glassdoor Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-secondary/30">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find your next opportunity with us
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {openPositions.map((position, index) => (
              <div key={index} className="glass rounded-xl p-6 hover:border-accent/50 transition-colors cursor-pointer group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                      {position.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-3">{position.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="shrink-0">
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="section-container">
          <div className="glass rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Don't See Your Role?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're always looking for talented people. Send us your resume and tell us how you can contribute.
            </p>
            <Button variant="accent" size="lg">
              Send General Application
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
