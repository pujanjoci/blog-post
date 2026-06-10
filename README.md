# MYBlogs - Simple Next.js Blog Site

A fast, lightweight, and modern personal blog site built with Next.js, React, and Tailwind CSS. It is designed to render blog posts directly from local Markdown/MDX files using front-matter (JSON-style metadata). No complex databases or external server setups required.

## Key Features

- **Local File-Based Content**: Write posts in standard Markdown/MDX formats under the `content/posts/` directory.
- **JSON Metadata / Front-Matter**: Easily configure metadata like title, date, author, description, tags, and images (cover, main, end) at the top of each post file.
- **Fully Responsive UI**: High-fidelity dark theme homepage with smooth animations, responsive post grid, search bar, and topic/tag filters.
- **Zero Database Overhead**: Lightweight and static-site friendly. Fast compile times and instant loading performance.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4
- **Markdown:** `react-markdown` and `gray-matter` for parsing front-matter metadata

## Post Front-Matter Format

Each blog post is stored as a `.mdx` file under `content/posts/` and uses standard YAML/JSON metadata at the top:

```yaml
---
title: "My Longest Running Smartphone"
date: "2023-08-20"
description: "By taking proper care of your phone, it can last years longer"
tags: ["Day-to-Day"]
draft: false
featured: true
author: "Pujan Joshi"
coverImage: "/images/a80-cover.png"
image: "/images/a80.png"
---
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see your blog.

## Production Build

Build the static web pages optimized for production:
```bash
npm run build
```
