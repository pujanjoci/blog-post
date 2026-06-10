import { getAllPosts } from "@/lib/content";
import BlogPostsList from "@/components/BlogPostsList";
import ExploreFilters from "./ExploreFilters";

export const metadata = {
  title: "Explore – GitBlog",
  description: "Browse all blog posts, search and filter by tags.",
};

export default function ExplorePage() {
  const posts = getAllPosts();

  // Collect all unique tags from posts for the tag filter
  const allTags = Array.from(
    new Set(posts.flatMap((post) => post.tags ?? []))
  ).sort();

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header / hero */}
      <section className="relative overflow-hidden border-b border-neutral-200/20 py-16 lg:py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold font-serif tracking-tight">
            Explore the Blog
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Search, filter, and discover every post — all powered by Markdown in your Git repo.
          </p>
        </div>
      </section>

      {/* Filter & post grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ExploreFilters allTags={allTags} posts={posts} />
      </section>
    </main>
  );
}