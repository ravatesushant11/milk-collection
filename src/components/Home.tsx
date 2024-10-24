import React from "react";
import Navbar from "./NavBar";
import MilkForm from "./MilkForm";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div>
      <Navbar />
      <h1>Milk Collection</h1>
      <MilkForm />
    </div>
  );
};

export default Home;
