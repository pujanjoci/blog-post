"use client";

import { useEffect, useState } from 'react';
import { 
  checkAuth, 
  loginAdmin, 
  logoutAdmin, 
  fetchPostsFromGitHub, 
  deletePostFromGitHub,
  GitHubPost
} from '@/lib/github';
import Link from 'next/link';
import { format } from 'date-fns';
import { LogOut, Plus, Edit, Trash2, Lock } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  
  const [posts, setPosts] = useState<GitHubPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    try {
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        loadPosts();
      }
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPostsFromGitHub();
      setPosts(data);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.message || 'Failed to fetch posts');
      if (err.message === 'Unauthorized') {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the admin password');
      return;
    }
    setError('');
    
    try {
      const result = await loginAdmin(password);
      if (result.success) {
        setPassword('');
        setIsAuthenticated(true);
        loadPosts();
      } else {
        setError(result.message || 'Invalid password');
      }
    } catch (err: any) {
      setError(err.message || 'Error logging in');
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setPosts([]);
  };

  const handleDelete = async (slug: string, sha?: string) => {
    if (!sha) return;
    if (!window.confirm(`Are you sure you want to delete "${slug}"?`)) return;
    setLoading(true);
    try {
      await deletePostFromGitHub(slug, sha);
      await loadPosts();
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.message || 'Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  // Wait for auth check
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center p-12">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl">
        <div className="flex justify-center mb-6 text-gray-900 dark:text-white">
          <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full">
            <Lock size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Admin Login</h2>
        <p className="text-center text-sm text-gray-500 mb-8">Access the headless GitCMS dashboard</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800/50">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Admin Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98]"
          >
            Log in to Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Posts</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your blog content synced with GitHub</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/edit/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm hover:shadow-blue-600/20 font-medium text-sm"
          >
            <Plus size={16} /> New Post
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-lg transition-colors shadow-sm font-medium text-sm text-gray-700 dark:text-gray-300"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800/50">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <div className="flex justify-center mb-4">
                <Edit className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">No posts found</p>
              <p className="mt-1">Content stored in the repository will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
              {posts.map((post) => (
                <li key={post.slug} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{post.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-3">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded">/{post.slug}</span>
                      <span>•</span>
                      <span>{format(new Date(post.date), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      href={`/admin/edit/${post.slug}`}
                      className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 bg-gray-100 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-transparent dark:hover:border-blue-900/50"
                    >
                      <Edit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(post.slug, post.sha)}
                      className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-gray-100 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-transparent dark:hover:border-red-900/50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
