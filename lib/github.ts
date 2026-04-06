"use server";

import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';
import { Buffer } from 'buffer';
import { cookies } from 'next/headers';

const AUTH_COOKIE = 'gitblog_admin';

export type GitHubPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  sha?: string;
};

// Check if the user is authenticated via cookie
export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const auth = cookieStore.get(AUTH_COOKIE);
  return auth?.value === 'authenticated';
}

// Log in the administrator
export async function loginAdmin(password: string): Promise<{ success: boolean; message?: string }> {
  const envPassword = process.env.ADMIN_PASSWORD || 'admin'; // Fallback to 'admin' if not set
  
  if (password === envPassword) {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    return { success: true };
  }
  return { success: false, message: 'Invalid password' };
}

// Log out the administrator
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

// Internal helper for configuring Octokit
const getOctokit = () => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  return new Octokit({ auth: token });
};

const getRepoInfo = () => {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!owner || !repo) return null;
  return { owner, repo };
};

// Ensure action is authorized and has GH config
async function requireAuthAndConfig() {
  const isAuth = await checkAuth();
  if (!isAuth) throw new Error('Unauthorized');
  
  const octokit = getOctokit();
  const repoInfo = getRepoInfo();
  
  if (!octokit || !repoInfo) {
    throw new Error('Server misconfiguration: GitHub credentials not found in environment variables.');
  }
  
  return { octokit, repoInfo };
}

export async function fetchPostsFromGitHub(): Promise<GitHubPost[]> {
  const { octokit, repoInfo } = await requireAuthAndConfig();

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      path: 'content/posts',
    });

    if (!Array.isArray(data)) {
      return [];
    }

    const posts: GitHubPost[] = [];

    // Fetch details for each post securely
    for (const file of data) {
      if (file.name.endsWith('.md')) {
        const fileContent = await octokit.rest.repos.getContent({
          owner: repoInfo.owner,
          repo: repoInfo.repo,
          path: file.path,
        });

        if ('content' in fileContent.data) {
          const decoded = Buffer.from(fileContent.data.content, 'base64').toString('utf8');
          const { data: frontmatter, content } = matter(decoded);
          
          posts.push({
            slug: file.name.replace('.md', ''),
            title: frontmatter.title || 'Untitled',
            date: frontmatter.date || new Date().toISOString(),
            excerpt: frontmatter.excerpt || '',
            content,
            sha: fileContent.data.sha,
          });
        }
      }
    }

    return posts.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (error.status === 404) {
      return [];
    }
    throw new Error(error.message || 'Failed to fetch posts');
  }
}

export async function fetchPostBySlugFromGitHub(slug: string): Promise<GitHubPost | null> {
  const { octokit, repoInfo } = await requireAuthAndConfig();

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      path: `content/posts/${slug}.md`,
    });

    if (!Array.isArray(data) && 'content' in data && data.content) {
      const decoded = Buffer.from(data.content, 'base64').toString('utf8');
      const { data: frontmatter, content } = matter(decoded);
      return {
        slug,
        title: frontmatter.title || 'Untitled',
        date: frontmatter.date || new Date().toISOString(),
        excerpt: frontmatter.excerpt || '',
        content,
        sha: data.sha,
      };
    }
    return null;
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (error.status === 404) {
      return null;
    }
    throw new Error(error.message || 'Failed to fetch post');
  }
}

export async function savePostToGitHub(post: GitHubPost) {
  const { octokit, repoInfo } = await requireAuthAndConfig();

  const markdownString = matter.stringify(post.content || '', {
    title: post.title,
    date: post.date,
    slug: post.slug,
    excerpt: post.excerpt,
  });

  const base64Content = Buffer.from(markdownString, 'utf8').toString('base64');
  const path = `content/posts/${post.slug}.md`;
  const message = post.sha ? `Update post: ${post.title}` : `Create post: ${post.title}`;

  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      path,
      message,
      content: base64Content,
      sha: post.sha,
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    throw new Error(error.message || 'Failed to save post');
  }
}

export async function deletePostFromGitHub(slug: string, sha: string) {
  const { octokit, repoInfo } = await requireAuthAndConfig();

  const path = `content/posts/${slug}.md`;

  try {
    await octokit.rest.repos.deleteFile({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      path,
      message: `Delete post: ${slug}`,
      sha,
    });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    throw new Error(error.message || 'Failed to delete post');
  }
}
