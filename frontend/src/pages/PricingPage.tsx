import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { CheckCircle2, Star, ArrowRight, Zap, HelpCircle, Linkedin } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started on LinkedIn",
    price: "0",
    priceYearly: "0",
    popular: false,
    features: [
      "5 AI-generated LinkedIn posts per day",
      "Basic portfolio",
      "Standard copy protection",
      "LinkedIn-ready Publishing",
      "Basic analytics",
    ],
    limitations: [
      "Limited storage",
      "PostGenix branding on portfolio",
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
  },
  {
    name: "Pro",
    description: "For serious LinkedIn creators",
    price: "2,000",
    priceYearly: "0",
    popular: true,
    features: [
      "Unlimited AI-generated LinkedIn posts",
      "Premium portfolio with custom domain",
      "Advanced theft protection",
      "Post scheduling & analytics (Coming Soon)",
      "Priority support",
      "Remove PostGenix branding",
      "Early Access to Social Media Integrations",
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    ctaVariant: "accent" as const,
  },
];


const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes! You can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and digital wallets through our secure payment processor.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Absolutely! You can upgrade from Free to Pro at any time. We'll prorate your subscription.",
  },

];

export default function PricingPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 bg-gradient-subtle">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in">
              <Linkedin className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Simple Pricing</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
              Start Free, Scale
              <br />
              <span className="text-gradient-accent">Your LinkedIn Presence</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-up delay-200">
              No hidden fees. No surprises. Just simple pricing that grows with your LinkedIn success.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 lg:py-32">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`editorial-card relative ${plan.popular ? "border-accent/50 bg-accent/5" : ""
                  } animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="badge-premium absolute -top-3 right-4">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-foreground">PKR {plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {/* {plan.priceYearly !== plan.price && (
                    <p className="text-sm text-accent mt-2">
                      PKR {plan.priceYearly}/month with yearly billing (save 10%)
                    </p>
                  )} */}
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start gap-3 opacity-60">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                      </div>
                      <span className="text-muted-foreground">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Link to="/signup">
                  <Button variant={plan.ctaVariant} size="lg" className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Enterprise CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Need a custom solution for your team or agency?
            </p>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Compare Plans
            </h2>
            <p className="text-lg text-muted-foreground">
              See what's included in each plan at a glance.
            </p>
          </div>

          {/* Full Centering Fix */}
          <div className="max-w-5xl mx-auto flex justify-between">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 px-4 font-medium text-foreground text-center">
                    Feature
                  </th>
                  <th className="py-4 px-4 font-medium text-foreground text-center">
                    Free
                  </th>
                  <th className="py-4 px-4 font-medium text-accent text-center">
                    Pro
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">

                <tr>
                  <td className="py-4 px-4 text-foreground text-center">AI LinkedIn posts</td>
                  <td className="py-4 px-4 text-center text-muted-foreground">5/day</td>
                  <td className="py-4 px-4 text-center text-foreground font-medium">Unlimited</td>
                </tr>

                <tr>
                  <td className="py-4 px-4 text-foreground text-center">Portfolio</td>
                  <td className="py-4 px-4 text-center text-muted-foreground">Basic</td>
                  <td className="py-4 px-4 text-center text-foreground font-medium">Premium + Custom Domain</td>
                </tr>

                <tr>
                  <td className="py-4 px-4 text-foreground text-center">Copy protection</td>
                  <td className="py-4 px-4 text-center text-muted-foreground">Standard</td>
                  <td className="py-4 px-4 text-center text-foreground font-medium">Advanced</td>
                </tr>

                <tr>
                  <td className="py-4 px-4 text-foreground text-center">LinkedIn publishing</td>
                  <td className="py-4 px-4 text-center text-muted-foreground">No Sheduling</td>
                  <td className="py-4 px-4 text-center text-foreground font-medium">Sheduling Comming Soon</td>
                </tr>

                <tr>
                  <td className="py-4 px-4 text-foreground text-center">Analytics</td>
                  <td className="py-4 px-4 text-center text-muted-foreground">Basic</td>
                  <td className="py-4 px-4 text-center text-foreground font-medium">Advanced</td>
                </tr>

                <tr>
                  <td className="py-4 px-4 text-foreground text-center">Remove branding</td>
                  <td className="py-4 px-4 text-center text-muted-foreground">No</td>
                  <td className="py-4 px-4 text-center text-foreground font-medium">Yes</td>
                </tr>


              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 lg:py-32">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
              <HelpCircle className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">FAQ</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Common Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group editorial-card cursor-pointer">
                <summary className="flex items-center justify-between font-medium text-foreground list-none">
                  {faq.question}
                  <span className="text-accent transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
        <div className="section-container text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Start Growing on LinkedIn Today
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Join thousands of LinkedIn creators who trust PostGenix. No credit card required.
          </p>
          <Link to="/signup">
            <Button variant="accent" size="xl" className="group">
              Get Started Free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
