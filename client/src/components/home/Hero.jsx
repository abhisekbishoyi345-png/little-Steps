import { Link } from "react-router-dom";

function Hero() {
  return (
    <section
      className="relative min-h-[85vh] bg-cover bg-center flex items-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-8 w-full">

        <div className="max-w-3xl">

          <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full mb-5 text-sm font-semibold">
            Trusted Childcare Platform
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Find the Best
            <span className="text-blue-400"> Childcare </span>
            Near You
          </h1>

          <p className="mt-6 text-lg text-gray-200 leading-8">
            Discover safe, verified and affordable childcare centres for
            your little ones. Search by location, compare facilities and
            choose the perfect daycare with confidence.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              to="/search"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition"
            >
              Explore Centers
            </Link>

            <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-gray-800 px-8 py-4 rounded-xl font-semibold transition"
            >
              Join Now
            </Link>

          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-8 max-w-xl">

            <div>
              <h2 className="text-3xl font-bold text-white">
                100+
              </h2>
              <p className="text-gray-300">
                Childcare Centers
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white">
                5000+
              </h2>
              <p className="text-gray-300">
                Happy Parents
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white">
                24×7
              </h2>
              <p className="text-gray-300">
                Support
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;