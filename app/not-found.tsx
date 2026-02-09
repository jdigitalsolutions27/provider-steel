import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-navy px-4 text-center text-white">
      <h1 className="text-5xl font-semibold">Page not found</h1>
      <p className="mt-4 text-white/70">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
      >
        Return Home
      </Link>
    </div>
  );
}