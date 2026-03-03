import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import PublicStorePage from "./pages/PublicStorePage";

type Page = "store" | "admin-login" | "admin-dashboard";

export default function App() {
  const [page, setPage] = useState<Page>("store");
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  const handleAdminLogin = () => {
    setAdminAuthenticated(true);
    setPage("admin-dashboard");
  };

  const handleAdminLogout = () => {
    setAdminAuthenticated(false);
    setPage("store");
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      {page === "store" && (
        <PublicStorePage onAdminClick={() => setPage("admin-login")} />
      )}
      {page === "admin-login" && (
        <AdminLoginPage
          onLogin={handleAdminLogin}
          onBack={() => setPage("store")}
        />
      )}
      {page === "admin-dashboard" && adminAuthenticated && (
        <AdminDashboardPage onLogout={handleAdminLogout} />
      )}
    </>
  );
}
