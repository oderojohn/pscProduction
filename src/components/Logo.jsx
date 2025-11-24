import React from 'react';
import '../assets/css/Logo.css';
import logoImage from '../assets/logo.png';

const Logo = () => {
  return (
    <div className="logo-container">
      <img src={logoImage} alt="Parklands Sports Club Logo" className="logo-img" />
    </div>
  );
};

export default Logo;
