import { Breadcrumb } from "@/components/breadcrumb";
import { UserMenu } from "@/components/user-menu";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-[#F8F9FB] min-h-screen">
        {/* Top header bar */}
        <header className="h-14 shrink-0 border-b border-[#DDE3EC] bg-white flex items-center justify-between px-6 relative z-30">
          <Breadcrumb />
          <UserMenu />
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
