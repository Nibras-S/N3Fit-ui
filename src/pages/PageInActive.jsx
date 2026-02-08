import React, { useState,useEffect } from 'react';
import './pageActive.css';
import Inactive from '../components/admin/Inactive';
import Sidebar from './Sidebar';  // Import the Sidebar component
import { useNavigate } from 'react-router-dom';
import Lottie from "lottie-react";
import bellAnimation from "./bellAnimation.json"; 
import axios from "axios";

import logo from '../components/static/assets/AZEELOGO.png';

function PageInactive() {
  const [gender, setGender] = useState('Male');
  const navigate = useNavigate();

  const [pendingCount, setPendingCount] = useState(0);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;


  useEffect(() => {
    axios
      .get(`${backendUrl}/api/reminders/with-status`)
      .then((res) => {
        const filtered = res.data
          .filter((user) => user.dews <= 4 && user.dews >= 0)
          .sort((a, b) => a.dews - b.dews);

        // 💡 Count only those with "Pending" messageStatus
        const pendingOnly = filtered.filter((user) => user.reminderStatus === "Pending");
        setPendingCount(pendingOnly.length);
  
        console.log("Reminder data:", res.data);
      })
      .catch((err) => console.error("Error fetching contacts:", err));
  }, [backendUrl]);

  // Handle switching user gender
  const handleSwitchUser = () => {
    setGender(prevGender => prevGender === 'Male' ? 'Female' : 'Male');
  };

  return (
    <div className='main'>
      <Sidebar handleSwitchUser={handleSwitchUser} showButton={true}/>  {/* Use the Sidebar component */}
      
      <div className='rightbar'>
        <div className='rtbuttons'>
          <button className='rtbtnActive' onClick={() => navigate('/active')}>Active Members</button>
          <button className='rtbtnInActive' style={{ color: 'orange' }} onClick={() => navigate('/inactive')}>Expired Members</button>
          {/* <button className='rtbtnExpired' onClick={() => navigate('/expired')}>Expired Members</button> */}
        </div>
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => navigate("/inactiveSoon")}
            style={{
              backgroundColor: "#ffffff",
              border: "none",
              borderRadius: "50%",
              padding: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              cursor: "pointer",
              position: "relative", // 👈 important for absolute badge positioning
            }}
          >
            {/* 🔔 Bell animation */}
            <Lottie
              animationData={bellAnimation}
              loop
              style={{
                width: "60px",
                height: "60px",
              }}
            />

            {/* 🔴 Notification badge */}
            {pendingCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  padding: "4px 7px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  lineHeight: 1,
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        </div>
        <Inactive gender={gender} />
      </div>
    </div>
  );
}

export default PageInactive;
