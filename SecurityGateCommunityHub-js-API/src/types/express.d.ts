// Augment Express Request so req.user is typed globally across all controllers
declare namespace Express {
  interface User {
    id: string;
    email: string;
    role: string;
    activeRole?: string; // SUPERUSER impersonated role
    name: string;
    avatar?: string;
    unit?: string;
  }
}
