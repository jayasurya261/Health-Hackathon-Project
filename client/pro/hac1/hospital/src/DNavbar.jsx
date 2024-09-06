// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation
import '../styles/Navbar.css'; // Create this CSS file for styling

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1 className="logo">Doctor Dashboard</h1>
      <ul className="nav-links">
        <li><Link to="/doctor-dashboard">Dashboard</Link></li>
        <li><Link to="/appointments">Appointments</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><Link to="/">Logout</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
