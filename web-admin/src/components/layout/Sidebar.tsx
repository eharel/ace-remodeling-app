import { NavLink } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

const NAV_ITEMS = [
  { to: "/projects", label: "Projects" },
  { to: "/settings", label: "Settings" },
] as const;

export function Sidebar() {
  const { signOut } = useAuth();

  return (
    <aside className="w-56 flex-shrink-0 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0">
      {/* App name */}
      <div className="px-5 py-6 border-b border-gray-700">
        <span className="text-lg font-semibold tracking-tight">ACE Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              ].join(" ")
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={signOut}
          className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
