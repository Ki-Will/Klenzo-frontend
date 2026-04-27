import Link from "next/link";

export default function NewGroupPage() {
  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/groups"
          className="flex items-center gap-2 text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Groups
        </Link>

        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-[#e5e2e1]">
            New Circle
          </h1>
          <p className="text-[#c7c4d8] mt-2">Create a group to split expenses with others.</p>
        </div>

        <div className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] ml-1 uppercase tracking-widest">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g. Flatmates, Vacation 2024..."
              className="w-full bg-[#1c1b1b] border-none rounded-2xl py-4 px-6 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
            />
          </div>

          {/* Add Members */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#c7c4d8] ml-1 uppercase tracking-widest">
              Add Members
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#918fa1]">
                person_add
              </span>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full bg-[#1c1b1b] border-none rounded-2xl py-4 pl-12 pr-4 text-[#e5e2e1] placeholder:text-[#918fa1]/50 focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all"
              />
            </div>
          </div>

          {/* Split Method */}
          <div className="space-y-4">
            <label className="text-xs font-semibold text-[#c7c4d8] ml-1 uppercase tracking-widest block">
              Default Split Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Equal", "Custom", "By %"].map((method, i) => (
                <button
                  key={method}
                  className={`py-3 rounded-2xl text-sm font-bold transition-all ${
                    i === 0
                      ? "bg-indigo-600/10 border border-indigo-600/20 text-indigo-400"
                      : "bg-[#1c1b1b] text-[#c7c4d8] hover:bg-[#2a2a2a]"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/groups"
            className="block w-full py-4 luminous-gradient text-white font-headline font-bold rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all text-center mt-8"
          >
            Create Circle
          </Link>
        </div>
      </div>
    </main>
  );
}

