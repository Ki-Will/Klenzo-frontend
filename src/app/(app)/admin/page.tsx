const kpis = [
  { icon: "group", label: "Total Users", value: "24,891", change: "+8.2%", up: true },
  { icon: "wifi", label: "Active Sessions", value: "1,204", change: "+3.1%", up: true },
  { icon: "payments", label: "Transaction Volume", value: "$4.2M", change: "+12.5%", up: true },
  { icon: "monitor_heart", label: "System Health", value: "99.9%", change: "Stable", up: true },
];

const recentUsers = [
  { name: "Alex Rivers", email: "alex@klenzoo.com", joined: "2 min ago", status: "Active" },
  { name: "Priya Lal", email: "priya@klenzoo.com", joined: "15 min ago", status: "Active" },
  { name: "Marcus Webb", email: "marcus@klenzoo.com", joined: "1 hour ago", status: "Pending" },
  { name: "Sofia Chen", email: "sofia@klenzoo.com", joined: "3 hours ago", status: "Active" },
];

const systemStatus = [
  { name: "API Gateway", status: "Operational", color: "text-emerald-400" },
  { name: "Database Cluster", status: "Operational", color: "text-emerald-400" },
  { name: "SMS Gateway", status: "Degraded", color: "text-[#ffb695]" },
  { name: "AI Engine", status: "Operational", color: "text-emerald-400" },
];

export default function AdminDashboardPage() {
  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <span className="text-[#c3c0ff] font-headline uppercase tracking-[0.3em] text-[10px] mb-2 block">
            System Overview
          </span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-[#e5e2e1]">
            Admin Dashboard
          </h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-[#1c1b1b] rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-[#2a2a2a] rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#c3c0ff]">{kpi.icon}</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    kpi.up
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-[#ffb4ab] bg-[#ffb4ab]/10"
                  }`}
                >
                  {kpi.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-headline font-extrabold text-[#e5e2e1]">{kpi.value}</p>
                <p className="text-xs text-[#c7c4d8] uppercase tracking-widest mt-1">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart + System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-8 bg-[#1c1b1b] rounded-2xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline font-bold text-xl">Revenue Overview</h3>
              <div className="flex bg-[#0e0e0e] p-1 rounded-full">
                {["30D", "90D", "All"].map((t, i) => (
                  <button
                    key={t}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      i === 0 ? "bg-[#2a2a2a] text-[#e5e2e1]" : "text-[#c7c4d8] hover:text-[#e5e2e1]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Area chart simulation */}
            <div className="h-48 w-full flex items-end gap-1">
              {[30, 45, 35, 60, 55, 75, 65, 80, 70, 90, 85, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-[#4f46e5]/60 to-[#c3c0ff]/20 transition-all"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-[#c7c4d8] uppercase tracking-widest mt-3 px-1">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                (m) => (
                  <span key={m}>{m}</span>
                )
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="lg:col-span-4 bg-[#1c1b1b] rounded-2xl p-8">
            <h3 className="font-headline font-bold text-lg mb-6">System Status</h3>
            <div className="space-y-4">
              {systemStatus.map((s) => (
                <div key={s.name} className="flex justify-between items-center p-3 bg-[#0e0e0e] rounded-xl">
                  <span className="text-sm font-medium text-[#e5e2e1]">{s.name}</span>
                  <span className={`text-xs font-bold ${s.color}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#1c1b1b] rounded-2xl p-8">
          <h3 className="font-headline font-bold text-xl mb-6">Recent User Activity</h3>
          <div className="space-y-4">
            {recentUsers.map((user, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-[#0e0e0e] rounded-2xl hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center text-sm font-bold text-[#c7c4d8]">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-[#e5e2e1]">{user.name}</p>
                  <p className="text-xs text-[#c7c4d8]">{user.email}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === "Active"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-[#ffb695]/10 text-[#ffb695]"
                    }`}
                  >
                    {user.status}
                  </span>
                  <p className="text-[10px] text-[#c7c4d8] mt-1">{user.joined}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

