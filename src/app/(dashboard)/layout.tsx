import { Breadcrumb } from "@/components/breadcrumb";
import { UserMenu } from "@/components/user-menu";
import { Sidebar } from "@/components/sidebar";
import { QuickActionButton } from "@/components/quick-action-button";
import { BreadcrumbProvider } from "@/lib/context/breadcrumb-context";
import { SelectedEntityProvider } from "@/lib/context/selected-entity-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-[#F8F9FB] min-h-screen">
        <BreadcrumbProvider>
          <SelectedEntityProvider>
          <header className="h-14 shrink-0 border-b border-[#DDE3EC] bg-white flex items-center justify-between px-6 relative z-30">
            <Breadcrumb />
            <UserMenu />
          </header>

          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </SelectedEntityProvider>
        </BreadcrumbProvider>
      </div>

      <QuickActionButton />
    </div>
  );
}
