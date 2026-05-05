import Link from "next/link";

export default function ExpenseDetailPage() {
  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back */}
        <Link
          href="/expenses"
          className="flex items-center gap-2 text-[#c7c4d8] hover:text-[#c3c0ff] transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Expenses
        </Link>

        {/* Hero */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#353534] flex items-center justify-center text-[#c3c0ff]">
            <span
              className="material-symbols-outlined text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              restaurant
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-[#e5e2e1]">The Gilded Fork</h1>
            <p className="text-[#c7c4d8] text-sm uppercase tracking-wider mt-1">
              Dining &amp; Social
            </p>
          </div>
          <div className="text-5xl font-headline font-extrabold tracking-tighter text-[#ffb4ab]">
            -$124.50
          </div>
          <span className="px-4 py-1 bg-[#2a2a2a] rounded-full text-xs font-bold uppercase tracking-widest text-[#c7c4d8]">
            Approved
          </span>
        </div>

        {/* Details */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8 space-y-6">
          <h2 className="font-headline font-bold text-lg">Transaction Details</h2>
          {[
            { label: "Date", value: "Tuesday, Oct 24, 2024" },
            { label: "Time", value: "12:45 PM" },
            { label: "Category", value: "Dining & Social" },
            { label: "Payment Method", value: "Chase Sapphire *8829" },
            { label: "Reference", value: "#TXN-2024-10-24-001" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center">
              <span className="text-[#c7c4d8] text-sm">{item.label}</span>
              <span className="text-[#e5e2e1] font-medium text-sm">{item.value}</span>
            </div>
          ))}
        </div>

        {/* AI Insight */}
        <div className="bg-[#0e0e0e] border border-[#464555]/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4 text-[#ffb695]">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="text-xs font-bold uppercase tracking-widest">AI Insight</span>
          </div>
          <p className="text-[#c7c4d8] leading-relaxed">
            This dining expense is{" "}
            <span className="text-[#c3c0ff] font-bold">23% higher</span> than your average
            restaurant spend. You&apos;ve visited this merchant 3 times this month.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button className="flex-1 py-4 bg-[#2a2a2a] hover:bg-[#3a3939] rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit
          </button>
          <button className="flex-1 py-4 bg-[#93000a]/20 hover:bg-[#93000a]/30 text-[#ffb4ab] rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete
          </button>
        </div>
      </div>
    </main>
  );
}
