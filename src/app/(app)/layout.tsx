import SideNav from "@/components/SideNav";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#131313]">
      <TopBar />
      <SideNav />
      {/* Offset: pt-16 on mobile (64px header), pt-20 on md+, lg:ml-72 for sidebar */}
      <div className="pt-16 md:pt-20 lg:ml-72 pb-28 lg:pb-8">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
