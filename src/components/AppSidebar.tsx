
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
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Menu items based on user role
  const getMenuItems = () => {
    // Default menu items for all users
    const defaultItems = [
      { title: "Settings", icon: Settings, href: "/settings" },
    ];

    // Super admin menu items
    if (user?.role === 'superadmin') {
      return [
        { title: "Dashboard", icon: LayoutDashboard, href: "/superadmin/dashboard" },
        { title: "Users", icon: Users, href: "/superadmin/users" },
        { title: "Regions", icon: MapPin, href: "/superadmin/regions" },
        { title: "Sectors", icon: Building, href: "/superadmin/sectors" },
        { title: "Schools", icon: School, href: "/superadmin/schools" },
        { title: "Reports", icon: BookOpen, href: "/superadmin/reports" },
        { title: "Tables", icon: Table, href: "/superadmin/tables" },
        ...defaultItems
      ];
    }
    
    // Region admin menu items
    else if (user?.role === 'regionadmin') {
      return [
        { title: "Dashboard", icon: LayoutDashboard, href: "/regionadmin/dashboard" },
        { title: "Sectors", icon: Building, href: "/regionadmin/sectors" },
        { title: "Schools", icon: School, href: "/regionadmin/schools" },
        { title: "Tables", icon: Table, href: "/regionadmin/tables" },
        { title: "Reports", icon: BookOpen, href: "/regionadmin/reports" },
        ...defaultItems
      ];
    }
    
    // Sector admin menu items
    else if (user?.role === 'sectoradmin') {
      return [
        { title: "Dashboard", icon: LayoutDashboard, href: "/sectoradmin/dashboard" },
        { title: "Schools", icon: School, href: "/sectoradmin/schools" },
        { title: "School Admins", icon: Users, href: "/sectoradmin/users" },
        { title: "Tables", icon: Table, href: "/sectoradmin/tables" }, 
        { title: "Categories", icon: Database, href: "/sectoradmin/categories" }, 
        { title: "Form View", icon: FileText, href: "/sectoradmin/forms" },
        { title: "Reports", icon: BookOpen, href: "/sectoradmin/reports" },
        ...defaultItems
      ];
    }
    
    // School admin menu items
    else if (user?.role === 'schooladmin') {
      return [
        { title: "Dashboard", icon: LayoutDashboard, href: "/schooladmin/dashboard" },
        { title: "Data Entry", icon: FileText, href: "/schooladmin/data-entry" }, 
        { title: "Import Data", icon: Database, href: "/schooladmin/import" },
        { title: "Profile", icon: User, href: "/schooladmin/profile" },
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
                    <Link 
                      to={item.href} 
                      className={`flex items-center gap-2 ${location.pathname === item.href ? 'bg-accent' : ''}`}
                    >
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
