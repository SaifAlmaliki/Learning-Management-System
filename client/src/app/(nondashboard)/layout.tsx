import NonDashboardNavbar from "@/components/NonDashboardNavbar";
import Footer from "@/components/Footer";

/**
 * This component provides a consistent layout structure:
 * - NonDashboardNavbar: The top navigation bar.
 * - main: The content area where page-specific content will be rendered.
 * - Footer: The footer displayed at the bottom.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="nondashboard-layout">
      {/* Top navigation bar */}
      <NonDashboardNavbar />

      {/* Main content area */}
      <main className="nondashboard-layout__main">{children}</main>

      {/* Footer section */}
      <Footer />
    </div>
  );
}
