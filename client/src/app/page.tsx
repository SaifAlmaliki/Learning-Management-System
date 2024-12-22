// Importing the NonDashboardNavbar component, which represents the navigation bar for non-dashboard pages.
import NonDashboardNavbar from "@/components/NonDashboardNavbar";

// Importing the Landing component, which contains the content for the landing page.
import Landing from "@/app/(nondashboard)/landing/page";

// Importing the Footer component, which represents the footer section of the page.
import Footer from "@/components/Footer";

// Default export for the Home component, representing the layout and content of the home page.
export default function Home() {
  return (
    // Wrapper div for the entire non-dashboard page layout, used for styling and structure.
    <div className="nondashboard-layout">
      {/* Renders the navigation bar at the top of the page */}
      <NonDashboardNavbar />

      {/* Main content area for the page, typically the primary focus of the page */}
      <main className="nondashboard-layout__main">
        {/* Embeds the Landing component, which contains the content of the landing page */}
        <Landing />
      </main>

      {/* Footer section of the page */}
      <Footer />
    </div>
  );
}
