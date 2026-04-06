import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/content';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-8">
      <Link 
        href="/"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to posts
      </Link>
      
      <header className="mb-10 text-center sm:text-left">
        <time dateTime={post.date} className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3 block">
          {format(new Date(post.date), "MMMM d, yyyy")}
        </time>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {post.excerpt}
          </p>
        )}
      </header>

      <div className="prose prose-lg dark:prose-invert prose-blue max-w-none prose-headings:font-semibold prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-xl">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
