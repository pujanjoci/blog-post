"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import BlogPostsList from "@/components/BlogPostsList";
import type { PostData } from "@/lib/content"; // adjust the import path to your type

interface Props {
  allTags: string[];
  posts: PostData[];
}

export default function ExploreFilters({ allTags, posts }: Props) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const filteredPosts = useMemo(() => {
    let result = posts;

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedTag) {
      result = result.filter((post) => post.tags?.includes(selectedTag));
    }

    return result;
  }, [posts, search, selectedTag]);

  return (
    <div className="space-y-8">
      {/* Search + Tag bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Tag pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedTag("")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedTag === ""
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                selectedTag === tag
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white/5 border-white/10 text-gray-300 hover:border-white/20"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      <p className="text-sm text-gray-500">
        {filteredPosts.length === posts.length
          ? `Showing all ${posts.length} posts`
          : `Found ${filteredPosts.length} post${filteredPosts.length !== 1 ? "s" : ""}`}
      </p>

      {/* Blog posts list (re‑use the component from the home page) */}
      <BlogPostsList posts={filteredPosts} hideFilters={true} />
    </div>
  );
}