"use server";

import { Octokit } from '@octokit/rest';
import matter from 'gray-matter';
import { Buffer } from 'buffer';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GitHubPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  sha?: string;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not configured in environment variables.');
  return new Octokit({ auth: token });
}

function getRepoInfo() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!owner || !repo)
    throw new Error('GITHUB_OWNER and GITHUB_REPO must be configured in environment variables.');
  return { owner, repo };
}

// ─── GitHub API ───────────────────────────────────────────────────────────────

export async function fetchPostsFromGitHub(): Promise<GitHubPost[]> {
  const octokit = getOctokit();
  const { owner, repo } = getRepoInfo();

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'content/posts',
    });

    if (!Array.isArray(data)) return [];

    const posts: GitHubPost[] = [];

    for (const file of data) {
      if (!file.name.endsWith('.md')) continue;

      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: file.path,
      });

      if ('content' in fileData && fileData.content) {
        const raw = Buffer.from(fileData.content, 'base64').toString('utf8');
        const { data: fm, content } = matter(raw);
        posts.push({
          slug: file.name.replace(/\.md$/, ''),
          title: fm.title ?? 'Untitled',
          date: fm.date ?? new Date().toISOString().split('T')[0],
          excerpt: fm.excerpt ?? '',
          content,
          sha: fileData.sha,
        });
      }
    }

    return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    if (error.status === 404) return [];
    throw new Error(error.message ?? 'Failed to fetch posts from GitHub.');
  }
}

export async function fetchPostBySlugFromGitHub(slug: string): Promise<GitHubPost | null> {
  const octokit = getOctokit();
  const { owner, repo } = getRepoInfo();

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: `content/posts/${slug}.md`,
    });

    if (!Array.isArray(data) && 'content' in data && data.content) {
      const raw = Buffer.from(data.content, 'base64').toString('utf8');
      const { data: fm, content } = matter(raw);
      return {
        slug,
        title: fm.title ?? 'Untitled',
        date: fm.date ?? new Date().toISOString().split('T')[0],
        excerpt: fm.excerpt ?? '',
        content,
        sha: data.sha,
      };
    }
    return null;
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    if (error.status === 404) return null;
    throw new Error(error.message ?? 'Failed to fetch post.');
  }
}

export async function savePostToGitHub(post: GitHubPost): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = getRepoInfo();

  const markdown = matter.stringify(post.content ?? '', {
    title: post.title,
    date: post.date,
    slug: post.slug,
    excerpt: post.excerpt,
  });

  const content = Buffer.from(markdown, 'utf8').toString('base64');
  const path = `content/posts/${post.slug}.md`;
  const message = post.sha ? `Update post: ${post.title}` : `Create post: ${post.title}`;

  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content,
      ...(post.sha ? { sha: post.sha } : {}),
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message ?? 'Failed to save post to GitHub.');
  }
}

export async function deletePostFromGitHub(slug: string, sha: string): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = getRepoInfo();

  try {
    await octokit.rest.repos.deleteFile({
      owner,
      repo,
      path: `content/posts/${slug}.md`,
      message: `Delete post: ${slug}`,
      sha,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(error.message ?? 'Failed to delete post from GitHub.');
  }
}
