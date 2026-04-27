export default function SmsAutomationPage() {
  const steps = [
    {
      step: "01",
      icon: "sms",
      title: "SMS Received",
      description: "Your bank sends a transaction SMS to your registered number.",
      color: "text-[#c3c0ff]",
      bg: "bg-[#4f46e5]/10",
    },
    {
      step: "02",
      icon: "auto_awesome",
      title: "AI Parsing",
      description: "Klenzoo's AI engine reads and extracts merchant, amount, and date.",
      color: "text-[#ffb695]",
      bg: "bg-[#a44100]/10",
    },
    {
      step: "03",
      icon: "category",
      title: "Auto-Categorization",
      description: "The transaction is automatically assigned to the right spending category.",
      color: "text-[#c3c0ff]",
      bg: "bg-[#4f46e5]/10",
    },
    {
      step: "04",
      icon: "receipt_long",
      title: "Logged to Ledger",
      description: "The expense appears instantly in your Klenzoo dashboard.",
      color: "text-[#ffb695]",
      bg: "bg-[#a44100]/10",
    },
  ];

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <span className="text-[#c3c0ff] font-headline uppercase tracking-[0.3em] text-[10px] mb-2 block">
            Automation
          </span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-[#e5e2e1]">
            SMS Tracking
          </h1>
          <p className="text-[#c7c4d8] mt-3 text-lg max-w-xl">
            Klenzoo automatically reads your bank SMS notifications and logs every transaction —
            zero manual entry required.
          </p>
        </div>

        {/* Flow Steps */}
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="flex items-start gap-6 p-6 bg-[#1c1b1b] rounded-2xl border border-[#464555]/10 hover:bg-[#2a2a2a] transition-all">
                <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined text-2xl ${step.color}`}>
                    {step.icon}
                  </span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-[#464555] uppercase tracking-widest">
                      Step {step.step}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-[#e5e2e1]">{step.title}</h3>
                  <p className="text-[#c7c4d8] text-sm mt-1">{step.description}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center my-1">
                  <span className="material-symbols-outlined text-[#464555]">arrow_downward</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enable CTA */}
        <div className="bg-[#0e0e0e] border border-[#464555]/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-headline font-bold text-xl">Enable SMS Tracking</h3>
            <p className="text-[#c7c4d8] text-sm mt-1">
              Grant permission to read bank SMS notifications.
            </p>
          </div>
          <button className="px-8 py-4 luminous-gradient text-white font-headline font-bold rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap">
            Enable Now
          </button>
        </div>
      </div>
    </main>
  );
}

