import { useEffect, useState } from "react";
import API from "src/services/api";

function AdminDashboard() {
  // =================================
  // Childcare Form
  // =================================

  const initialFormData = {
    name: "",
    location: "",
    ageGroup: "",
    timing: "",
    plan: "",
    price: "",
    image: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const [childcareCenters, setChildcareCenters] = useState([]);
  const [loadingChildcare, setLoadingChildcare] = useState(true);

  // Edit mode
  const [editingId, setEditingId] = useState(null);

  // =================================
  // Booking States
  // =================================

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // =================================
  // Search & Filter States
  // =================================

  const [searchTerm, setSearchTerm] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  // =================================
  // Form Change
  // =================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =================================
  // Fetch All Childcare
  // =================================

  const fetchChildcare = async () => {
    try {
      setLoadingChildcare(true);

      const res = await API.get("/childcare");

      if (res.data.success) {
        setChildcareCenters(res.data.childcare || []);
      }
    } catch (error) {
      console.log("Fetch childcare error:", error);
    } finally {
      setLoadingChildcare(false);
    }
  };

  // =================================
  // Fetch All Bookings
  // =================================

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);

      const res = await API.get("/booking");

      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (error) {
      console.log("Fetch bookings error:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // =================================
  // Load Data
  // =================================

  useEffect(() => {
    fetchChildcare();
    fetchBookings();
  }, []);

  // =================================
  // Statistics
  // =================================

  const totalChildcare = childcareCenters.length;

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const acceptedBookings = bookings.filter(
    (booking) => booking.status === "Accepted"
  ).length;

  const rejectedBookings = bookings.filter(
    (booking) => booking.status === "Rejected"
  ).length;

  // =================================
  // Filter Childcare Centers
  // =================================

  const filteredChildcareCenters = childcareCenters.filter(
    (center) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        center.name?.toLowerCase().includes(search) ||
        center.location?.toLowerCase().includes(search) ||
        center.ageGroup?.toLowerCase().includes(search) ||
        center.plan?.toLowerCase().includes(search);

      const matchesAge =
        !ageFilter ||
        center.ageGroup
          ?.toLowerCase()
          .includes(ageFilter.toLowerCase());

      const matchesLocation =
        !locationFilter ||
        center.location
          ?.toLowerCase()
          .includes(locationFilter.toLowerCase());

      const matchesPlan =
        !planFilter ||
        center.plan
          ?.toLowerCase()
          .includes(planFilter.toLowerCase());

      return (
        matchesSearch &&
        matchesAge &&
        matchesLocation &&
        matchesPlan
      );
    }
  );

  // =================================
  // Clear Filters
  // =================================

  const clearFilters = () => {
    setSearchTerm("");
    setAgeFilter("");
    setLocationFilter("");
    setPlanFilter("");
  };

  // =================================
  // Add / Update Childcare
  // =================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;

      if (editingId) {
        // Update Childcare
        res = await API.put(
          `/childcare/${editingId}`,
          formData
        );
      } else {
        // Add Childcare
        res = await API.post(
          "/childcare/add",
          formData
        );
      }

      if (res.data.success) {
        alert(res.data.message);

        setFormData(initialFormData);
        setEditingId(null);

        fetchChildcare();
      }
    } catch (error) {
      console.log("Save childcare error:", error);

      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // =================================
  // Edit Childcare
  // =================================

  const handleEdit = (center) => {
    setEditingId(center._id);

    setFormData({
      name: center.name || "",
      location: center.location || "",
      ageGroup: center.ageGroup || "",
      timing: center.timing || "",
      plan: center.plan || "",
      price: center.price || "",
      image: center.image || "",
      description: center.description || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =================================
  // Cancel Edit
  // =================================

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormData);
  };

  // =================================
  // Delete Childcare
  // =================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this childcare center?"
    );

    if (!confirmed) return;

    try {
      const res = await API.delete(
        `/childcare/${id}`
      );

      if (res.data.success) {
        alert(res.data.message);

        setChildcareCenters((prevCenters) =>
          prevCenters.filter(
            (center) => center._id !== id
          )
        );
      }
    } catch (error) {
      console.log("Delete childcare error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete childcare center"
      );
    }
  };

  // =================================
  // Update Booking Status
  // =================================

  const handleBookingStatus = async (
    bookingId,
    status
  ) => {
    try {
      const res = await API.put(
        `/booking/${bookingId}/status`,
        { status }
      );

      if (res.data.success) {
        alert(res.data.message);

        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  status: res.data.booking.status,
                }
              : booking
          )
        );
      }
    } catch (error) {
      console.log(
        "Update booking status error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update booking"
      );
    }
  };

  // =================================
  // Status Style
  // =================================

  const getStatusClass = (status) => {
    if (status === "Accepted") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-6">

        {/* =================================
            ADMIN HEADER
        ================================= */}

        <div className="bg-blue-600 text-white rounded-2xl p-6 mb-8 shadow-lg">
          <h1 className="text-3xl font-bold">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-blue-100">
            Manage childcare centers and booking
            requests
          </p>
        </div>

        {/* =================================
            STATISTICS
        ================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">

          {/* Total Childcare */}

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Childcare
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {totalChildcare}
                </h3>
              </div>

              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                🏫
              </div>
            </div>
          </div>

          {/* Total Bookings */}

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Bookings
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {totalBookings}
                </h3>
              </div>

              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
          </div>

          {/* Pending */}

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Pending
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {pendingBookings}
                </h3>
              </div>

              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                ⏳
              </div>
            </div>
          </div>

          {/* Accepted */}

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Accepted
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {acceptedBookings}
                </h3>
              </div>

              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>

          {/* Rejected */}

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Rejected
                </p>

                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {rejectedBookings}
                </h3>
              </div>

              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                ❌
              </div>
            </div>
          </div>

        </div>

        {/* =================================
            ADD / EDIT CHILDCARE FORM
        ================================= */}

        <div className="bg-white shadow-xl rounded-xl p-8 mb-10">

          <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
            {editingId
              ? "Edit Childcare Center"
              : "Add Childcare Center"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <input
              type="text"
              name="name"
              placeholder="Childcare Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

            <input
              type="text"
              name="ageGroup"
              placeholder="Age Group"
              value={formData.ageGroup}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

            <input
              type="text"
              name="timing"
              placeholder="Timing"
              value={formData.timing}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

            <input
              type="text"
              name="plan"
              placeholder="Plan"
              value={formData.plan}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

            <input
              type="text"
              name="image"
              placeholder="Image URL"
              value={formData.image}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            />

            <textarea
              name="description"
              placeholder="Description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
              required
            />

            <div className="flex gap-4">

              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                {editingId
                  ? "Update Childcare"
                  : "Add Childcare"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
                >
                  Cancel Edit
                </button>
              )}

            </div>
          </form>
        </div>

        {/* =================================
            ALL CHILDCARE CENTERS
        ================================= */}

        <div className="mb-12">

          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">

            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                All Childcare Centers
              </h2>

              <p className="text-gray-500">
                Search and manage childcare centers
              </p>
            </div>

            <button
              onClick={fetchChildcare}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg"
            >
              Refresh
            </button>

          </div>

          {/* SEARCH & FILTERS */}

          <div className="bg-white rounded-xl shadow-md p-5 mb-6">

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

              <input
                type="text"
                placeholder="🔍 Search childcare..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="Filter by age group"
                value={ageFilter}
                onChange={(e) =>
                  setAgeFilter(e.target.value)
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="Filter by location"
                value={locationFilter}
                onChange={(e) =>
                  setLocationFilter(e.target.value)
                }
                className="border p-3 rounded-lg w-full"
              />

              <input
                type="text"
                placeholder="Filter by plan"
                value={planFilter}
                onChange={(e) =>
                  setPlanFilter(e.target.value)
                }
                className="border p-3 rounded-lg w-full"
              />

            </div>

            <div className="flex justify-between items-center mt-4">

              <p className="text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {filteredChildcareCenters.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {childcareCenters.length}
                </span>{" "}
                centers
              </p>

              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Clear Filters
              </button>

            </div>
          </div>

          {/* CHILDCARE LIST */}

          {loadingChildcare ? (

            <div className="bg-white p-10 rounded-xl text-center">
              Loading Childcare Centers...
            </div>

          ) : filteredChildcareCenters.length === 0 ? (

            <div className="bg-white p-10 rounded-xl text-center">

              <div className="text-5xl mb-3">
                🔍
              </div>

              <h3 className="text-xl font-semibold">
                No Childcare Centers Found
              </h3>

              <p className="text-gray-500 mt-2">
                Try changing your search or filters.
              </p>

              <button
                onClick={clearFilters}
                className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredChildcareCenters.map(
                (center) => (

                  <div
                    key={center._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >

                    {center.image && (
                      <img
                        src={center.image}
                        alt={center.name}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-5">

                      <h3 className="text-xl font-bold">
                        {center.name}
                      </h3>

                      <p className="text-gray-500 mt-1">
                        📍 {center.location}
                      </p>

                      <p className="mt-3">
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

                      <p className="text-blue-600 font-bold text-lg mt-2">
                        ₹{center.price}
                      </p>

                      <p className="text-gray-600 mt-3">
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
                            handleDelete(center._id)
                          }
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold"
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </div>
                  </div>
                )
              )}

            </div>
          )}
        </div>

        {/* =================================
            ALL BOOKINGS
        ================================= */}

        <div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">

            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                All Bookings
              </h2>

              <p className="text-gray-500">
                Manage childcare booking requests
              </p>
            </div>

            <button
              onClick={fetchBookings}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg"
            >
              Refresh
            </button>

          </div>

          {loadingBookings ? (

            <div className="bg-white p-10 rounded-xl text-center">
              Loading Bookings...
            </div>

          ) : bookings.length === 0 ? (

            <div className="bg-white p-10 rounded-xl text-center">
              No Bookings Found
            </div>

          ) : (

            <div className="grid lg:grid-cols-2 gap-6">

              {bookings.map((booking) => (

                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-md p-6"
                >

                  {/* Center + Status */}

                  <div className="flex justify-between items-start gap-4">

                    <div>

                      <h3 className="text-xl font-bold">
                        {booking.childcareId?.name ||
                          "Childcare Center"}
                      </h3>

                      <p className="text-gray-500">
                        📍{" "}
                        {booking.childcareId?.location ||
                          "Location not available"}
                      </p>

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {booking.status ||
                        "Pending"}
                    </span>

                  </div>

                  {/* Booking Information */}

                  <div className="mt-5 space-y-2">

                    <p>
                      <strong>
                        Parent:
                      </strong>{" "}
                      {booking.parentName}
                    </p>

                    <p>
                      <strong>
                        Email:
                      </strong>{" "}
                      {booking.email}
                    </p>

                    <p>
                      <strong>
                        Mobile:
                      </strong>{" "}
                      {booking.mobile}
                    </p>

                    <p>
                      <strong>
                        Child:
                      </strong>{" "}
                      {booking.childName}
                    </p>

                    <p>
                      <strong>
                        Age:
                      </strong>{" "}
                      {booking.childAge} years
                    </p>

                    <p>
                      <strong>
                        Date:
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
                    <div className="mt-4 bg-gray-50 p-3 rounded-lg">

                      <strong>
                        Special Request:
                      </strong>

                      <p className="mt-1">
                        {booking.specialRequest}
                      </p>

                    </div>
                  )}

                  {/* Accept / Reject */}

                  {booking.status ===
                    "Pending" && (

                    <div className="flex gap-3 mt-6">

                      <button
                        onClick={() =>
                          handleBookingStatus(
                            booking._id,
                            "Accepted"
                          )
                        }
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                      >
                        ✓ Accept
                      </button>

                      <button
                        onClick={() =>
                          handleBookingStatus(
                            booking._id,
                            "Rejected"
                          )
                        }
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
                      >
                        ✕ Reject
                      </button>

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;