import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ===============================
  // Logout
  // ===============================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ===============================
  // Get Dashboard Path by Role
  // ===============================

  const getDashboardPath = () => {
    if (user?.role === "admin") {
      return "/admin-dashboard";
    }

    if (user?.role === "provider") {
      return "/provider-dashboard";
    }

    return "/parent-dashboard";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-4">

        {/* Logo */}

        <Link
          to="/"
          className="text-2xl md:text-3xl font-extrabold text-green-600"
        >
          Little Steps
        </Link>

        {/* Menu */}

        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">

          <Link
            to="/"
            className="hover:text-green-600 transition"
          >
            Home
          </Link>

          <Link
            to="/search"
            className="hover:text-green-600 transition"
          >
            Search
          </Link>

          {/* Dashboard Link */}

          {user && (
            <Link
              to={getDashboardPath()}
              className="hover:text-green-600 transition font-semibold"
            >
              Dashboard
            </Link>
          )}

          <a
            href="#about"
            className="hover:text-green-600 transition"
          >
            About
          </a>

          <a
            href="#contact"
            className="hover:text-green-600 transition"
          >
            Contact
          </a>

        </div>

        {/* Right Side */}

        {user ? (

          <div className="flex items-center gap-3 md:gap-4">

            {/* User Information */}

            <div className="text-right hidden md:block">

              <p className="font-semibold text-gray-800">
                {user.fullName}
              </p>

              <p className="text-sm text-gray-500 capitalize">
                {user.role}
              </p>

            </div>

            {/* Dashboard Button */}

            <Link
              to={getDashboardPath()}
              className="hidden sm:block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Dashboard
            </Link>

            {/* Logout */}

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 md:px-5 py-2 rounded-lg transition font-medium"
            >
              Logout
            </button>

          </div>

        ) : (

          <div className="flex gap-2 md:gap-3">

            <Link
              to="/login"
              className="px-4 md:px-5 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-50 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-4 md:px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Register
            </Link>

          </div>

        )}

      </div>

    </nav>
  );
}

export default Navbar;