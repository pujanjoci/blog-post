"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Search, Tag, Calendar, ArrowRight, X, Sparkles, FolderOpen } from 'lucide-react';
import type { PostData } from '@/lib/content';

interface BlogPostsListProps {
  posts?: PostData[];
  hideFilters?: boolean;
}

export default function BlogPostsList({ posts: propPosts, hideFilters = false }: BlogPostsListProps = {}) {
  const [posts, setPosts] = useState<PostData[]>(propPosts || []);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>(propPosts || []);
  const [loading, setLoading] = useState(!propPosts);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const getImageUrl = (img?: string) => {
    if (!img) return '';
    if (img.startsWith('/') || img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    return `/images/${img}`;
  };

  // Fetch posts from API
  useEffect(() => {
    if (propPosts) {
      setPosts(propPosts);
      setFilteredPosts(propPosts);
      setLoading(false);
      return;
    }

    async function fetchPosts() {
      try {
        setLoading(true);
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error('Failed to load blog posts');
        const data = await res.json();
        setPosts(data);
        setFilteredPosts(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading posts.');
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [propPosts]);

  // Filter posts based on search query and selected tag
  useEffect(() => {
    if (propPosts) {
      setFilteredPosts(propPosts);
      return;
    }

    let result = posts;

    if (selectedTag) {
      result = result.filter(post => post.tags?.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        post =>
          post.title.toLowerCase().includes(query) ||
          post.description?.toLowerCase().includes(query) ||
          post.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredPosts(result);
  }, [searchQuery, selectedTag, posts, propPosts]);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(posts.flatMap(post => post.tags || []))
  ).sort();

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTag(null);
  };

  return (
    <div className="space-y-10 py-8">
      {/* Header and Filters Bar */}
      {!hideFilters && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="text-indigo-400 w-6 h-6 animate-pulse" />
              Latest Articles
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Explore thoughts, guides, and tutorials from the team.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4.5 w-4.5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, desc, or tags..."
              className="w-full pl-10 pr-10 py-2.5 bg-white/4 border border-white/8 hover:border-white/12 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 rounded-xl text-white placeholder-gray-500 outline-none transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tags Filter List */}
      {!hideFilters && allTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Filter by Topic
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                selectedTag === null
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                  : 'bg-white/4 border-white/5 text-gray-400 hover:text-white hover:border-white/12'
              }`}
            >
              All Topics
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
                  tag === selectedTag
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                    : 'bg-white/4 border-white/5 text-gray-400 hover:text-white hover:border-white/12'
                }`}
              >
                {tag}
                {tag === selectedTag && <X className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-300">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-6 border border-white/5 animate-pulse flex flex-col gap-4 min-h-[280px]">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="space-y-2">
                <div className="h-6 w-full bg-white/10 rounded" />
                <div className="h-6 w-2/3 bg-white/10 rounded" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-4/5 bg-white/5 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-12 bg-white/5 rounded" />
                <div className="h-5 w-16 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        /* Empty State */
        <div className="glass rounded-3xl border border-white/5 p-16 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
            <FolderOpen size={28} className="text-gray-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-200">No matching articles found</p>
            <p className="text-gray-500 text-sm mt-1 max-w-sm">
              We couldn't find any posts matching "{searchQuery}" or the selected topic.
            </p>
          </div>
          <button
            onClick={handleClearFilters}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 font-medium text-sm rounded-xl transition-all hover:border-indigo-500/50"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        /* Posts Listing */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, i) => (
            <article
              key={post.slug}
              className="glass rounded-2xl border border-white/5 hover:border-indigo-500/30 hover:bg-white/6 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col min-h-[290px] relative overflow-hidden"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Card glowing gradient hover overlay */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Thumbnail Image */}
              {post.image && (
                <div className="w-full h-44 overflow-hidden relative bg-black/20 border-b border-white/5">
                  <img
                    src={getImageUrl(post.image)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              <div className="p-6 flex flex-col flex-grow justify-between gap-4">
                {/* Meta details */}
                <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {post.date ? format(new Date(post.date), 'MMM d, yyyy') : 'No Date'}
                  </span>
                </div>

                {/* Title and Excerpt */}
                <div className="space-y-2.5 flex-grow">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                    {post.excerpt || post.description || 'No description provided.'}
                  </p>
                </div>

                {/* Footer details: Tags & Link */}
                <div className="space-y-4 pt-2 border-t border-white/5">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          onClick={hideFilters ? undefined : (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedTag(tag === selectedTag ? null : tag);
                          }}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                            !hideFilters && tag === selectedTag
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'
                          } ${hideFilters ? '' : 'cursor-pointer'}`}
                        >
                          #{tag.toLowerCase()}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-600">
                          +{post.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Read More Link */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors"
                  >
                    Read Article
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
