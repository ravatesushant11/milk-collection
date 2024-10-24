import React from "react";
import "./NavBar.css";
import { Link } from "react-router-dom";
import logo from "../assets/c1a2588a1fd04b719ca8b5772c851d6a.jpg";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar ">
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/" className="home">
            Add Vendor
          </Link>
        </li>
        <li>
          <Link to="/report" className="report">
            Report
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
