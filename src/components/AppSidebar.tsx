
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
  Building
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export function AppSidebar() {
  const { user } = useAuth();

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { title: "Users", icon: Users, href: "/users", role: "superadmin" },
    { title: "Regions", icon: MapPin, href: "/regions", role: "superadmin" },
    { title: "Sectors", icon: Building, href: "/sectors", role: ["superadmin", "regionadmin"] },
    { title: "Schools", icon: School, href: "/schools", role: ["superadmin", "regionadmin", "sectoradmin"] },
    { title: "Reports", icon: BookOpen, href: "/reports" },
    { title: "Tables", icon: Table, href: "/tables", role: "superadmin" },
    { title: "Settings", icon: Settings, href: "/settings" },
  ].filter((item) => {
    if (!item.role) return true;
    if (Array.isArray(item.role)) {
      return item.role.includes(user?.role || '');
    }
    return item.role === user?.role;
  });

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
