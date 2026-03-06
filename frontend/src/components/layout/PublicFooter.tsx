import { Link } from "react-router-dom";
import { Ghost, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { Image } from "lucide-react";
const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Security", href: "/security" },
    { name: "How it Works", href: "/how-it-works" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    // { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
  social: [
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "GitHub", href: "#", icon: Github },
    { name: "Email", href: "#", icon: Mail },
  ],
};

export function PublicFooter() {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="section-container py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <Link to="/" className="flex items-center gap-2 mb-4">
              {/* <img src="/logo.png" alt="sitlogo" width={150} height={80} /> */}
              <Ghost className="w-8 h-8 text-accent" />
              <span className="text-xl font-bold text-foreground">
                Post<span className="text-accent">Genix</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              AI-powered LinkedIn post writing with secure portfolio protection. Own your words, protect your content.
            </p>
            <div className="flex items-center gap-3">
              {footerLinks.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                  aria-label={item.name}
                >
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PostGenix. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with care for LinkedIn creators who value their work.
          </p>
        </div>
      </div>
    </footer>
  );
}
