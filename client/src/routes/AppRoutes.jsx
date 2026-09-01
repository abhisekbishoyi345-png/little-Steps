import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Search from "../pages/Search/Search";

import ParentDashboard from "../pages/ParentDashboard/ParentDashboard";
import ProviderDashboard from "../pages/ProviderDashboard/ProviderDashboard";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";

import ChildcareDetails from "../pages/ChildcareDetails/ChildcareDetails";
import BookingForm from "../pages/Booking/BookingForm";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= Public Routes ================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/search" element={<Search />} />

        <Route
          path="/childcare/:id"
          element={<ChildcareDetails />}
        />

        {/* ================= Parent Routes ================= */}

        <Route
          path="/parent-dashboard"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute allowedRoles={["parent"]}>
              <BookingForm />
            </ProtectedRoute>
          }
        />

        {/* ================= Provider Routes ================= */}

        <Route
          path="/provider-dashboard"
          element={
            <ProtectedRoute allowedRoles={["provider"]}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= Admin Routes ================= */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= Invalid Route ================= */}

        <Route path="*" element={<Home />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;