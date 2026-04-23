import SideNav from "@/components/SideNav";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <SideNav />
      <BottomNav />
      {children}
    </>
  );
}
