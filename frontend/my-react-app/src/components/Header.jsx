import React from 'react';
import { FaWallet, FaUserCircle, FaBell, FaCog } from 'react-icons/fa';

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark mb-4 sticky-top">
      <div className="container">
        <a className="navbar-brand" href="#">
          <FaWallet className="logo-icon me-2" />
          <span>SpendWise</span>
        </a>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link px-3" href="#" title="Notifications">
                <FaBell />
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link px-3" href="#" title="Settings">
                <FaCog />
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link px-3" href="#" title="Profile">
                <FaUserCircle />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
