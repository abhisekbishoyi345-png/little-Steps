import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [center, setCenter] = useState(null);
  const [loadingCenter, setLoadingCenter] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    parentName: "",
    email: "",
    mobile: "",
    childName: "",
    childAge: "",
    bookingDate: "",
    timing: "",
    specialRequest: "",
  });

  // =====================================
  // Fetch Childcare Center
  // =====================================

  useEffect(() => {
    fetchCenter();
  }, [id]);

  const fetchCenter = async () => {
    try {
      setLoadingCenter(true);

      const res = await API.get(`/childcare/${id}`);

      if (res.data.success) {
        setCenter(res.data.childcare);
      } else {
        setCenter(null);
      }
    } catch (error) {
      console.error("Fetch childcare error:", error);
      setCenter(null);
    } finally {
      setLoadingCenter(false);
    }
  };

  // =====================================
  // Set Logged-in Parent Details
  // =====================================

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        parentName: user.fullName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // =====================================
  // Handle Input
  // =====================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================
  // Check Availability
  // =====================================

  const isUnavailable =
    !center ||
    center.availableSlots <= 0 ||
    center.availability === "Full" ||
    center.availability === "Unavailable";

  // =====================================
  // Submit Booking
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // User check
    if (!user) {
      alert("Please login before booking.");
      navigate("/login");
      return;
    }

    // Center availability check
    if (isUnavailable) {
      alert(
        "Sorry, this childcare center is currently unavailable."
      );
      return;
    }

    // Child age validation
    if (
      formData.childAge === "" ||
      Number(formData.childAge) < 0 ||
      Number(formData.childAge) > 18
    ) {
      alert("Please enter a valid child age.");
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        parentName: user.fullName || formData.parentName,
        email: user.email || formData.email,
        mobile: formData.mobile.trim(),
        childName: formData.childName.trim(),
        childAge: Number(formData.childAge),
        bookingDate: formData.bookingDate,
        timing: formData.timing,
        specialRequest: formData.specialRequest.trim(),
        childcareId: id,
      };

      const res = await API.post(
        "/booking/create",
        bookingData
      );

      if (res.data.success) {
        alert("Booking Created Successfully! 🎉");

        navigate("/parent-dashboard");
      }
    } catch (error) {
      console.error("Booking error:", error);

      alert(
        error.response?.data?.message ||
          "Booking Failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // Loading Center
  // =====================================

  if (loadingCenter) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-gray-700">
          Loading Childcare Center...
        </h1>
      </div>
    );
  }

  // =====================================
  // Center Not Found
  // =====================================

  if (!center) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-700">
          Childcare Center Not Found
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">

      <div className="max-w-4xl mx-auto">

        {/* =====================================
            Childcare Summary
        ===================================== */}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">

          <img
            src={center.image}
            alt={center.name}
            className="w-full h-64 object-cover"
          />

          <div className="p-6">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {center.name}
                </h1>

                <p className="text-gray-600 mt-2">
                  📍 {center.location}
                </p>
              </div>

              {/* Verification */}

              {center.verified && (
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                  ✔ Verified Provider
                </span>
              )}

            </div>

            {/* =====================================
                Availability Information
            ===================================== */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Available Slots
                </p>

                <p className="text-2xl font-bold text-blue-600">
                  {center.availableSlots}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Availability
                </p>

                <p
                  className={`text-xl font-bold ${
                    center.availability === "Available"
                      ? "text-green-600"
                      : center.availability === "Limited"
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  {center.availability}
                </p>
              </div>

              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">
                  Timing
                </p>

                <p className="text-xl font-bold text-purple-600">
                  {center.is24x7
                    ? "24×7"
                    : center.timing}
                </p>
              </div>

            </div>

            {/* =====================================
                Pricing
            ===================================== */}

            {center.pricingPlans && (
              <div className="mt-6">

                <h2 className="text-xl font-bold mb-3">
                  Pricing Plans
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {center.pricingPlans.hourly !== null &&
                    center.pricingPlans.hourly !== undefined && (
                      <div className="border rounded-xl p-4">
                        <p className="text-gray-500">
                          Hourly
                        </p>

                        <p className="text-xl font-bold text-blue-600">
                          ₹{center.pricingPlans.hourly}
                        </p>
                      </div>
                    )}

                  {center.pricingPlans.daily !== null &&
                    center.pricingPlans.daily !== undefined && (
                      <div className="border rounded-xl p-4">
                        <p className="text-gray-500">
                          Daily
                        </p>

                        <p className="text-xl font-bold text-blue-600">
                          ₹{center.pricingPlans.daily}
                        </p>
                      </div>
                    )}

                  {center.pricingPlans.monthly !== null &&
                    center.pricingPlans.monthly !== undefined && (
                      <div className="border rounded-xl p-4">
                        <p className="text-gray-500">
                          Monthly
                        </p>

                        <p className="text-xl font-bold text-blue-600">
                          ₹{center.pricingPlans.monthly}
                        </p>
                      </div>
                    )}

                </div>
              </div>
            )}

          </div>
        </div>

        {/* =====================================
            Booking Form
        ===================================== */}

        <div className="bg-white rounded-2xl shadow-xl p-8">

          <h2 className="text-3xl font-bold text-center text-blue-600">
            Book Childcare
          </h2>

          <p className="text-center text-gray-500 mt-2 mb-8">
            Fill in the details to request a childcare booking.
          </p>

          {/* =====================================
              Unavailable Warning
          ===================================== */}

          {isUnavailable && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center font-semibold">
              This childcare center is currently{" "}
              {center.availability === "Full"
                ? "full"
                : "unavailable"}.
              <br />
              Booking is temporarily disabled.
            </div>
          )}

          {/* =====================================
              Booking Form
          ===================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Parent Name */}

            <div>
              <label className="block font-semibold mb-2">
                Parent Name
              </label>

              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                className="w-full border p-3 rounded-lg bg-gray-100"
                readOnly
              />
            </div>

            {/* Email */}

            <div>
              <label className="block font-semibold mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                className="w-full border p-3 rounded-lg bg-gray-100"
                readOnly
              />

              <p className="text-sm text-gray-500 mt-1">
                This email is linked to your account.
              </p>
            </div>

            {/* Mobile */}

            <div>
              <label className="block font-semibold mb-2">
                Mobile Number
              </label>

              <input
                type="tel"
                name="mobile"
                placeholder="Enter Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Child Name */}

            <div>
              <label className="block font-semibold mb-2">
                Child Name
              </label>

              <input
                type="text"
                name="childName"
                placeholder="Enter Child Name"
                value={formData.childName}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Child Age */}

            <div>
              <label className="block font-semibold mb-2">
                Child Age
              </label>

              <input
                type="number"
                name="childAge"
                placeholder="Enter Child Age"
                min="0"
                max="18"
                value={formData.childAge}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Booking Date */}

            <div>
              <label className="block font-semibold mb-2">
                Booking Date
              </label>

              <input
                type="date"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Timing */}

            <div>
              <label className="block font-semibold mb-2">
                Timing
              </label>

              <select
                name="timing"
                value={formData.timing}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">
                  Select Timing
                </option>

                <option value="Morning">
                  Morning
                </option>

                <option value="Afternoon">
                  Afternoon
                </option>

                <option value="Evening">
                  Evening
                </option>

                <option value="Night">
                  Night
                </option>

                <option value="24x7">
                  24×7
                </option>
              </select>
            </div>

            {/* Special Request */}

            <div>
              <label className="block font-semibold mb-2">
                Special Request
              </label>

              <textarea
                name="specialRequest"
                placeholder="Any special requirements? (Optional)"
                rows="4"
                value={formData.specialRequest}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading || isUnavailable}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
            >
              {loading
                ? "Creating Booking..."
                : isUnavailable
                ? "Booking Unavailable"
                : "Confirm Booking"}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}

export default BookingForm;