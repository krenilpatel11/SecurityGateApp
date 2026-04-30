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
import VisitorLogs from "./page/Visitor/VisitorLogs";
import DeliveryPage from "./page/Delivery/DeliveryPage";
import AnnouncementsPage from "./page/Announcements/AnnouncementsPage";
import ProfilePage from "./page/Profile/ProfilePage";
import AdminPage from "./page/Admin/AdminPage";
import StaffAttendancePage from "./page/Staff/StaffAttendancePage";
import ComplaintsPage from "./page/Complaints/ComplaintsPage";
import SOSPage from "./page/SOS/SOSPage";
import PaymentsPage from "./page/Payments/PaymentsPage";
import AmenityPage from "./page/Amenity/AmenityPage";
import CommunityPage from "./page/Community/CommunityPage";
import NotificationsPage from "./page/Notifications/NotificationsPage";
import GateDashboardPage from "./page/Gate/GateDashboardPage";
import CommunityFeedPage from "./page/Community/CommunityFeedPage";

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <ThemeProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/" element={<Login />} />

              <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/gate"         element={<ProtectedRoute><GateDashboardPage /></ProtectedRoute>} />
              <Route path="/visitor"      element={<ProtectedRoute><VisitorDashboard /></ProtectedRoute>} />
              <Route path="/visitor/logs" element={<ProtectedRoute><VisitorLogs /></ProtectedRoute>} />
              <Route path="/delivery"     element={<ProtectedRoute><DeliveryPage /></ProtectedRoute>} />
              <Route path="/staff"        element={<ProtectedRoute><StaffAttendancePage /></ProtectedRoute>} />
              <Route path="/feed"         element={<ProtectedRoute><CommunityFeedPage /></ProtectedRoute>} />
              <Route path="/announcements"element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
              <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/admin"        element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/complaints"   element={<ProtectedRoute><ComplaintsPage /></ProtectedRoute>} />
              <Route path="/sos"          element={<ProtectedRoute><SOSPage /></ProtectedRoute>} />
              <Route path="/payments"     element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
              <Route path="/amenities"    element={<ProtectedRoute><AmenityPage /></ProtectedRoute>} />
              <Route path="/community"    element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
              <Route path="/notifications"element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </ThemeProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}
