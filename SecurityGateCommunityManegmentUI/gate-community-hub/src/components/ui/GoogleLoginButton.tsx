import { Button } from "./Button";
import { FcGoogle } from "react-icons/fc";

const GOOGLE_AUTH_URL = "https://localhost:5001/api/auth/google";

export const GoogleLoginButton = () => (
  <Button onClick={() => (window.location.href = GOOGLE_AUTH_URL)} variant="ghost" className="flex items-center">
    <FcGoogle style={{ marginRight: 8 }} />
    Login
  </Button>
);
