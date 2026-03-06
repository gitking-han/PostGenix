import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Linkedin, Calendar, Clock, User } from "lucide-react";

const posts = [
  {
    id: 1,
    title: "How I Protect My LinkedIn Posts from Being Stolen",
    author: "Hanzala Rehman",
    date: "Jan 23, 2026",
    readTime: "8 min read",
    category: "Security",
    content: `
<h1> Why Content Theft Happens </h1>
LinkedIn creators often face plagiarism because their posts are public and easy to copy.  

<h2>My Approach</h2>
- Using timestamps for every post  
- Partial content blur for non-followers  
- Dynamic watermarks on screenshots  

<h2>Lessons Learned</h2>
- Protect your posts early  
- Always maintain a personal archive  
- Educate your followers about original content
`
  },
  {
    id: 2,
    title: "5 Simple Steps to Write LinkedIn Posts that Get Noticed",
    author: "Hanzala Rehman",
    date: "Jan 22, 2026",
    readTime: "7 min read",
    category: "Content Strategy",
    content: `
<h1> Step 1: Start with a Hook</h1>
Capture attention in the first line.  

<h2> Step 2: Tell a Story</h2>
Personal stories resonate more than generic advice.  

<h2> Step 3: Keep it Scannable</h2>
Use bullet points, line breaks, and short sentences.  

<h2> Step 4: Format Smartly</h2>
Emojis, bolding, and spacing improve readability.  

<h2> Step 5: End with a Call-to-Action</h2>
Encourage engagement like comments or shares.
`
  },
  {
    id: 3,
    title: "Lessons from Building PostGenix Alone: A Solo Founder’s Guide",
    author: "Hanzala Rehman",
    date: "Jan 21, 2026",
    readTime: "10 min read",
    category: "Personal Growth",
    content: `
<h1> Time Management</h1>
Batch content creation and work in focused blocks.  

<h2> Prioritizing Features</h2>
Start with what solves the biggest pain for your users.  

<h2> Marketing Solo</h2>
Use LinkedIn and word-of-mouth to reach creators efficiently.  

<h2> Staying Motivated</h2>
Celebrate small wins and track progress consistently.
`
  }
];

export default function BlogDetailPage() {
  const { id } = useParams();
  const post = posts.find(p => p.id === Number(id));

  if (!post) return <PublicLayout><p className="text-center pt-32">Post not found.</p></PublicLayout>;

  return (
    <PublicLayout>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="section-container max-w-3xl mx-auto">
          <div className="mb-6">
            <span className="text-accent text-sm font-medium">{post.category}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2">{post.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mt-2 text-sm">
              <div className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</div>
              <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</div>
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readTime}</div>
            </div>
          </div>
          <div className="prose max-w-full text-foreground" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br />") }} />
          <div className="mt-8">
            <Link to="/blog">
              <Button variant="accent">Back to Blog</Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
