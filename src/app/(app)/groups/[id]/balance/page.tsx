import Link from "next/link";

const balances = [
  { from: "You", to: "Sarah K.", amount: "$45.00" },
  { from: "You", to: "Mike R.", amount: "$80.00" },
];

export default function GroupBalancePage() {
  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/groups/flatmates"
          className="flex items-center gap-2 text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Group
        </Link>

        <div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-[#e5e2e1]">
            Balance Overview
          </h1>
          <p className="text-[#c7c4d8] mt-2">Flatmates • Settlement Summary</p>
        </div>

        {/* Net balance */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8 text-center">
          <p className="text-[#c7c4d8] text-sm uppercase tracking-widest mb-4">You owe in total</p>
          <p className="text-6xl font-headline font-extrabold tracking-tighter text-[#ffb4ab]">
            $125.00
          </p>
        </div>

        {/* Debt graph */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8 space-y-6">
          <h2 className="font-headline font-bold text-lg">Who Owes Whom</h2>
          {balances.map((b, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-[#0e0e0e] rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center text-xs font-bold text-[#c7c4d8]">
                {b.from.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-grow flex items-center gap-2">
                <span className="text-sm font-medium text-[#e5e2e1]">{b.from}</span>
                <span className="material-symbols-outlined text-[#c7c4d8] text-sm">arrow_forward</span>
                <span className="text-sm font-medium text-[#e5e2e1]">{b.to}</span>
              </div>
              <span className="font-bold text-[#ffb4ab]">{b.amount}</span>
            </div>
          ))}
        </div>

        {/* Settle Up CTA */}
        <button className="w-full py-4 luminous-gradient text-white font-headline font-bold rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all text-center">
          Settle Up Now
        </button>
      </div>
    </main>
  );
}
