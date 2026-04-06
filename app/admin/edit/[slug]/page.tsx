"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { 
  checkAuth, 
  fetchPostBySlugFromGitHub, 
  savePostToGitHub,
  GitHubPost
} from '@/lib/github';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function EditPost({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug: urlSlug } = use(params);
  const isNew = urlSlug === 'new';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  const [post, setPost] = useState<GitHubPost>({
    slug: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    excerpt: '',
    content: '',
  });

  useEffect(() => {
    verifyAndLoad();
  }, [urlSlug]);

  const verifyAndLoad = async () => {
    try {
      const isAuth = await checkAuth();
      if (!isAuth) {
        router.push('/admin');
        return;
      }

      if (!isNew) {
        await loadPost();
      } else {
        setLoading(false);
      }
    } catch (err) {
      router.push('/admin');
    }
  };

  const loadPost = async () => {
    try {
      const data = await fetchPostBySlugFromGitHub(urlSlug);
      if (data) {
        setPost(data);
      } else {
        setError('Post not found');
      }
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.message || 'Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!post.title || !post.slug) {
      setError('Title and slug are required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await savePostToGitHub(post);
      router.push('/admin');
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Link 
          href="/admin"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button 
              onClick={() => setView('edit')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'edit' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Edit2 size={14} /> Edit
            </button>
            <button 
              onClick={() => setView('preview')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'preview' ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Eye size={14} /> Preview
            </button>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {view === 'edit' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Markdown Content</label>
              <textarea 
                value={post.content}
                onChange={e => setPost({ ...post, content: e.target.value })}
                className="w-full h-[600px] p-4 font-mono text-sm rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm"
                placeholder="# Write your blog post here..."
              />
            </div>
          </div>
          <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm h-fit">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input 
                type="text" 
                value={post.title}
                onChange={e => {
                  const newTitle = e.target.value;
                  // Auto-generate slug if it's a new post
                  if (isNew) {
                    const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setPost({ ...post, title: newTitle, slug: newSlug });
                  } else {
                    setPost({ ...post, title: newTitle });
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (URL)</label>
              <input 
                type="text" 
                value={post.slug}
                disabled={!isNew}
                onChange={e => setPost({ ...post, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/80 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                placeholder="post-slug"
              />
              {!isNew && <p className="text-xs text-gray-500 mt-1">Slug cannot be changed after creation.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input 
                type="date" 
                value={post.date.split('T')[0]}
                onChange={e => setPost({ ...post, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Excerpt</label>
              <textarea 
                value={post.excerpt}
                onChange={e => setPost({ ...post, excerpt: e.target.value })}
                className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="A short summary of the post..."
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm min-h-[600px]">
          <header className="mb-10 border-b border-gray-200 dark:border-zinc-800 pb-8">
            <time className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 block">
              {post.date}
            </time>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
              {post.title || 'Untitled Post'}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {post.excerpt}
              </p>
            )}
          </header>
          <div className="prose prose-lg dark:prose-invert prose-blue max-w-none">
            <ReactMarkdown>{post.content || '*No content yet.*'}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
