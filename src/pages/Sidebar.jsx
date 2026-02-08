// Sidebar.js
import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMale, FaFemale, FaExchangeAlt } from 'react-icons/fa'; // FaExchangeAlt is the switch icon

import logo from '../components/static/assets/AZEELOGO.png';

function Sidebar({ handleSwitchUser, gender , showButton ,showBackToList }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to manage sidebar toggle
  const navigate = useNavigate();

  const [isMale, setIsMale] = useState(true);
  const sidebarRef = useRef();

    const handleUserToggle = () => {
    handleSwitchUser();
    setIsMale(!isMale);
    };
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);
  return (
    <div>
        <div className='lg:block hidden'>
            <div className="leftbar">
            <div className="profile-pic-container">
                <img src={logo} alt="Profile" className="profile-pic" />
            </div>
            <div className="buttons-container">
                <button className="leftbar-btn" onClick={() => navigate('/register')}>New Member</button>
                <button className="leftbar-btn">Announcement</button>
            </div>
            <div className="logout-container">
                <button className="leftbar-btn" onClick={() => navigate('/manageUsers')}>Total Members</button>
                {showButton && (
  <div
    className={`leftbar-btn flex justify-center items-center gap-2 px-4 py-2  shadow-sm mr-2 
    ${isMale ? 'bg-blue-200 text-blue-700' : 'bg-pink-100 text-pink-700'}`}
  >
    <button
      className="flex items-center gap-2   focus:outline-none"
      onClick={handleUserToggle}
    >
      {isMale ? (
        <FaMale className="text-lg" />
      ) : (
        <FaFemale className="text-lg" />
      )}
      <span>Switch Gender</span>
      <FaExchangeAlt className="text-sm ml-1" />
    </button>
  </div>
)}


                {showBackToList && (
                  <button className="leftbar-btn" onClick={() => navigate('/active')}>Back To List</button>
                  
                )}
                <button
                  className="logout-btn"
                  onClick={() => {
                    localStorage.removeItem('adminToken'); // or whatever key you're using
                    navigate('/admin'); // send them back to login
                  }}
                >
                  Logout
                </button>
           </div>
            </div>

        </div>
        <div>
      {/* Mobile Navbar with Logo and Menu Icon */}
      <div className="lg:hidden bg-gray-900 pt-8 pb-6 text-white w-full py-4 px-6 flex items-center justify-between shadow-md fixed top-0 left-0 right-0 z-40">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        </div>
        <div className='flex '>
          {showButton &&(
            <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm mr-2 
            ${isMale ? 'bg-blue-200 text-blue-700' : 'bg-pink-100 text-pink-700'}`}
            >
            <button
            className="flex items-center gap-2 text-sm focus:outline-none"
            onClick={handleUserToggle}
            >
            {isMale ? (
              <>
                <FaMale className="text-lg" />
                <span>Male </span>
              </>
            ) : (
              <>
                <FaFemale className="text-lg" />
                <span>Female </span>
              </>
            )}
            <FaExchangeAlt className="text-sm ml-1" />
            </button>
            </div>
          )}


            {/* Menu Icon */}
            <div className="flex items-center cursor-pointer" onClick={toggleSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className='lg:hidden z-50'>
        <div
          ref={sidebarRef}
          className={`fixed top-0 right-0 bg-gray-900 text-white w-64 h-full p-6 shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}
        >
          {/* Close Icon */}
          <div className="flex justify-end mb-4">
            <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-gray-400 text-xl">
              ✖️
            </button>
          </div>

          {/* <div className="profile-pic-container mb-6">
            <img src={logo} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
          </div> */}

          <div className="logout-container mb-6">
            <button className="w-full text-left text-white hover:text-gray-400 py-2 px-4" onClick={() => navigate('/register')}>New Member</button>
          </div>

          <div className="logout-container mb-6">
            <button className="w-full text-left text-white hover:text-gray-400 py-2 px-4">Announcement</button>
          </div>
          {showBackToList && (
              <div className="logout-container mb-6">
                <button className="w-full text-left text-white hover:text-gray-400 py-2 px-4" onClick={() => navigate('/active')}>Back To List</button>
              </div>
          )}
          
              <div className="logout-container mb-6">
              <button className="w-full text-left text-white hover:text-gray-400 py-2 px-4" onClick={() => navigate('/manageUsers')}>Total Members</button>
            </div>
          
          
          
          <div className="logout-container mb-6">
            <button className="w-full text-left text-white hover:text-gray-400 py-2 px-4" onClick={() => {
                    localStorage.removeItem('adminToken'); 
                    navigate('/admin'); 
                  }}>Logout</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Sidebar;
