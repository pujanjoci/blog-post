import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/content';
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

  if (!post) notFound();

  const allPosts = getAllPosts();
  const topArticles = allPosts.filter(p => p.slug !== slug).slice(0, 3);

  const getImageUrl = (img?: string) => {
    if (!img) return '';
    if (img.startsWith('/') || img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    return `/images/${img}`;
  };

  // Dynamic cover image for specific posts, falling back to default cover
  const bannerImage = getImageUrl(post.coverImage) || '/images/nextjs-cover.png';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 pb-20">
      {/* 1. Full-Width Banner */}
      <div className="w-full h-[400px] relative overflow-hidden bg-gray-200">
        <img
          src={bannerImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        
        {/* Go Back Overlay */}
        <div className="absolute inset-0 max-w-6xl mx-auto px-4 relative">
          <div className="absolute top-12 left-4 z-20">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-white hover:underline transition-all"
            >
              <ArrowLeft size={16} />
              Go Back
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 relative -mt-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Spacer */}
          <div className="hidden lg:block lg:col-span-2" />

          {/* Middle: Main Article Card (Light theme exactly like the design) */}
          <article className="lg:col-span-8 bg-white text-gray-900 rounded-none shadow-md p-6 sm:p-10 lg:p-12 border border-gray-100 flex flex-col gap-6 animate-fade-in-up">
            
            {/* Author Section */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                {post.author ? post.author.split(' ').map(n => n[0]).join('') : 'PJ'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-base font-bold text-gray-900 leading-tight">
                  {post.author || 'Pujan Joshi'}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {post.author === 'Pujan Joshi' || !post.author ? 'For my project' : 'Guest Author'}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold font-serif tracking-tight leading-tight text-gray-950 text-left mt-2">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-3.5 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span>{post.date ? format(new Date(post.date), 'd MMMM, yyyy') : ''}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>5 min read</span>
            </div>

            {/* Post Inline Image */}
            {post.image && (
              <div className="w-full mt-2 overflow-hidden bg-gray-50 border border-gray-100">
                <img
                  src={getImageUrl(post.image)}
                  alt={post.title}
                  className="w-full h-auto object-cover rounded-none"
                />
              </div>
            )}
            <div className="prose prose-lg prose-neutral max-w-none text-gray-700 mt-4
              prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-955 prose-headings:mt-8
              prose-p:leading-relaxed prose-p:text-gray-600 prose-p:mb-6
              prose-a:text-indigo-600 hover:prose-a:text-indigo-800 prose-a:font-semibold
              prose-code:text-indigo-700 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-100 prose-pre:p-4 prose-pre:rounded-none
              prose-blockquote:border-l-indigo-600 prose-blockquote:text-gray-500 prose-blockquote:italic
              prose-img:rounded-none prose-img:shadow-sm prose-img:my-8
              prose-hr:border-gray-100">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </article>

          {/* Right Side: Sidebar */}
          <aside className="lg:col-span-2 space-y-10 lg:sticky lg:top-24 mt-6 lg:mt-32 px-2">
            {/* Top Articles */}
            {topArticles.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-2">
                  Top Articles
                </h3>
                <div className="space-y-5">
                  {topArticles.map(article => (
                    <div key={article.slug} className="space-y-1 text-left">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="text-sm font-semibold text-gray-800 hover:text-indigo-600 transition-colors leading-snug block"
                      >
                        {article.title}
                      </Link>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                        by {article.author || 'Pujan Joshi'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b border-gray-200 pb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>
      </div>
    </div>
  );
}
