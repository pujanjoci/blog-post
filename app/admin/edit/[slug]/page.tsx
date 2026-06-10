"use client";

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import type { GitHubPost } from '@/lib/github';
import {
  fetchPostBySlugFromGitHub,
  savePostToGitHub,
} from '@/lib/github';
import Link from 'next/link';
import {
  ArrowLeft, Save, Eye, Edit2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function EditPost({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug: urlSlug } = use(params);
  const isNew = urlSlug === 'new';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [isPending, startTransition] = useTransition();

  const [post, setPost] = useState<GitHubPost>({
    slug: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    excerpt: '',
    content: '',
  });

  useEffect(() => {
    async function loadInitialPost() {
      if (isNew) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await fetchPostBySlugFromGitHub(urlSlug);
        if (data) setPost(data);
        else setError('Post not found in repository.');
      } catch (err: unknown) {
        setError((err as Error).message ?? 'Failed to fetch post.');
      } finally {
        setLoading(false);
      }
    }

    loadInitialPost();
  }, [isNew, urlSlug]);

  function handleTitleChange(value: string) {
    if (isNew) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setPost(p => ({ ...p, title: value, slug }));
    } else {
      setPost(p => ({ ...p, title: value }));
    }
  }

  function handleSave() {
    if (!post.title.trim() || !post.slug.trim()) {
      setError('Title and slug are required.');
      return;
    }
    setError('');
    setSuccess('');
    startTransition(async () => {
      try {
        await savePostToGitHub(post);
        setSuccess('Post saved successfully!');
        setTimeout(() => router.push('/admin'), 1200);
      } catch (err: unknown) {
        setError((err as Error).message ?? 'Failed to save post.');
      }
    });
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm">Loading post…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      {/* Topbar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          Back to posts
        </Link>

        <div className="flex items-center gap-3">
          {/* Edit / Preview toggle */}
          <div className="flex bg-white/5 border border-white/8 p-1 rounded-xl">
            <button
              onClick={() => setView('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                view === 'edit'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Edit2 size={13} /> Edit
            </button>
            <button
              onClick={() => setView('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                view === 'preview'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Eye size={13} /> Preview
            </button>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
          >
            <Save size={15} />
            {isPending ? 'Saving…' : 'Save Post'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl">
          <CheckCircle2 size={16} className="text-green-400" />
          <p className="text-sm text-green-300">{success}</p>
        </div>
      )}

      {/* Edit Mode */}
      {view === 'edit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* Markdown Editor */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Content (Markdown)
            </label>
            <textarea
              value={post.content}
              onChange={e => setPost(p => ({ ...p, content: e.target.value }))}
              className="w-full h-[540px] p-5 font-mono text-sm leading-relaxed bg-white/4 border border-white/8 hover:border-white/12 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-2xl text-gray-200 placeholder-gray-700 outline-none resize-none transition-all"
              placeholder={"# Hello World\n\nStart writing your post here…"}
            />
          </div>

          {/* Metadata Panel */}
          <div className="glass rounded-2xl border border-white/8 p-5 space-y-5 h-fit">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Post Details</p>

            <div className="space-y-1.5">
              <label className="block text-xs text-gray-500">Title</label>
              <input
                type="text"
                value={post.title}
                onChange={e => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/8 hover:border-white/15 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-white text-sm placeholder-gray-700 outline-none transition-all"
                placeholder="My Great Post"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-gray-500">
                Slug <span className="text-gray-700">(URL path)</span>
              </label>
              <input
                type="text"
                value={post.slug}
                disabled={!isNew}
                onChange={e => setPost(p => ({ ...p, slug: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/8 rounded-xl text-gray-300 text-sm font-mono placeholder-gray-700 outline-none disabled:opacity-50 disabled:cursor-not-allowed focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="my-great-post"
              />
              {!isNew && (
                <p className="text-xs text-gray-700">Slug cannot be changed after creation.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-gray-500">Date</label>
              <input
                type="date"
                value={post.date.split('T')[0]}
                onChange={e => setPost(p => ({ ...p, date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/8 hover:border-white/15 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-gray-300 text-sm outline-none transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-gray-500">Excerpt</label>
              <textarea
                value={post.excerpt}
                onChange={e => setPost(p => ({ ...p, excerpt: e.target.value }))}
                className="w-full h-24 px-3 py-2.5 bg-white/5 border border-white/8 hover:border-white/15 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-gray-300 text-sm placeholder-gray-700 outline-none resize-none transition-all"
                placeholder="A short summary shown on listing pages…"
              />
            </div>

            <div className="pt-2 border-t border-white/5 space-y-1 text-xs text-gray-700">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Saves directly to GitHub
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                Triggers automatic deploy
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="glass rounded-2xl border border-white/8 p-8 min-h-[600px]">
          <div className="max-w-3xl mx-auto">
            <header className="mb-10 pb-8 border-b border-white/8">
              <time className="text-xs font-medium text-indigo-400 uppercase tracking-widest block mb-3">
                {post.date}
              </time>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-5 leading-tight">
                {post.title || 'Untitled Post'}
              </h1>
              {post.excerpt && (
                <p className="text-xl text-gray-400 leading-relaxed">{post.excerpt}</p>
              )}
            </header>
            <div className="prose prose-lg prose-invert prose-indigo max-w-none
              prose-headings:font-semibold prose-headings:text-white
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-indigo-400 hover:prose-a:text-indigo-300
              prose-code:text-indigo-300 prose-code:bg-indigo-900/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/8
              prose-blockquote:border-l-indigo-500 prose-blockquote:text-gray-400
              prose-img:rounded-xl prose-hr:border-white/10">
              <ReactMarkdown>{post.content || '*No content yet. Switch to Edit mode.*'}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
