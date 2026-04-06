import Link from "next/link";
import { format } from "date-fns";
import { getAllPosts } from "@/lib/content";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col gap-12">
      <section className="text-center sm:text-left py-12 md:py-20 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
          Latest writing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
          Thoughts, tutorials, and insights powered by a Git-based headless CMS.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No posts found. Start writing in the admin panel!</p>
        ) : (
          posts.map((post) => (
            <Link 
              key={post.slug} 
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-3 p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg dark:hover:shadow-blue-500/10"
            >
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                <time dateTime={post.date}>
                  {format(new Date(post.date), "MMMM d, yyyy")}
                </time>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="mt-auto pt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                Read article 
                <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  );
}
