import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ===============================
  // Logout
  // ===============================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ===============================
  // Fetch Parent Bookings
  // ===============================

  const fetchBookings = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/booking/parent/${encodeURIComponent(
          user.email
        )}`
      );

      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (error) {
      console.log("Fetch parent bookings error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load your bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // Load Bookings
  // ===============================

  useEffect(() => {
    fetchBookings();
  }, [user?.email]);

  // ===============================
  // Cancel Booking
  // ===============================

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(bookingId);

      const res = await axios.delete(
        `http://localhost:5000/api/booking/${bookingId}`
      );

      if (res.data.success) {
        alert("Booking Cancelled Successfully");

        setBookings((prevBookings) =>
          prevBookings.filter(
            (booking) => booking._id !== bookingId
          )
        );
      }
    } catch (error) {
      console.log("Cancel booking error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to cancel booking"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ===============================
  // Status Styling
  // ===============================

  const getStatusClass = (status) => {
    if (status === "Accepted") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "Rejected") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  // ===============================
  // Status Message
  // ===============================

  const getStatusMessage = (status) => {
    if (status === "Accepted") {
      return "Your booking has been accepted by the admin.";
    }

    if (status === "Rejected") {
      return "Unfortunately, this booking has been rejected.";
    }

    return "Your booking is waiting for admin approval.";
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

          <div>
            <h1 className="text-3xl font-bold">
              Parent Dashboard
            </h1>

            <p className="mt-1 text-blue-100">
              Welcome, {user?.fullName || "Parent"} 👋
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

      {/* MAIN CONTENT */}

      <div className="max-w-7xl mx-auto p-6 md:p-8">

        {/* ACCOUNT INFORMATION */}

        <div className="bg-white shadow-md rounded-2xl p-6 mb-8">

          <h2 className="text-2xl font-bold mb-5">
            Account Information
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500 text-sm">
                Name
              </p>

              <p className="font-semibold mt-1">
                {user?.fullName || "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500 text-sm">
                Email
              </p>

              <p className="font-semibold mt-1 break-all">
                {user?.email || "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500 text-sm">
                Role
              </p>

              <p className="font-semibold mt-1 capitalize">
                {user?.role || "parent"}
              </p>
            </div>

          </div>
        </div>

        {/* MY BOOKINGS HEADER */}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              My Bookings
            </h2>

            <p className="text-gray-500 mt-1">
              Track your childcare booking requests.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <span className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-semibold">
              {bookings.length}{" "}
              {bookings.length === 1
                ? "Booking"
                : "Bookings"}
            </span>

            <button
              onClick={fetchBookings}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg"
            >
              Refresh
            </button>

          </div>
        </div>

        {/* LOADING */}

        {loading ? (

          <div className="bg-white rounded-2xl shadow-md p-12 text-center">

            <div className="text-5xl mb-4">
              ⏳
            </div>

            <h3 className="text-xl font-semibold">
              Loading Your Bookings...
            </h3>

          </div>

        ) : bookings.length === 0 ? (

          /* NO BOOKINGS */

          <div className="bg-white rounded-2xl shadow-md p-12 text-center">

            <div className="text-6xl mb-4">
              📅
            </div>

            <h3 className="text-2xl font-bold">
              No Bookings Yet
            </h3>

            <p className="text-gray-500 mt-2">
              You haven't made any childcare bookings yet.
            </p>

            <button
              onClick={() => navigate("/search")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Find Childcare
            </button>

          </div>

        ) : (

          /* BOOKING CARDS */

          <div className="grid lg:grid-cols-2 gap-6">

            {bookings.map((booking) => (

              <div
                key={booking._id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
              >

                {/* CHILDCARE IMAGE */}

                {booking.childcareId?.image && (
                  <img
                    src={booking.childcareId.image}
                    alt={
                      booking.childcareId?.name ||
                      "Childcare Center"
                    }
                    className="w-full h-52 object-cover"
                  />
                )}

                <div className="p-6">

                  {/* CENTER + STATUS */}

                  <div className="flex justify-between items-start gap-4">

                    <div>

                      <h3 className="text-2xl font-bold text-gray-800">
                        {booking.childcareId?.name ||
                          "Childcare Center"}
                      </h3>

                      {booking.childcareId?.location && (
                        <p className="text-gray-500 mt-1">
                          📍 {booking.childcareId.location}
                        </p>
                      )}

                    </div>

                    <span
                      className={`px-3 py-1 rounded-full border text-sm font-semibold whitespace-nowrap ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {booking.status || "Pending"}
                    </span>

                  </div>

                  {/* STATUS MESSAGE */}

                  <div
                    className={`mt-5 rounded-xl p-4 border ${getStatusClass(
                      booking.status
                    )}`}
                  >

                    <p className="font-semibold">
                      {booking.status === "Accepted"
                        ? "✅ Booking Accepted"
                        : booking.status === "Rejected"
                        ? "❌ Booking Rejected"
                        : "⏳ Booking Pending"}
                    </p>

                    <p className="text-sm mt-1">
                      {getStatusMessage(
                        booking.status
                      )}
                    </p>

                  </div>

                  {/* CHILD INFORMATION */}

                  <div className="mt-5 bg-gray-50 rounded-xl p-4">

                    <h4 className="font-bold text-lg mb-3">
                      Child Information
                    </h4>

                    <p>
                      <strong>Name:</strong>{" "}
                      {booking.childName}
                    </p>

                    <p className="mt-1">
                      <strong>Age:</strong>{" "}
                      {booking.childAge} years
                    </p>

                  </div>

                  {/* BOOKING INFORMATION */}

                  <div className="mt-4 grid sm:grid-cols-2 gap-4">

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-gray-500 text-sm">
                        Booking Date
                      </p>

                      <p className="font-semibold mt-1">
                        📅{" "}
                        {booking.bookingDate
                          ? new Date(
                              booking.bookingDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">

                      <p className="text-gray-500 text-sm">
                        Timing
                      </p>

                      <p className="font-semibold mt-1">
                        🕒 {booking.timing || "N/A"}
                      </p>

                    </div>

                  </div>

                  {/* SPECIAL REQUEST */}

                  {booking.specialRequest && (

                    <div className="mt-4 bg-blue-50 rounded-xl p-4">

                      <p className="text-gray-500 text-sm">
                        Special Request
                      </p>

                      <p className="mt-1 text-gray-700">
                        {booking.specialRequest}
                      </p>

                    </div>

                  )}

                  {/* PRICE */}

                  {booking.childcareId?.price !== undefined && (

                    <div className="flex justify-between items-center mt-5">

                      <span className="text-gray-500">
                        Childcare Price
                      </span>

                      <span className="text-xl font-bold text-blue-600">
                        ₹{booking.childcareId.price}
                      </span>

                    </div>

                  )}

                  {/* CANCEL BOOKING */}

                  <button
                    onClick={() =>
                      handleCancelBooking(booking._id)
                    }
                    disabled={deletingId === booking._id}
                    className="mt-6 w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
                  >
                    {deletingId === booking._id
                      ? "Cancelling..."
                      : "Cancel Booking"}
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default ParentDashboard;