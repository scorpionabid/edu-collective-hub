
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Users, 
  School, 
  BookOpen, 
  Settings, 
  Table,
  MapPin,
  Building,
  LogOut,
  FileText,
  Database,
  Grid
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export function AppSidebar() {
  const { user, logout } = useAuth();

  // Menu items based on user role
  const getMenuItems = () => {
    // Default menu items for all users
    const defaultItems = [
      { title: "Settings", icon: Settings, href: "/settings" },
    ];

    // Super admin menu items
    if (user?.role === 'superadmin') {
      return [
        { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { title: "Users", icon: Users, href: "/users" },
        { title: "Regions", icon: MapPin, href: "/regions" },
        { title: "Sectors", icon: Building, href: "/sectors" },
        { title: "Schools", icon: School, href: "/schools" },
        { title: "Reports", icon: BookOpen, href: "/reports" },
        { title: "Tables", icon: Table, href: "/tables" },
        ...defaultItems
      ];
    }
    
    // Region admin menu items
    else if (user?.role === 'regionadmin') {
      return [
        { title: "Dashboard", icon: LayoutDashboard, href: "/region-dashboard" },
        { title: "Sectors", icon: Building, href: "/sectors" },
        { title: "Schools", icon: School, href: "/schools" },
        { title: "Reports", icon: BookOpen, href: "/reports" },
        { title: "Tables", icon: Table, href: "/region-tables" },
        ...defaultItems
      ];
    }
    
    // Sector admin menu items
    else if (user?.role === 'sectoradmin') {
      return [
        { title: "Dashboard", icon: LayoutDashboard, href: "/sector-dashboard" },
        { title: "Schools", icon: School, href: "/sector-schools" },
        { title: "School Admins", icon: Users, href: "/sector-users" },
        { title: "Tables", icon: Table, href: "/sector-tables" }, // Standard table view
        { title: "Categories", icon: Database, href: "/sector-categories" }, // Added view for categories
        { title: "Form View", icon: FileText, href: "/sector-forms" }, // Added view for form view
        { title: "Reports", icon: BookOpen, href: "/reports" },
        ...defaultItems
      ];
    }
    
    // School admin menu items
    else if (user?.role === 'schooladmin') {
      return [
        { title: "Dashboard", icon: LayoutDashboard, href: "/school-dashboard" },
        { title: "Tables", icon: Table, href: "/school-tables" },
        { title: "Reports", icon: BookOpen, href: "/reports" },
        ...defaultItems
      ];
    }
    
    // Fallback for unknown roles
    return defaultItems;
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {user ? `${user.name} (${user.role})` : 'Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.href} className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} className="flex items-center gap-2 w-full">
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
