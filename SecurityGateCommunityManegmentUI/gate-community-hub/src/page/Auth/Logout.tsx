import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Perform logout operations
    logout();
    // Redirect to login page
    navigate("/login");
  }, [logout, navigate]);

  return <div>Logging you out...</div>;
}