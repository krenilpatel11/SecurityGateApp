import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/page/Auth/Login";
import OAuthSuccess from "@/page/Auth/OAuthSuccess";
import Dashboard from "@/page/Dashboard/Dashboard";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import Logout from "./page/Auth/Logout";
import { Layout } from "./components/ui/layout/Layout";
import { ThemeProvider } from "./context/ThemeContext";
import { QueryProvider } from "./context/QueryProvider";
import VisitorDashboard from "./page/Visitor/VisitorDashboard";
import DeliveryPage from "./page/Delivery/DeliveryPage";
import AnnouncementsPage from "./page/Announcements/AnnouncementsPage";

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <ThemeProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/visitor"
                element={
                  <ProtectedRoute>
                    <VisitorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/delivery"
                element={
                  <ProtectedRoute>
                    <DeliveryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/announcements"
                element={
                  <ProtectedRoute>
                    <AnnouncementsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/logout" element={<Logout />} />
              <Route path="/" element={<Login />} />
            </Routes>
          </Layout>
        </ThemeProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}
