export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Linear.app inspired clean design */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-medium tracking-tight">
            Ready for <span className="text-purple-500">redesign</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            This is a clean slate. Provide your PRD and we'll build something amazing
            together, inspired by Linear's elegant design.
          </p>

          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="px-6 py-3 bg-white/10 rounded-lg border border-white/20">
              <p className="text-sm text-gray-400">Current branch:</p>
              <code className="text-purple-400 font-mono">redesign/linear-style</code>
            </div>
          </div>

          <div className="mt-20 text-sm text-gray-500">
            <p>All previous work is safely backed up in the <code className="text-gray-400">main</code> branch</p>
          </div>
        </div>
      </div>
    </div>
  );
}
