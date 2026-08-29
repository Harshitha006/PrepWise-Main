export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col sm:flex-row items-start sm:items-center justify-center relative overflow-y-auto overflow-x-hidden">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 70%, rgba(0,212,255,0.08) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(124,58,237,0.08) 0%, transparent 50%)
          `,
        }}
      />
      <div className="relative z-10 w-full max-w-md px-4 py-6 sm:py-0">
        {children}
      </div>
    </div>
  );
}
