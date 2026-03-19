import { Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { PinLogin } from "./PinLogin";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PinLogin />;
  }

  return <Outlet />;
}
