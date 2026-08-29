import { useState } from "react";

import Navbar from "../../components/navbar/Navbar";
import Hero from "../../components/home/Hero";
import SearchSection from "../../components/home/SearchSection";
import FeaturedCenters from "../../components/home/FeaturedCenters";
import Footer from "../../components/footer/Footer";

function Home() {
  const [filters, setFilters] = useState({});

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <>
      <Navbar />

      <Hero />

      <SearchSection onSearch={handleSearch} />

      <FeaturedCenters filters={filters} />

      <Footer />
    </>
  );
}

export default Home;