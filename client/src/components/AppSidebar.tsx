import { useClerk, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Briefcase,
  DollarSign,
  LogOut,
  PanelLeft,
  Settings,
  User,
} from "lucide-react";
import Loading from "./Loading";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Navigation Links Configuration
const navLinks = {
  student: [
    { icon: BookOpen, label: "Courses", href: "/user/courses" },
    { icon: Briefcase, label: "Billing", href: "/user/billing" },
    { icon: User, label: "Profile", href: "/user/profile" },
    { icon: Settings, label: "Settings", href: "/user/settings" },
  ],
  teacher: [
    { icon: BookOpen, label: "Courses", href: "/teacher/courses" },
    { icon: DollarSign, label: "Billing", href: "/teacher/billing" },
    { icon: User, label: "Profile", href: "/teacher/profile" },
    { icon: Settings, label: "Settings", href: "/teacher/settings" },
  ],
};

const AppSidebar = () => {
  // Hooks for user and sidebar state
  const { user, isLoaded } = useUser();   // Fetch user data from Clerk
  const { signOut } = useClerk();         // Sign out function
  const pathname = usePathname();         // Current route
  const { toggleSidebar } = useSidebar(); // Sidebar state management

  // Loading state
  if (!isLoaded) return <Loading />;
  if (!user) return <div>User not found</div>;

  // Determine user type and navigation links
  const userType =
    (user.publicMetadata.userType as "student" | "teacher") || "student";
  const currentNavLinks = navLinks[userType];

  return (
    // Sidebar container
    <Sidebar
      collapsible="icon"
      style={{ height: "100vh" }}
      className="bg-customgreys-primarybg border-none shadow-lg"
    >
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu className="app-sidebar__menu">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => toggleSidebar()}
              className="group hover:bg-customgreys-secondarybg"
            >
              <div className="app-sidebar__logo-container group">
                {/* App Logo */}
                <div className="app-sidebar__logo-wrapper">
                  <Image src="/logo.svg" alt="logo" width={25} height={20} className="app-sidebar__logo"/>
                  <p className="app-sidebar__title">cognitechX</p>
                </div>
                {/* Sidebar Toggle Icon */}
                <PanelLeft className="app-sidebar__collapse-icon" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarMenu className="app-sidebar__nav-menu">
          {currentNavLinks.map((link) => {
            const isActive = pathname.startsWith(link.href); // Check if the link is active

            return (
              <SidebarMenuItem
                key={link.href}
                className={cn(
                  "app-sidebar__nav-item",
                  isActive && "bg-gray-800"
                )}
              >
                {/* Navigation Link */}
                <SidebarMenuButton
                  asChild
                  size="lg"
                  className={cn(
                    "app-sidebar__nav-button",
                    !isActive && "text-customgreys-dirtyGrey"
                  )}
                >
                  <Link
                    href={link.href}
                    className="app-sidebar__nav-link"
                    scroll={false}
                  >
                    <link.icon
                      className={isActive ? "text-white-50" : "text-gray-500"}
                    />
                    <span
                      className={cn(
                        "app-sidebar__nav-text",
                        isActive ? "text-white-50" : "text-gray-500"
                      )}
                    >
                      {link.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
                {/* Active Indicator */}
                {isActive && <div className="app-sidebar__active-indicator" />}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Sign Out Button */}
            <SidebarMenuButton asChild>
              <button onClick={() => signOut()} className="app-sidebar__signout">
                <LogOut className="mr-2 h-6 w-6" />
                <span>Sign out</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
