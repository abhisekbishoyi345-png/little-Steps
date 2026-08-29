import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ProviderDashboard() {
  const navigate = useNavigate();

  // =====================================
  // Authentication
  // =====================================

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const API_URL = "http://localhost:5000/api";

  // =====================================
  // Initial Form
  // =====================================

  const initialFormData = {
    name: "",
    location: "",
    ageGroup: "",
    timing: "",
    plan: "",
    price: "",
    description: "",

    capacity: "",
    availableSlots: "",
    is24x7: false,
    availability: "Available",

    hourly: "",
    daily: "",
    monthly: "",

    caregivers: "",
    safetyMeasures: "",
    certifications: "",
  };

  // =====================================
  // Form States
  // =====================================

  const [formData, setFormData] = useState(initialFormData);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // =====================================
  // Childcare States
  // =====================================

  const [childcareCenters, setChildcareCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================
  // Booking States
  // =====================================

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  // =====================================
  // Auth Config
  // =====================================

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // =====================================
  // Logout
  // =====================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =====================================
  // Form Change
  // =====================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================
  // Image Change
  // =====================================

  const handleImageChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setImage(null);
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      setImage(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      e.target.value = "";
      setImage(null);
      return;
    }

    setImage(selectedFile);
  };

  // =====================================
  // Convert comma separated string to array
  // =====================================

  const stringToArray = (value) => {
    if (!value || !value.trim()) {
      return [];
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  // =====================================
  // Convert array to string
  // =====================================

  const arrayToString = (value) => {
    if (!Array.isArray(value)) {
      return "";
    }

    return value.join(", ");
  };

  // =====================================
  // Reset Form
  // =====================================

  const resetForm = () => {
    setFormData(initialFormData);
    setImage(null);
    setEditingId(null);

    const fileInput = document.getElementById(
      "childcareImage"
    );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =====================================
  // Fetch MY Childcare
  // =====================================

  const fetchChildcare = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/childcare/my`,
        getAuthConfig()
      );

      if (res.data.success) {
        setChildcareCenters(res.data.childcare || []);
      } else {
        setChildcareCenters([]);
      }
    } catch (error) {
      console.error("Fetch my childcare error:", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        alert(
          "You are not authorized to view childcare centers."
        );
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to load your childcare centers."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Fetch Provider Bookings
  // =====================================

  const fetchBookings = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoadingBookings(true);

      const res = await axios.get(
        `${API_URL}/booking/provider`,
        getAuthConfig()
      );

      if (res.data.success) {
        setBookings(res.data.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error(
        "Fetch provider bookings error:",
        error
      );

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        alert(
          "You are not authorized to view bookings."
        );
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to load booking requests."
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  // =====================================
  // Initial Load
  // =====================================

  useEffect(() => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "provider") {
      alert(
        "You are not authorized to access Provider Dashboard."
      );
      navigate("/");
      return;
    }

    fetchChildcare();
    fetchBookings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================
  // Add / Update Childcare
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    // =====================================
    // Basic Validation
    // =====================================

    if (
      !formData.name.trim() ||
      !formData.location.trim() ||
      !formData.ageGroup.trim() ||
      !formData.timing.trim() ||
      !formData.plan.trim() ||
      formData.price === "" ||
      !formData.description.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // =====================================
    // Price Validation
    // =====================================

    const basePrice = Number(formData.price);

    if (!Number.isFinite(basePrice) || basePrice < 0) {
      alert("Price cannot be negative.");
      return;
    }

    // =====================================
    // Capacity Validation
    // =====================================

    if (
      formData.capacity === "" ||
      formData.capacity === undefined
    ) {
      alert("Please enter childcare capacity.");
      return;
    }

    const capacity = Number(formData.capacity);

    if (!Number.isInteger(capacity) || capacity < 1) {
      alert("Capacity must be at least 1.");
      return;
    }

    // =====================================
    // Available Slots
    // =====================================

    let availableSlots;

    if (
      formData.availableSlots === "" ||
      formData.availableSlots === undefined
    ) {
      availableSlots = capacity;
    } else {
      availableSlots = Number(formData.availableSlots);
    }

    if (
      !Number.isInteger(availableSlots) ||
      availableSlots < 0 ||
      availableSlots > capacity
    ) {
      alert(
        "Available slots must be between 0 and capacity."
      );
      return;
    }

    // =====================================
    // Pricing Validation
    // =====================================

    const hourly =
      formData.hourly === ""
        ? ""
        : Number(formData.hourly);

    const daily =
      formData.daily === ""
        ? ""
        : Number(formData.daily);

    const monthly =
      formData.monthly === ""
        ? ""
        : Number(formData.monthly);

    if (
      hourly !== "" &&
      (!Number.isFinite(hourly) || hourly < 0)
    ) {
      alert("Hourly price must be a valid positive number.");
      return;
    }

    if (
      daily !== "" &&
      (!Number.isFinite(daily) || daily < 0)
    ) {
      alert("Daily price must be a valid positive number.");
      return;
    }

    if (
      monthly !== "" &&
      (!Number.isFinite(monthly) || monthly < 0)
    ) {
      alert(
        "Monthly price must be a valid positive number."
      );
      return;
    }

    // =====================================
    // Image Validation
    // =====================================

    if (!editingId && !image) {
      alert("Please choose a childcare image.");
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();

      // =====================================
      // Basic Fields
      // =====================================

      data.append("name", formData.name.trim());
      data.append("location", formData.location.trim());
      data.append("ageGroup", formData.ageGroup.trim());
      data.append("timing", formData.timing.trim());
      data.append("plan", formData.plan.trim());
      data.append("price", String(basePrice));
      data.append(
        "description",
        formData.description.trim()
      );

      // =====================================
      // Capacity
      // =====================================

      data.append("capacity", String(capacity));
      data.append(
        "availableSlots",
        String(availableSlots)
      );

      // =====================================
      // 24x7
      // =====================================

      data.append(
        "is24x7",
        formData.is24x7 ? "true" : "false"
      );

      // =====================================
      // Availability
      // =====================================

      data.append(
        "availability",
        formData.availability
      );

      // =====================================
      // Pricing Plans
      // =====================================

      const pricingPlans = {};

      if (hourly !== "") {
        pricingPlans.hourly = hourly;
      }

      if (daily !== "") {
        pricingPlans.daily = daily;
      }

      if (monthly !== "") {
        pricingPlans.monthly = monthly;
      }

      data.append(
        "pricingPlans",
        JSON.stringify(pricingPlans)
      );

      // Backend compatibility
      if (hourly !== "") {
        data.append("hourly", String(hourly));
      }

      if (daily !== "") {
        data.append("daily", String(daily));
      }

      if (monthly !== "") {
        data.append("monthly", String(monthly));
      }

      // =====================================
      // Caregivers
      // =====================================

      data.append(
        "caregivers",
        JSON.stringify(
          stringToArray(formData.caregivers)
        )
      );

      // =====================================
      // Safety Measures
      // =====================================

      data.append(
        "safetyMeasures",
        JSON.stringify(
          stringToArray(formData.safetyMeasures)
        )
      );

      // =====================================
      // Certifications
      // =====================================

      data.append(
        "certifications",
        JSON.stringify(
          stringToArray(formData.certifications)
        )
      );

      // =====================================
      // Image
      // =====================================

      if (image) {
        data.append("image", image);
      }

      let res;

      // =====================================
      // UPDATE
      // =====================================

      if (editingId) {
        res = await axios.put(
          `${API_URL}/childcare/${editingId}`,
          data,
          getAuthConfig()
        );
      }

      // =====================================
      // ADD
      // =====================================

      else {
        res = await axios.post(
          `${API_URL}/childcare/add`,
          data,
          getAuthConfig()
        );
      }

      // =====================================
      // Success
      // =====================================

      if (res.data.success) {
        alert(
          res.data.message ||
            "Childcare saved successfully."
        );

        resetForm();

        await fetchChildcare();
      }
    } catch (error) {
      console.error(
        "Save childcare error:",
        error
      );

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        alert(
          "You are not authorized to perform this action."
        );
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to save childcare center."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // Edit Childcare
  // =====================================

  const handleEdit = (center) => {
    setEditingId(center._id);

    const pricing = center.pricingPlans || {};

    setFormData({
      name: center.name || "",
      location: center.location || "",
      ageGroup: center.ageGroup || "",
      timing: center.timing || "",
      plan: center.plan || "",

      price:
        center.price !== undefined &&
        center.price !== null
          ? center.price
          : "",

      description: center.description || "",

      capacity:
        center.capacity !== undefined &&
        center.capacity !== null
          ? center.capacity
          : "",

      availableSlots:
        center.availableSlots !== undefined &&
        center.availableSlots !== null
          ? center.availableSlots
          : "",

      is24x7: Boolean(center.is24x7),

      availability:
        center.availability || "Available",

      hourly:
        pricing.hourly !== undefined &&
        pricing.hourly !== null
          ? pricing.hourly
          : "",

      daily:
        pricing.daily !== undefined &&
        pricing.daily !== null
          ? pricing.daily
          : "",

      monthly:
        pricing.monthly !== undefined &&
        pricing.monthly !== null
          ? pricing.monthly
          : "",

      caregivers: arrayToString(
        center.caregivers
      ),

      safetyMeasures: arrayToString(
        center.safetyMeasures
      ),

      certifications: arrayToString(
        center.certifications
      ),
    });

    setImage(null);

    const fileInput =
      document.getElementById(
        "childcareImage"
      );

    if (fileInput) {
      fileInput.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================
  // Cancel Edit
  // =====================================

  const handleCancelEdit = () => {
    resetForm();
  };

  // =====================================
  // Delete Childcare
  // =====================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this childcare center?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await axios.delete(
        `${API_URL}/childcare/${id}`,
        getAuthConfig()
      );

      if (res.data.success) {
        alert(
          res.data.message ||
            "Childcare deleted successfully."
        );

        setChildcareCenters((prev) =>
          prev.filter(
            (center) => center._id !== id
          )
        );

        if (editingId === id) {
          resetForm();
        }

        // Refresh bookings because deleting a center
        // can affect provider booking data.
        await fetchBookings();
      }
    } catch (error) {
      console.error(
        "Delete childcare error:",
        error
      );

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        alert(
          "You are not authorized to delete this childcare center."
        );
        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to delete childcare center."
      );
    }
  };

  // =====================================
  // Update Booking Status
  // =====================================

  const handleBookingStatus = async (
    bookingId,
    status
  ) => {
    if (!bookingId) {
      alert("Invalid booking ID.");
      return;
    }

    if (
      !["Accepted", "Rejected"].includes(status)
    ) {
      return;
    }

    const action =
      status === "Accepted"
        ? "accept"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this booking?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingBookingId(bookingId);

      const res = await axios.put(
        `${API_URL}/booking/${bookingId}/status`,
        {
          status,
        },
        getAuthConfig()
      );

      if (res.data.success) {
        alert(
          res.data.message ||
            `Booking ${status} successfully.`
        );

        /*
         * Instead of only changing the status locally,
         * refresh both bookings and childcare centers.
         *
         * This is important because Accept/Reject can
         * change availableSlots and availability.
         */

        await Promise.all([
          fetchBookings(),
          fetchChildcare(),
        ]);
      }
    } catch (error) {
      console.error(
        "Update booking status error:",
        error
      );

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        handleLogout();
        return;
      }

      if (error.response?.status === 403) {
        alert(
          error.response?.data?.message ||
            "You are not authorized to update this booking."
        );
        return;
      }

      if (error.response?.status === 400) {
        alert(
          error.response?.data?.message ||
            "This booking cannot be updated."
        );

        // Refresh because backend may have changed
        // data before returning an error.
        await Promise.all([
          fetchBookings(),
          fetchChildcare(),
        ]);

        return;
      }

      alert(
        error.response?.data?.message ||
          "Failed to update booking status."
      );
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // =====================================
  // Booking Status Class
  // =====================================

  const getStatusClass = (status) => {
    if (status === "Accepted") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // =====================================
  // Image URL
  // =====================================

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "";
    }

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    return `http://localhost:5000${imagePath}`;
  };

  // =====================================
  // Booking Statistics
  // =====================================

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.status === "Pending"
  ).length;

  const acceptedBookings = bookings.filter(
    (booking) =>
      booking.status === "Accepted"
  ).length;

  const rejectedBookings = bookings.filter(
    (booking) =>
      booking.status === "Rejected"
  ).length;

  // =====================================
  // JSX
  // =====================================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <div>
            <h1 className="text-3xl font-bold">
              Provider Dashboard
            </h1>

            <p className="text-blue-100 mt-1">
              Welcome,{" "}
              {user?.fullName || "Provider"} 👋
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-semibold transition"
          >
            Logout
          </button>

        </div>
      </div>

      {/* =====================================
          MAIN
      ===================================== */}

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* =====================================
            PROVIDER INFORMATION
        ===================================== */}

        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">

          <h2 className="text-2xl font-bold mb-5">
            Provider Information
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="font-semibold mt-1">
                {user?.fullName || "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="font-semibold mt-1 break-all">
                {user?.email || "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">
                Role
              </p>

              <p className="font-semibold mt-1 capitalize">
                {user?.role || "provider"}
              </p>
            </div>

          </div>
        </div>

        {/* =====================================
            BOOKING STATISTICS
        ===================================== */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Total Bookings
            </p>

            <h3 className="text-3xl font-bold text-blue-600 mt-2">
              {bookings.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Pending
            </p>

            <h3 className="text-3xl font-bold text-yellow-500 mt-2">
              {pendingBookings}
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Accepted
            </p>

            <h3 className="text-3xl font-bold text-green-600 mt-2">
              {acceptedBookings}
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Rejected
            </p>

            <h3 className="text-3xl font-bold text-red-600 mt-2">
              {rejectedBookings}
            </h3>
          </div>

        </div>

        {/* =====================================
            ADD / EDIT CHILDCARE
        ===================================== */}

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">

          <h2 className="text-3xl font-bold text-blue-600 mb-7 text-center">
            {editingId
              ? "Edit Childcare Center"
              : "Add Childcare Center"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* BASIC INFORMATION */}

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Basic Information
              </h3>

              <div className="grid md:grid-cols-2 gap-4">

                <div>
                  <label className="block font-semibold mb-2">
                    Childcare Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Childcare Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Location *
                  </label>

                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Age Group *
                  </label>

                  <input
                    type="text"
                    name="ageGroup"
                    placeholder="e.g. Infant, Toddler, Preschool"
                    value={formData.ageGroup}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Timing *
                  </label>

                  <input
                    type="text"
                    name="timing"
                    placeholder="e.g. 8 AM - 6 PM"
                    value={formData.timing}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Main Plan *
                  </label>

                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg bg-white"
                    required
                  >
                    <option value="">
                      Select Plan
                    </option>

                    <option value="Hourly">
                      Hourly
                    </option>

                    <option value="Daily">
                      Daily
                    </option>

                    <option value="Monthly">
                      Monthly
                    </option>

                    <option value="Flexible">
                      Flexible
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Main Price *
                  </label>

                  <input
                    type="number"
                    name="price"
                    placeholder="Base Price"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                  />
                </div>

              </div>
            </div>

            {/* CAPACITY */}

            <div className="border-t pt-6">

              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Capacity & Availability
              </h3>

              <div className="grid md:grid-cols-3 gap-4">

                <div>
                  <label className="block font-semibold mb-2">
                    Total Capacity *
                  </label>

                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    placeholder="e.g. 30"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Available Slots
                  </label>

                  <input
                    type="number"
                    name="availableSlots"
                    min="0"
                    placeholder="e.g. 10"
                    value={formData.availableSlots}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg"
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use full capacity.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Availability Status
                  </label>

                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg bg-white"
                  >
                    <option value="Available">
                      Available
                    </option>

                    <option value="Limited">
                      Limited Availability
                    </option>

                    <option value="Full">
                      Full
                    </option>

                    <option value="Unavailable">
                      Unavailable
                    </option>
                  </select>
                </div>

              </div>

              <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">

                <label className="flex items-center gap-3 cursor-pointer">

                  <input
                    type="checkbox"
                    name="is24x7"
                    checked={formData.is24x7}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />

                  <div>
                    <p className="font-bold text-gray-800">
                      24×7 Childcare Available
                    </p>

                    <p className="text-sm text-gray-500">
                      Enable this if your center provides
                      childcare services 24 hours a day.
                    </p>
                  </div>

                </label>

              </div>

            </div>

            {/* PRICING */}

            <div className="border-t pt-6">

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Hourly / Daily / Monthly Pricing
              </h3>

              <p className="text-sm text-gray-500 mb-4">
                Add any pricing plans that your childcare
                center supports.
              </p>

              <div className="grid md:grid-cols-3 gap-4">

                <div className="bg-gray-50 rounded-xl p-4">

                  <label className="block font-semibold mb-2">
                    Hourly Price
                  </label>

                  <input
                    type="number"
                    name="hourly"
                    min="0"
                    placeholder="₹ per hour"
                    value={formData.hourly}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg bg-white"
                  />

                </div>

                <div className="bg-gray-50 rounded-xl p-4">

                  <label className="block font-semibold mb-2">
                    Daily Price
                  </label>

                  <input
                    type="number"
                    name="daily"
                    min="0"
                    placeholder="₹ per day"
                    value={formData.daily}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg bg-white"
                  />

                </div>

                <div className="bg-gray-50 rounded-xl p-4">

                  <label className="block font-semibold mb-2">
                    Monthly Price
                  </label>

                  <input
                    type="number"
                    name="monthly"
                    min="0"
                    placeholder="₹ per month"
                    value={formData.monthly}
                    onChange={handleChange}
                    className="w-full border p-3 rounded-lg bg-white"
                  />

                </div>

              </div>
            </div>

            {/* CAREGIVERS */}

            <div className="border-t pt-6">

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Caregiver Profiles
              </h3>

              <p className="text-sm text-gray-500 mb-3">
                Add caregiver names/profiles separated by
                commas.
              </p>

              <textarea
                name="caregivers"
                placeholder="e.g. Priya Sharma - 5 years experience, Anjali Verma - Certified Caregiver"
                rows="4"
                value={formData.caregivers}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />

            </div>

            {/* SAFETY */}

            <div className="border-t pt-6">

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Safety Measures
              </h3>

              <p className="text-sm text-gray-500 mb-3">
                Add safety features separated by commas.
              </p>

              <textarea
                name="safetyMeasures"
                placeholder="e.g. CCTV Monitoring, First Aid Kit, Secure Entry, Fire Safety"
                rows="4"
                value={formData.safetyMeasures}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />

            </div>

            {/* CERTIFICATIONS */}

            <div className="border-t pt-6">

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Certifications
              </h3>

              <p className="text-sm text-gray-500 mb-3">
                Add certifications separated by commas.
              </p>

              <textarea
                name="certifications"
                placeholder="e.g. First Aid Certified, Child Safety Certified, ISO Certified"
                rows="4"
                value={formData.certifications}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />

            </div>

            {/* IMAGE */}

            <div className="border-t pt-6">

              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Childcare Image
              </h3>

              <div className="border rounded-lg p-4 bg-gray-50">

                <label
                  htmlFor="childcareImage"
                  className="block font-semibold mb-2"
                >
                  Upload Image {!editingId && "*"}
                </label>

                <input
                  id="childcareImage"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full"
                />

                {image && (
                  <div className="mt-3">

                    <p className="text-sm text-green-600">
                      Selected: {image.name}
                    </p>

                    <img
                      src={URL.createObjectURL(image)}
                      alt="Selected childcare"
                      className="mt-3 w-full max-w-sm h-48 object-cover rounded-lg"
                    />

                  </div>
                )}

                {editingId && !image && (
                  <p className="text-sm text-gray-500 mt-2">
                    Leave empty to keep the existing image.
                  </p>
                )}

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="border-t pt-6">

              <label className="block font-semibold mb-2">
                Description *
              </label>

              <textarea
                name="description"
                placeholder="Describe your childcare center..."
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
                required
              />

            </div>

            {/* BUTTONS */}

            <div className="flex flex-col md:flex-row gap-4 pt-2">

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                  ? "Update Childcare"
                  : "Add Childcare"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold"
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>
        </div>

        {/* =====================================
            MY CHILDCARE CENTERS
        ===================================== */}

        <div className="mb-12">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                My Childcare Centers
              </h2>

              <p className="text-gray-500 mt-1">
                Manage your childcare centers.
              </p>
            </div>

            <div className="flex items-center gap-3">

              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                {childcareCenters.length}{" "}
                {childcareCenters.length === 1
                  ? "Center"
                  : "Centers"}
              </span>

              <button
                onClick={fetchChildcare}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

            </div>

          </div>

          {loading ? (

            <div className="bg-white rounded-2xl shadow-md p-12 text-center">

              <div className="text-5xl mb-4">
                ⏳
              </div>

              <h3 className="text-xl font-semibold">
                Loading Childcare Centers...
              </h3>

            </div>

          ) : childcareCenters.length === 0 ? (

            <div className="bg-white rounded-2xl shadow-md p-12 text-center">

              <div className="text-6xl mb-4">
                🏫
              </div>

              <h3 className="text-2xl font-bold">
                No Childcare Centers
              </h3>

              <p className="text-gray-500 mt-2">
                You haven't added any childcare centers yet.
              </p>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {childcareCenters.map((center) => (

                <div
                  key={center._id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
                >

                  {center.image ? (

                    <img
                      src={getImageUrl(center.image)}
                      alt={center.name}
                      className="w-full h-48 object-cover"
                    />

                  ) : (

                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>

                  )}

                  <div className="p-5">

                    <h3 className="text-xl font-bold text-gray-800">
                      {center.name}
                    </h3>

                    <p className="text-gray-500 mt-1">
                      📍 {center.location}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          center.availability ===
                          "Available"
                            ? "bg-green-100 text-green-700"
                            : center.availability ===
                              "Limited"
                            ? "bg-yellow-100 text-yellow-700"
                            : center.availability ===
                              "Full"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {center.availability ||
                          "Available"}
                      </span>

                      {center.is24x7 && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                          24×7
                        </span>
                      )}

                      {center.verified && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          ✓ Verified
                        </span>
                      )}

                    </div>

                    <div className="mt-4 space-y-2">

                      <p>
                        <strong>
                          Age Group:
                        </strong>{" "}
                        {center.ageGroup}
                      </p>

                      <p>
                        <strong>
                          Timing:
                        </strong>{" "}
                        {center.timing}
                      </p>

                      <p>
                        <strong>
                          Plan:
                        </strong>{" "}
                        {center.plan}
                      </p>

                      <p>
                        <strong>
                          Capacity:
                        </strong>{" "}
                        {center.capacity ?? "N/A"}
                      </p>

                      <p>
                        <strong>
                          Available Slots:
                        </strong>{" "}
                        {center.availableSlots ?? "N/A"}
                      </p>

                      <p className="text-blue-600 font-bold text-lg">
                        ₹{center.price}
                      </p>

                    </div>

                    {center.pricingPlans &&
                      (center.pricingPlans.hourly !==
                        undefined ||
                        center.pricingPlans.daily !==
                          undefined ||
                        center.pricingPlans.monthly !==
                          undefined) && (

                        <div className="mt-4 bg-gray-50 rounded-xl p-4">

                          <h4 className="font-bold mb-2">
                            Pricing Plans
                          </h4>

                          <div className="space-y-1 text-sm">

                            {center.pricingPlans.hourly !==
                              undefined && (
                              <p>
                                <strong>
                                  Hourly:
                                </strong>{" "}
                                ₹
                                {
                                  center.pricingPlans
                                    .hourly
                                }
                              </p>
                            )}

                            {center.pricingPlans.daily !==
                              undefined && (
                              <p>
                                <strong>
                                  Daily:
                                </strong>{" "}
                                ₹
                                {
                                  center.pricingPlans
                                    .daily
                                }
                              </p>
                            )}

                            {center.pricingPlans.monthly !==
                              undefined && (
                              <p>
                                <strong>
                                  Monthly:
                                </strong>{" "}
                                ₹
                                {
                                  center.pricingPlans
                                    .monthly
                                }
                              </p>
                            )}

                          </div>

                        </div>
                      )}

                    {center.caregivers?.length > 0 && (

                      <div className="mt-4">

                        <h4 className="font-bold">
                          👩‍👧 Caregivers
                        </h4>

                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">

                          {center.caregivers.map(
                            (caregiver, index) => (
                              <li key={index}>
                                {caregiver}
                              </li>
                            )
                          )}

                        </ul>

                      </div>

                    )}

                    {center.safetyMeasures?.length > 0 && (

                      <div className="mt-4">

                        <h4 className="font-bold">
                          🛡️ Safety Measures
                        </h4>

                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">

                          {center.safetyMeasures.map(
                            (measure, index) => (
                              <li key={index}>
                                {measure}
                              </li>
                            )
                          )}

                        </ul>

                      </div>

                    )}

                    {center.certifications?.length > 0 && (

                      <div className="mt-4">

                        <h4 className="font-bold">
                          🏆 Certifications
                        </h4>

                        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">

                          {center.certifications.map(
                            (certification, index) => (
                              <li key={index}>
                                {certification}
                              </li>
                            )
                          )}

                        </ul>

                      </div>

                    )}

                    <p className="text-gray-600 mt-4">
                      {center.description}
                    </p>

                    <div className="flex gap-3 mt-5">

                      <button
                        onClick={() =>
                          handleEdit(center)
                        }
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            center._id
                          )
                        }
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold"
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>
                </div>

              ))}

            </div>

          )}

        </div>

        {/* =====================================
            BOOKING REQUESTS
        ===================================== */}

        <div className="mb-10">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

            <div>

              <h2 className="text-3xl font-bold text-gray-800">
                Booking Requests
              </h2>

              <p className="text-gray-500 mt-1">
                Manage booking requests for your childcare centers.
              </p>

            </div>

            <button
              onClick={fetchBookings}
              disabled={loadingBookings}
              className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg"
            >
              {loadingBookings
                ? "Refreshing..."
                : "Refresh Bookings"}
            </button>

          </div>

          {loadingBookings ? (

            <div className="bg-white rounded-2xl shadow-md p-12 text-center">

              <div className="text-5xl mb-4">
                ⏳
              </div>

              <h3 className="text-xl font-semibold">
                Loading Booking Requests...
              </h3>

            </div>

          ) : bookings.length === 0 ? (

            <div className="bg-white rounded-2xl shadow-md p-12 text-center">

              <div className="text-6xl mb-4">
                📋
              </div>

              <h3 className="text-2xl font-bold">
                No Booking Requests
              </h3>

              <p className="text-gray-500 mt-2">
                There are currently no bookings for your childcare centers.
              </p>

            </div>

          ) : (

            <div className="grid lg:grid-cols-2 gap-6">

              {bookings.map((booking) => {

                const isUpdating =
                  updatingBookingId === booking._id;

                return (
                  <div
                    key={booking._id}
                    className="bg-white rounded-2xl shadow-md p-6"
                  >

                    {/* Booking Header */}

                    <div className="flex justify-between items-start gap-4">

                      <div>

                        <h3 className="text-xl font-bold text-gray-800">
                          {booking.childcareId?.name ||
                            "Childcare Center"}
                        </h3>

                        <p className="text-gray-500 mt-1">
                          📍{" "}
                          {booking.childcareId?.location ||
                            "Location unavailable"}
                        </p>

                      </div>

                      <span
                        className={`px-3 py-1 rounded-full font-semibold text-sm whitespace-nowrap ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>

                    </div>

                    {/* Parent Information */}

                    <div className="mt-5 bg-gray-50 rounded-xl p-4">

                      <h4 className="font-bold text-lg mb-3">
                        Parent Information
                      </h4>

                      <div className="space-y-2">

                        <p>
                          <strong>
                            Name:
                          </strong>{" "}
                          {booking.parentName ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Email:
                          </strong>{" "}
                          {booking.email ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Mobile:
                          </strong>{" "}
                          {booking.mobile ||
                            "N/A"}
                        </p>

                      </div>

                    </div>

                    {/* Child Information */}

                    <div className="mt-4 bg-gray-50 rounded-xl p-4">

                      <h4 className="font-bold text-lg mb-3">
                        Child Information
                      </h4>

                      <div className="space-y-2">

                        <p>
                          <strong>
                            Child Name:
                          </strong>{" "}
                          {booking.childName ||
                            "N/A"}
                        </p>

                        <p>
                          <strong>
                            Age:
                          </strong>{" "}
                          {booking.childAge ?? "N/A"}{" "}
                          years
                        </p>

                      </div>

                    </div>

                    {/* Booking Information */}

                    <div className="mt-4 space-y-2">

                      <p>
                        <strong>
                          Booking Date:
                        </strong>{" "}
                        {booking.bookingDate
                          ? new Date(
                              booking.bookingDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>

                      <p>
                        <strong>
                          Timing:
                        </strong>{" "}
                        {booking.timing ||
                          "N/A"}
                      </p>

                    </div>

                    {/* Special Request */}

                    {booking.specialRequest && (

                      <div className="mt-4 bg-blue-50 border border-blue-100 p-4 rounded-xl">

                        <p className="font-bold">
                          Special Request
                        </p>

                        <p className="text-gray-600 mt-1">
                          {booking.specialRequest}
                        </p>

                      </div>

                    )}

                    {/* Accept / Reject */}

                    {booking.status ===
                      "Pending" && (

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">

                        <button
                          onClick={() =>
                            handleBookingStatus(
                              booking._id,
                              "Accepted"
                            )
                          }
                          disabled={isUpdating}
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
                        >
                          {isUpdating
                            ? "Updating..."
                            : "✓ Accept Booking"}
                        </button>

                        <button
                          onClick={() =>
                            handleBookingStatus(
                              booking._id,
                              "Rejected"
                            )
                          }
                          disabled={isUpdating}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
                        >
                          {isUpdating
                            ? "Updating..."
                            : "✕ Reject Booking"}
                        </button>

                      </div>

                    )}

                    {/* Accepted */}

                    {booking.status ===
                      "Accepted" && (

                      <div className="mt-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-center font-semibold">
                        ✓ This booking has been accepted.
                      </div>

                    )}

                    {/* Rejected */}

                    {booking.status ===
                      "Rejected" && (

                      <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center font-semibold">
                        ✕ This booking has been rejected.
                      </div>

                    )}

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </div>
    </div>
  );
}

export default ProviderDashboard;