import Link from "next/link";
import { ArrowRight, GitBranch, Zap, Shield, Code2 } from "lucide-react";
import BlogPostsList from "@/components/BlogPostsList";
import { getAllPosts } from "@/lib/content";
import { format } from "date-fns";

const features = [
  {
    icon: GitBranch,
    title: "Git-Powered",
    description: "Every post is a Markdown file committed directly to your GitHub repository. Your content lives in git — always versioned, always yours.",
  },
  {
    icon: Zap,
    title: "Instant Deploys",
    description: "Save a post in the admin panel and your hosting provider (Vercel/Netlify) automatically picks up the new commit and rebuilds.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "GitHub tokens are never exposed to the browser. All API calls happen server-side via Next.js Server Actions.",
  },
  {
    icon: Code2,
    title: "Zero Database",
    description: "No Postgres, no MongoDB, no maintenance. Your GitHub repo is the single source of truth for all blog content.",
  },
];

export default function Home() {
  const posts = getAllPosts();
  // Select the post with the latest date (the first post in the sorted array)
  const featuredPost = posts[0];

  const getImageUrl = (img?: string) => {
    if (!img) return '';
    if (img.startsWith('/') || img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    return `/images/${img}`;
  };

  return (
    <>
      {/* Hero Section - Full Screen Height */}
      <section className="relative overflow-hidden flex items-center min-h-[calc(100vh-6rem)] py-12 bg-gradient-to-b from-purple-950/30 via-black/30 to-[#0a0a0f] bottom-10 border-b border-neutral-200/20">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1400px] mx-auto animate-fade-in-up px-4 sm:px-6 lg:px-8">
          {featuredPost ? (
            <div className="w-full flex flex-col lg:flex-row min-h-[500px] relative group gap-8 lg:gap-16 items-center">
              {/* Left Side: Post Details */}
              <div className="w-full lg:w-[45%] flex flex-col justify-center items-start gap-6 bg-transparent">
                {/* Category tag pill */}
                <span className="px-4 py-1.5 border border-white/20 rounded-full text-[10px] tracking-widest font-semibold uppercase text-gray-300 bg-white/5">
                  {featuredPost.tags?.[0]}
                </span>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight leading-tight text-white text-left mt-2 max-w-xl">
                  {featuredPost.title}
                </h1>

                {/* Author Avatar & info */}
                <div className="flex items-center gap-3.5 mt-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/25">
                    {(featuredPost.author || 'PJ')[0]}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium text-white">{featuredPost.author || 'Pujan Joshi'}</span>
                    <span className="text-xs text-gray-500">
                      {featuredPost.date ? format(new Date(featuredPost.date), 'MMMM d, yyyy') : ''}
                    </span>
                  </div>
                </div>

                {/* Divider Line */}
                <hr className="w-12 border-t border-white/20 my-1 self-start" />

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-light text-left line-clamp-3 max-w-md">
                  {featuredPost.excerpt || featuredPost.description}
                </p>

                {/* Outlined Read More Button */}
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center justify-center px-8 py-3 border border-white text-[10px] tracking-widest font-semibold uppercase hover:bg-white hover:text-black transition-all duration-300 mt-2 text-white font-mono"
                >
                  Read More
                </Link>
              </div>

              {/* Right Side: Cover Image */}
              <div className="w-full lg:w-[60%] md:left-20 md:top-20 relative min-h-[400px] lg:min-h-[700px] self-stretch overflow-hidden bg-black/20">
                {featuredPost.image ? (
                  <img
                    src={getImageUrl(featuredPost.image)}
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 flex items-center justify-center text-gray-500 text-sm">
                    No cover image
                  </div>
                )}
                {/* Overlay glow on hover */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ) : (
            // Fallback when no posts exist
            <div className="flex flex-col items-center max-w-3xl mx-auto gap-6 text-center">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none text-white">
                Welcome to MYBlogs
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                Start writing your first blog post today.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Blog Listing */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <BlogPostsList />
        </div>
      </section>
    </>
  );
}