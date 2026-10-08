import { useNavigate } from "react-router-dom";

import { IoIosLogOut } from "react-icons/io";
import { FiMenu } from "react-icons/fi";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="sticky top-0 z-40 min-h-16 text-black px-3 sm:px-4 lg:px-6 flex items-center justify-between bg-gray-100 shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
          aria-label="Open admin navigation"
        >
          <FiMenu className="text-xl" />
        </button>
        <img src="/logo2.jpg" alt="Logo" className="h-8 w-20 object-contain flex-shrink-0" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
      
        <span className="hidden sm:inline text-m text-gray-600 max-w-32 truncate" title={localStorage.getItem("adminUsername") || "Admin"}>
          {localStorage.getItem("adminUsername") || "Admin"}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-blue-500 text-white flex items-center gap-2 px-3 sm:px-4 py-2 rounded hover:bg-blue-600 hover:shadow-lg transition duration-200 text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Logout</span>
          <IoIosLogOut className="text-lg" />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
