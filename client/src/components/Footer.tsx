/**
 * Summary:
 * This file defines the `Footer` component for a Next.js application.
 *
 * Key Features:
 * - Displays a copyright message for the year 2024.
 * - Dynamically generates footer links using an array of link names.
 * - Uses `next/link` for client-side navigation with smooth transitions (`scroll: false`).
 */

import Link from "next/link";
import React from "react";


// Footer component to display site information and navigation links.
const Footer = () => {
  return (
    <div className="footer">
      {/* Copyright Notice */}
      <p>&copy; 2024 Cognitechx. All Rights Reserved.</p>

      {/* Footer Navigation Links */}
      <div className="footer__links">
        {["About", "Privacy Policy", "Licensing", "Contact"].map((item) => (
          <Link
            key={item} // Unique key for each link
            href={`/${item.toLowerCase().replace(" ", "-")}`} // Dynamically generates URLs
            className="footer__link" // CSS class for styling
            scroll={false} // Prevents scrolling to the top on navigation
          >
            {item} {/* Display the link text */}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Footer;
