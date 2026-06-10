import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content', 'posts');

export type PostData = {
  title: string;
  date: string;
  slug: string;
  description?: string;
  excerpt?: string;
  tags?: string[];
  draft?: boolean;
  coverImage?: string;
  cover_image?: string;
  image?: string;
  featured?: boolean;
  author?: string;
};

export type FullPost = PostData & {
  content: string;
};

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
}

export function getPostBySlug(slug: string): FullPost | null {
  try {
    const realSlug = slug.replace(/\.mdx?$/, '');
    let fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      fullPath = path.join(postsDirectory, `${realSlug}.md`);
    }
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      title: data.title || 'Untitled',
      date: data.date || '',
      slug: realSlug,
      description: data.description || '',
      excerpt: data.excerpt || data.description || '',
      tags: data.tags || [],
      draft: data.draft || false,
      coverImage: data.cover_image || data.coverImage || data.image || '',
      cover_image: data.cover_image || '',
      image: data.image || '',
      featured: data.featured || false,
      author: data.author || '',
      content,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getAllPosts(): FullPost[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is FullPost => post !== null && !post.draft);
  
  // Sort posts by date in descending order
  return posts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
}
