import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobile: "",
    role: "parent",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ============================
  // Handle Input Change
  // ============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // ============================
  // Handle Register
  // ============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      console.log("Sending registration data:", formData);

      const response = await API.post(
        "/auth/register",
        formData
      );

      console.log("Registration response:", response.data);

      if (response.data.success) {
        alert(
          response.data.message ||
          "Registration Successful"
        );

        navigate("/login");
      } else {
        setErrorMessage(
          response.data.message ||
          "Registration Failed"
        );
      }

    } catch (error) {
      console.error(
        "Registration Error:",
        error
      );

      console.error(
        "Server Response:",
        error.response?.data
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration Failed. Please try again.";

      setErrorMessage(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">

      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg">

        {/* Heading */}

        <h1 className="text-3xl font-bold text-center text-green-600 mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Register to continue to Little Steps
        </p>


        {/* Error Message */}

        {errorMessage && (
          <div className="mb-5 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}


        {/* Form */}

        <form
          className="space-y-5"
          onSubmit={handleSubmit}
        >

          {/* Full Name */}

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />


          {/* Email */}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />


          {/* Password */}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />


          {/* Mobile */}

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />


          {/* Role */}

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="parent">
              Parent
            </option>

            <option value="provider">
              Provider
            </option>
          </select>


          {/* Register Button */}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading
              ? "Registering..."
              : "Register"}
          </button>

        </form>


        {/* Login Link */}

        <p className="text-center mt-6 text-gray-600">

          Already have an account?

          <Link
            to="/login"
            className="text-green-600 ml-1 font-semibold hover:underline"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;