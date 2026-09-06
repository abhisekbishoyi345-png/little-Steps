import { useState } from "react";

function SearchSection({ onSearch }) {
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    ageGroup: "",
    is24x7: "",
    availability: "",
    plan: "",
    minPrice: "",
    maxPrice: "",
    verified: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(filters);
    }
  };

  const handleReset = () => {
    const emptyFilters = {
      search: "",
      location: "",
      ageGroup: "",
      is24x7: "",
      availability: "",
      plan: "",
      minPrice: "",
      maxPrice: "",
      verified: "",
    };

    setFilters(emptyFilters);

    if (onSearch) {
      onSearch(emptyFilters);
    }
  };

  return (
    <section className="bg-gradient-to-b from-white to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800">
            Find Trusted Childcare Near You
          </h2>

          <p className="mt-3 text-gray-500">
            Search and filter childcare centres based on your needs.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Search */}
            <div>
              <label className="font-semibold text-gray-700">
                🔍 Search
              </label>

              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Name, location or keyword"
                className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="font-semibold text-gray-700">
                📍 Location
              </label>

              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleChange}
                placeholder="Enter city or location"
                className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Age Group */}
            <div>
              <label className="font-semibold text-gray-700">
                👶 Age Group
              </label>

              <select
                name="ageGroup"
                value={filters.ageGroup}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl px-4 py-3 bg-white"
              >
                <option value="">All Age Groups</option>
                <option value="Infant">Infant</option>
                <option value="Toddler">Toddler</option>
                <option value="Preschool">Preschool</option>
              </select>
            </div>

            {/* 24x7 */}
            <div>
              <label className="font-semibold text-gray-700">
                🕐 24×7 Service
              </label>

              <select
                name="is24x7"
                value={filters.is24x7}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl px-4 py-3 bg-white"
              >
                <option value="">All</option>
                <option value="true">24×7 Only</option>
                <option value="false">Non-24×7</option>
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="font-semibold text-gray-700">
                🟢 Availability
              </label>

              <select
                name="availability"
                value={filters.availability}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl px-4 py-3 bg-white"
              >
                <option value="">All</option>
                <option value="Available">Available</option>
                <option value="Limited">Limited</option>
                <option value="Full">Full</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            {/* Plan */}
            <div>
              <label className="font-semibold text-gray-700">
                💳 Plan
              </label>

              <select
                name="plan"
                value={filters.plan}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl px-4 py-3 bg-white"
              >
                <option value="">All Plans</option>
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="font-semibold text-gray-700">
                💰 Minimum Price
              </label>

              <input
                type="number"
                name="minPrice"
                min="0"
                value={filters.minPrice}
                onChange={handleChange}
                placeholder="₹ Min"
                className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="font-semibold text-gray-700">
                💰 Maximum Price
              </label>

              <input
                type="number"
                name="maxPrice"
                min="0"
                value={filters.maxPrice}
                onChange={handleChange}
                placeholder="₹ Max"
                className="w-full mt-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* Verified */}
            <div>
              <label className="font-semibold text-gray-700">
                ✅ Provider Verification
              </label>

              <select
                name="verified"
                value={filters.verified}
                onChange={handleChange}
                className="w-full mt-2 border rounded-xl px-4 py-3 bg-white"
              >
                <option value="">All Providers</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified</option>
              </select>
            </div>

          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-7">

            <button
              onClick={handleSearch}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
            >
              🔍 Search Childcare
            </button>

            <button
              onClick={handleReset}
              className="sm:w-40 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition"
            >
              Reset
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}

export default SearchSection;