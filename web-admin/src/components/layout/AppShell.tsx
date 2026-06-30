import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      {/* Offset main content by sidebar width */}
      <main className="ml-56 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
