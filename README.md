# GitBlog - Serverless CMS

GitBlog is a fully serverless, Git-based headless CMS blog platform built with Next.js 15, React, and Tailwind CSS. It is designed to be ridiculously fast, secure, and purely static-driven.

## How it works

- **Public Site**: Pre-renders all Markdown files contained in the `/content/posts` folder for superior SEO and ultra-fast loading without API limits.
- **Admin CMS**: Fetches, creates, and updates posts dynamically via the GitHub REST API using a secure Personal Access Token (stored locally).
- **Deployment Flow**: When you edit or create a post via the `/admin` interface, the change is committed directly to your GitHub repository. Connected hosting providers (like Vercel or Netlify) will detect this commit and automatically trigger a new static build.

## Prerequisites for Deployment

1. A GitHub account.
2. A GitHub Personal Access Token (PAT) with `repo` scope permissions.
3. A Vercel or Netlify account for hosting.

## Setting up your Repository
1. Push this code to a new public or private repository on your GitHub.
2. Deploy the repository to Vercel (or Netlify).
3. The platform is ready to go immediately! No database needed.

## Using the Admin Panel

1. Navigate to `/admin` on your live site or `localhost:3000/admin`.
2. Enter your GitHub **Username** (Owner), your **Repository Name**, and your **Personal Access Token**.
3. You will immediately see existing posts.
4. Click **New Post** to create content with the built-in rich Markdown editor, or edit an existing post.
5. Hit **Save Post** to commit changes permanently to your GitHub repository.

## Local Development

```bash
npm install
npm run dev
```

Your local site will run on `http://localhost:3000`.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Markdown:** `react-markdown` and `gray-matter`
- **GitHub API:** `@octokit/rest`
