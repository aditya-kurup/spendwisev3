import React from 'react';
import { FaWallet } from 'react-icons/fa';

const Header = () => {
  return (
    <header style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div className="header-content">
        <div className="logo">
          <FaWallet className="logo-icon" />
          <span>SpendWise</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
