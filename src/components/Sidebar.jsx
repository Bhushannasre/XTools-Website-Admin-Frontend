import { NavLink } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { IoMdContacts } from "react-icons/io";
import { MdProductionQuantityLimits, MdOutlineSubscriptions } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import { BsDoorClosed, BsDoorOpen } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";

function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 py-2.5 px-3 rounded transition duration-150 ${
      isActive ? "bg-gray-600 font-semibold" : "hover:bg-gray-700"
    }`;

  const navItems = [
    { to: "/dashboard", icon: <RxDashboard />, label: "Dashboard" },
    { to: "/contact", icon: <IoMdContacts />, label: "Contact" },
    { to: "/products", icon: <MdProductionQuantityLimits />, label: "Products" },
    { to: "/subscriptions", icon: <MdOutlineSubscriptions />, label: "Subscriptions" },
    { to: "/users", icon: <FaUsers />, label: "Users" },
  ];

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          ${collapsed ? "lg:w-16" : "lg:w-64"} w-72
          h-screen lg:h-auto bg-gray-800 text-white flex flex-col
          transition-transform duration-300 lg:transition-[width]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-hidden flex-shrink-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 min-h-16">
          <div className={`${collapsed ? "lg:hidden" : ""} flex items-center gap-2 text-lg sm:text-xl font-bold whitespace-nowrap`}>
            <RiAdminLine /> Admin Panel
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block ml-auto text-white hover:text-gray-300 transition p-1"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <BsDoorClosed className="text-xl" /> : <BsDoorOpen className="text-xl" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/80 hover:text-white text-sm px-2 py-1 rounded border border-white/10"
            aria-label="Close sidebar"
          >
            Close
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={linkClass}
              title={collapsed ? label : ""}
            >
              <span className="text-xl flex-shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`${collapsed ? "lg:hidden" : ""} p-4 border-t border-gray-700 text-center text-xs sm:text-sm text-gray-400`}>
          © 2026 Xtools. All rights reserved.
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
