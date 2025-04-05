import React from 'react';
import { FaWallet } from 'react-icons/fa';

const Header = () => {
  return (
    <header>
      <div className="header-content">
        <div className="logo">
          <FaWallet className="logo-icon" />
          <span>Smart Spending Analyzer</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
