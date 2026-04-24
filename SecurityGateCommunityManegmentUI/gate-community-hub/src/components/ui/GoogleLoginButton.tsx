import { Button } from "./Button";
import { FcGoogle } from "react-icons/fc";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
const GOOGLE_AUTH_URL = `${API_BASE}/auth/google`;

export const GoogleLoginButton = () => (
  <Button
    onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
    variant="ghost"
    className="flex items-center w-full justify-center gap-2 border"
  >
    <FcGoogle style={{ marginRight: 8 }} />
    Continue with Google
  </Button>
);
