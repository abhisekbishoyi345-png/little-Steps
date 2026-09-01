import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "parent",
  });

  const [loading, setLoading] = useState(false);

  // ==============================
  // Handle Input Change
  // ==============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==============================
  // Login
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (res.data.success) {
        const user = res.data.user;

        // ==============================
        // Debug Information
        // ==============================
        console.log("================================");
        console.log("LOGIN RESPONSE:", res.data);
        console.log("LOGGED IN USER:", user);
        console.log("USER EMAIL:", user.email);
        console.log("USER ROLE:", user.role);
        console.log("TOKEN:", res.data.token);
        console.log("================================");

        // Save user + token
        login(user, res.data.token);

        alert("Login Successful! 🎉");

        // ==============================
        // Role Based Redirect
        // ==============================

        if (user.role === "admin") {
          console.log("➡️ Redirecting to Admin Dashboard");
          navigate("/admin-dashboard");
        } 
        
        else if (user.role === "provider") {
          console.log("➡️ Redirecting to Provider Dashboard");
          navigate("/provider-dashboard");
        } 
        
        else if (user.role === "parent") {
          console.log("➡️ Redirecting to Parent Dashboard");
          navigate("/parent-dashboard");
        } 
        
        else {
          console.log("⚠️ Unknown role:", user.role);
          alert("Invalid user role");
        }
      }
    } catch (err) {
      console.log("LOGIN ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Login Failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">

        {/* Heading */}

        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Login
        </h2>

        <form
          className="space-y-5"
          onSubmit={handleSubmit}
        >

          {/* ==============================
              Email
          ============================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* ==============================
              Password
          ============================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* ==============================
              Login As
          ============================== */}

          <div>
            <label className="block mb-2 font-semibold">
              Login As
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="parent">
                Parent
              </option>

              <option value="provider">
                Provider
              </option>

              <option value="admin">
                Admin
              </option>
            </select>
          </div>

          {/* ==============================
              Login Button
          ============================== */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Register */}

        <p className="text-center mt-5">
          Don't have an account?

          <Link
            to="/register"
            className="text-blue-600 ml-1 font-semibold"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;