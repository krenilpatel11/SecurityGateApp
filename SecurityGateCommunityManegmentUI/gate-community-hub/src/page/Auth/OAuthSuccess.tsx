import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken") ?? undefined;
    if (token) {
      login(token, refreshToken);
      navigate("/dashboard");
    } else {
      navigate("/login?error=missing_token");
    }
  }, [login, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto" />
        <p className="text-gray-600 dark:text-gray-400">Logging you in...</p>
      </div>
    </div>
  );
}
