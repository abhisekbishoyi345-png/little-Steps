import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";

function FeaturedCenters({ filters = {} }) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchCenters();
  }, [filters]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const params = {};

      // Search
      if (filters.search?.trim()) {
        params.search = filters.search.trim();
      }

      // Location
      if (filters.location?.trim()) {
        params.location = filters.location.trim();
      }

      // Age Group
      if (filters.ageGroup) {
        params.ageGroup = filters.ageGroup;
      }

      // 24x7
      if (filters.is24x7 !== undefined && filters.is24x7 !== "") {
        params.is24x7 = filters.is24x7;
      }

      // Availability
      if (filters.availability) {
        params.availability = filters.availability;
      }

      // Plan
      if (filters.plan) {
        params.plan = filters.plan;
      }

      // Minimum Price
      if (
        filters.minPrice !== undefined &&
        filters.minPrice !== ""
      ) {
        params.minPrice = filters.minPrice;
      }

      // Maximum Price
      if (
        filters.maxPrice !== undefined &&
        filters.maxPrice !== ""
      ) {
        params.maxPrice = filters.maxPrice;
      }

      // Verified
      if (filters.verified !== undefined && filters.verified !== "") {
        params.verified = filters.verified;
      }

      const res = await API.get("/childcare", {
        params,
      });

      if (res.data.success) {
        setCenters(res.data.childcare || []);
      } else {
        setCenters([]);
      }
    } catch (error) {
      console.error("Fetch childcare centers error:", error);

      setCenters([]);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load childcare centers."
      );
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-12">

          <h2 className="text-4xl font-bold text-gray-800">
            Featured Daycare Centers
          </h2>

          <p className="text-center text-gray-500 mt-3">
            Find childcare centers that match your requirements.
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-5xl mb-4">
              ⏳
            </div>

            <h3 className="text-xl font-semibold text-gray-700">
              Loading Childcare Centers...
            </h3>
          </div>
        )}

        {/* Error */}
        {!loading && errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">

            <div className="text-4xl mb-3">
              ⚠️
            </div>

            <h3 className="text-xl font-bold text-red-700">
              Something went wrong
            </h3>

            <p className="text-red-600 mt-2">
              {errorMessage}
            </p>

            <button
              onClick={fetchCenters}
              className="mt-5 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Empty */}
        {!loading &&
          !errorMessage &&
          centers.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">

              <div className="text-6xl mb-4">
                🏫
              </div>

              <h3 className="text-2xl font-bold text-gray-800">
                No Childcare Centers Found
              </h3>

              <p className="text-gray-500 mt-2">
                Try changing your search or filter options.
              </p>

            </div>
          )}

        {/* Cards */}
        {!loading &&
          !errorMessage &&
          centers.length > 0 && (
            <>
              <div className="mb-6 text-gray-600">
                Found{" "}
                <span className="font-bold text-green-600">
                  {centers.length}
                </span>{" "}
                childcare{" "}
                {centers.length === 1 ? "center" : "centers"}.
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                {centers.map((center) => (

                  <div
                    key={center._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition duration-300"
                  >

                    {/* Image */}
                    {center.image ? (
                      <img
                        src={getImageUrl(center.image)}
                        alt={center.name}
                        className="w-full h-60 object-cover"
                      />
                    ) : (
                      <div className="w-full h-60 bg-gray-200 flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}

                    <div className="p-6">

                      {/* Name + Verification */}
                      <div className="flex justify-between items-start gap-3">

                        <h3 className="text-2xl font-bold text-gray-800">
                          {center.name}
                        </h3>

                        {center.verified && (
                          <span className="shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                            ✓ Verified
                          </span>
                        )}

                      </div>

                      {/* Location */}
                      <p className="mt-2 text-gray-600">
                        📍 {center.location}
                      </p>

                      {/* Age */}
                      <p className="mt-2">
                        👶{" "}
                        <span className="font-semibold">
                          Age:
                        </span>{" "}
                        {center.ageGroup}
                      </p>

                      {/* Timing */}
                      <p className="mt-2">
                        🕒{" "}
                        <span className="font-semibold">
                          Timing:
                        </span>{" "}
                        {center.timing}
                      </p>

                      {/* Plan */}
                      <p className="mt-2">
                        💳{" "}
                        <span className="font-semibold">
                          Plan:
                        </span>{" "}
                        {center.plan}
                      </p>

                      {/* 24x7 */}
                      {center.is24x7 && (
                        <span className="inline-block mt-3 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                          🕐 24×7
                        </span>
                      )}

                      {/* Availability */}
                      <div className="mt-3">

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            center.availability === "Available"
                              ? "bg-green-100 text-green-700"
                              : center.availability === "Limited"
                              ? "bg-yellow-100 text-yellow-700"
                              : center.availability === "Full"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {center.availability || "Available"}
                        </span>

                      </div>

                      {/* Capacity */}
                      <div className="mt-3 text-sm text-gray-600">

                        <p>
                          👥{" "}
                          <span className="font-semibold">
                            Available Slots:
                          </span>{" "}
                          {center.availableSlots ?? 0}
                          {" / "}
                          {center.capacity ?? 0}
                        </p>

                      </div>

                      {/* Price */}
                      <p className="text-green-600 font-bold text-2xl mt-4">
                        ₹{center.price}
                      </p>

                      {/* Pricing Plans */}
                      {center.pricingPlans && (
                        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">

                          {center.pricingPlans.hourly !== null &&
                            center.pricingPlans.hourly !== undefined && (
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-gray-500">
                                  Hourly
                                </p>
                                <p className="font-bold text-gray-800">
                                  ₹{center.pricingPlans.hourly}
                                </p>
                              </div>
                            )}

                          {center.pricingPlans.daily !== null &&
                            center.pricingPlans.daily !== undefined && (
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-gray-500">
                                  Daily
                                </p>
                                <p className="font-bold text-gray-800">
                                  ₹{center.pricingPlans.daily}
                                </p>
                              </div>
                            )}

                          {center.pricingPlans.monthly !== null &&
                            center.pricingPlans.monthly !== undefined && (
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-gray-500">
                                  Monthly
                                </p>
                                <p className="font-bold text-gray-800">
                                  ₹{center.pricingPlans.monthly}
                                </p>
                              </div>
                            )}

                        </div>
                      )}

                      {/* Description */}
                      <p className="mt-4 text-gray-600 line-clamp-3">
                        {center.description}
                      </p>

                      {/* Details */}
                      <Link
                        to={`/childcare/${center._id}`}
                        className="block mt-6 w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
                      >
                        View Details
                      </Link>

                    </div>
                  </div>

                ))}

              </div>
            </>
          )}

      </div>
    </section>
  );
}

export default FeaturedCenters;