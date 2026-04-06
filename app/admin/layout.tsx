export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin CMS</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage GitBlog posts directly on GitHub</p>
      </div>
      {children}
    </div>
  );
}
