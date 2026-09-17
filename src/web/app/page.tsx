export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
          Three-Tier Application
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          A reference implementation of a three-tier web application with Next.js, Express, and PostgreSQL.
        </p>
      </div>
    </div>
  );
}
