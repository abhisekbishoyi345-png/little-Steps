import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

function ChildcareDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCenter();
  }, []);

  const fetchCenter = async () => {
    try {
      const res = await API.get(`/childcare/${id}`);
      setCenter(res.data.childcare);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <h1 className="text-center text-2xl mt-20">
        Loading...
      </h1>
    );
  }

  if (!center) {
    return (
      <h1 className="text-center text-2xl mt-20">
        Childcare Not Found
      </h1>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        <img
          src={center.image}
          alt={center.name}
          className="w-full h-[450px] object-cover"
        />

        <div className="p-8">

          <div className="flex justify-between items-center">

            <h1 className="text-4xl font-bold">
              {center.name}
            </h1>

            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
              ✔ Verified
            </span>

          </div>

          <p className="text-gray-600 mt-4">
            📍 {center.location}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">

            <div className="bg-gray-50 p-5 rounded-xl">
              <h3 className="font-bold text-lg">Age Group</h3>
              <p>{center.ageGroup}</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl">
              <h3 className="font-bold text-lg">Timing</h3>
              <p>{center.timing}</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl">
              <h3 className="font-bold text-lg">Plan</h3>
              <p>{center.plan}</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl">
              <h3 className="font-bold text-lg">Price</h3>
              <p className="text-green-600 font-bold text-2xl">
                ₹{center.price}
              </p>
            </div>

          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-3">
              Description
            </h2>

            <p className="text-gray-700 leading-8">
              {center.description}
            </p>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">
              Facilities
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>✅ CCTV Surveillance</div>
              <div>✅ Verified Caregivers</div>
              <div>✅ Indoor Play Area</div>
              <div>✅ Healthy Meals</div>
              <div>✅ First Aid Available</div>
              <div>✅ Emergency Support</div>
            </div>

          </div>

          <button
            onClick={() => navigate(`/booking/${center._id}`)}
            className="mt-10 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-bold"
          >
            Book Now
          </button>

        </div>

      </div>
    </div>
  );
}

export default ChildcareDetails;