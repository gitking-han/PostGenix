import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Linkedin, Calendar, Clock, ArrowRight, User } from "lucide-react";

const posts = [
  {
    id: 1,
    title: "How I Protect My LinkedIn Posts from Being Stolen",
    excerpt: "Sharing my journey as a solo creator building PostGenix, and how I protect my posts from plagiarism.",
    author: "Hanzala Rehman",
    date: "Jan 23, 2026",
    readTime: "8 min read",
    category: "Security"
  },
  {
    id: 2,
    title: "5 Simple Steps to Write LinkedIn Posts that Get Noticed",
    excerpt: "A step-by-step formula I use to make LinkedIn posts that capture attention and drive engagement.",
    author: "Hanzala Rehman",
    date: "Jan 22, 2026",
    readTime: "7 min read",
    category: "Content Strategy"
  },
  {
    id: 3,
    title: "Lessons from Building PostGenix Alone: A Solo Founder’s Guide",
    excerpt: "What I learned building PostGenix as a solo founder and tips for managing everything alone.",
    author: "Hanzala Rehman",
    date: "Jan 21, 2026",
    readTime: "10 min read",
    category: "Personal Growth"
  }
];

const categories = ["All", "Security", "Content Strategy", "Personal Growth"];

export default function BlogPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Linkedin className="w-4 h-4" />
              <span className="text-sm font-medium">PostGenix Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Insights for
              <span className="text-gradient"> LinkedIn Creators</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tips, strategies, and personal lessons from a solo founder building PostGenix.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-12">
        <div className="section-container">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0 
                    ? "bg-accent text-accent-foreground" 
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20">
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link to={`/blog/${post.id}`} key={post.id} className="group">
                <article className="glass rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                    <Linkedin className="w-12 h-12 text-accent/30 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-6">
                    <span className="text-accent text-xs font-medium">{post.category}</span>
                    <h3 className="text-lg font-semibold text-foreground mt-2 mb-3 group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.author}</span>
                      <div className="flex items-center gap-3">
                        <span>{post.date}</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
