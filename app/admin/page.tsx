"use client";

import { useEffect, useState } from 'react';
import type { GitHubPost } from '@/lib/github';
import {
  fetchPostsFromGitHub,
  deletePostFromGitHub,
} from '@/lib/github';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Plus, Edit3, Trash2, RefreshCw,
  FileText, AlertCircle,
} from 'lucide-react';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<GitHubPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPostsFromGitHub();
      setPosts(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message ?? 'Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(slug: string, sha?: string) {
    if (!sha) return;
    if (!window.confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setDeletingSlug(slug);
    setError('');
    try {
      await deletePostFromGitHub(slug, sha);
      await loadPosts();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Failed to delete post.');
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Posts</h1>
          <p className="text-gray-500 text-sm mt-1">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} in repository
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadPosts}
            disabled={loading}
            className="p-2.5 glass border border-white/10 hover:border-white/20 rounded-xl text-gray-400 hover:text-white transition-all disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/admin/edit/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
          >
            <Plus size={16} />
            New Post
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-300">Error</p>
            <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl p-5 border border-white/5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-white/10 rounded" />
                  <div className="h-3 w-32 bg-white/5 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-9 bg-white/5 rounded-xl" />
                  <div className="h-9 w-9 bg-white/5 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="glass rounded-3xl border border-white/5 p-14 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <FileText size={28} className="text-gray-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-300">No posts yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Create your first post or check your repository credentials.
            </p>
          </div>
          <Link
            href="/admin/edit/new"
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 font-medium text-sm rounded-xl transition-all hover:border-indigo-500/50"
          >
            <Plus size={15} />
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <div
              key={post.slug}
              className="glass rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all duration-300 group"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                      {post.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-gray-500">
                      /{post.slug}
                    </span>
                    <span>/</span>
                    <time>{format(new Date(post.date), "MMM d, yyyy")}</time>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/admin/edit/${post.slug}`}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/8 hover:bg-indigo-600/15 hover:border-indigo-500/30 text-gray-500 hover:text-indigo-400 transition-all"
                    title="Edit"
                  >
                    <Edit3 size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.slug, post.sha)}
                    disabled={deletingSlug === post.slug}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/8 hover:bg-red-500/15 hover:border-red-500/30 text-gray-500 hover:text-red-400 transition-all disabled:opacity-40"
                    title="Delete"
                  >
                    {deletingSlug === post.slug ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
