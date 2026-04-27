import Link from "next/link";

const members = [
  { name: "You", initials: "YO", balance: "-$125.00", color: "text-[#ffb4ab]" },
  { name: "Sarah K.", initials: "SK", balance: "+$45.00", color: "text-[#c3c0ff]" },
  { name: "Mike R.", initials: "MR", balance: "+$80.00", color: "text-[#c3c0ff]" },
  { name: "Priya L.", initials: "PL", balance: "Settled", color: "text-[#c7c4d8]" },
];

const expenses = [
  { icon: "shopping_cart", name: "Weekly Groceries", paidBy: "Sarah K.", amount: "$180.00", date: "Oct 24" },
  { icon: "bolt", name: "Electricity Bill", paidBy: "You", amount: "$89.30", date: "Oct 22" },
  { icon: "wifi", name: "Internet Bill", paidBy: "Mike R.", amount: "$60.00", date: "Oct 20" },
];

export default function GroupDetailPage() {
  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back */}
        <Link
          href="/groups"
          className="flex items-center gap-2 text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Groups
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-2xl p-8">
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter mb-2">Flatmates</h1>
          <p className="text-[#c7c4d8]">4 members • Created Jan 2024</p>
          <div className="flex gap-4 mt-6">
            <Link
              href="/expenses/add"
              className="px-6 py-3 rounded-full luminous-gradient text-white font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Expense
            </Link>
            <Link
              href="/groups/flatmates/balance"
              className="px-6 py-3 rounded-full bg-[#2a2a2a] text-[#c3c0ff] font-bold text-sm flex items-center gap-2 hover:bg-[#3a3939] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              Settle Up
            </Link>
          </div>
        </div>

        {/* Members */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8">
          <h2 className="font-headline font-bold text-lg mb-6">Members</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {members.map((m) => (
              <div key={m.name} className="flex flex-col items-center p-4 bg-[#0e0e0e] rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-[#353534] flex items-center justify-center text-sm font-bold text-[#c7c4d8] mb-3">
                  {m.initials}
                </div>
                <p className="text-sm font-semibold text-[#e5e2e1]">{m.name}</p>
                <p className={`text-xs font-bold mt-1 ${m.color}`}>{m.balance}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8">
          <h2 className="font-headline font-bold text-lg mb-6">Shared Expenses</h2>
          <div className="space-y-4">
            {expenses.map((exp, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-[#0e0e0e] rounded-2xl hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[#353534] flex items-center justify-center text-[#c3c0ff]">
                  <span className="material-symbols-outlined">{exp.icon}</span>
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-[#e5e2e1]">{exp.name}</p>
                  <p className="text-xs text-[#c7c4d8]">Paid by {exp.paidBy}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#e5e2e1]">{exp.amount}</p>
                  <p className="text-[10px] text-[#c7c4d8] uppercase tracking-widest">{exp.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
