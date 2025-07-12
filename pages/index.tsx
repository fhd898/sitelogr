import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">SiteLogr&nbsp;v0.1</h1>
      <Link className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors" href="/login">
        Get Started
      </Link>
    </main>
  );
}
