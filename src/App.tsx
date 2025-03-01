
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Users from "@/pages/Users";
import Regions from "@/pages/Regions";
import Sectors from "@/pages/Sectors";
import Schools from "@/pages/Schools";
import Reports from "@/pages/Reports";
import Tables from "@/pages/Tables";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import SectorDashboard from "@/pages/SectorDashboard";
import SectorTables from "@/pages/SectorTables";
import SectorUsers from "@/pages/SectorUsers";
import SectorCategories from "@/pages/SectorCategories";
import SectorForms from "@/pages/SectorForms";
import SchoolDashboard from "@/pages/SchoolDashboard";
import SchoolProfile from "@/pages/SchoolProfile";
import SchoolImport from "@/pages/SchoolImport";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/regions" element={<Regions />} />
            <Route path="/sectors" element={<Sectors />} />
            <Route path="/schools" element={<Schools />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Sector admin routes */}
            <Route path="/sector-dashboard" element={<SectorDashboard />} />
            <Route path="/sector-tables" element={<SectorTables />} />
            <Route path="/sector-users" element={<SectorUsers />} />
            <Route path="/sector-categories" element={<SectorCategories />} />
            <Route path="/sector-forms" element={<SectorForms />} />
            
            {/* School admin routes */}
            <Route path="/school-dashboard" element={<SchoolDashboard />} />
            <Route path="/school-profile" element={<SchoolProfile />} />
            <Route path="/school-import" element={<SchoolImport />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
