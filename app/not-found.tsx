import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <div className="text-center">
        <div className="font-cyber text-8xl text-white/10 mb-4">404</div>
        <h1 className="font-cyber text-2xl text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-zinc-500 font-mono text-sm mb-8">
          This terminal session doesn&apos;t exist.
        </p>
        <Link href="/dashboard" className="cyber-btn inline-flex">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
