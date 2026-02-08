import React,{useState,useEffect} from 'react'
import AllMembers from '../components/admin/AllMembers';
import Sidebar from './Sidebar';  // Import the Sidebar component
import { useNavigate } from 'react-router-dom';
import Lottie from "lottie-react";
import axios from "axios";

import bellAnimation from "./bellAnimation.json"; 


const ManageUsers = () => {
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

        //  Count only those with "Pending" messageStatus
        const pendingOnly = filtered.filter((user) => user.reminderStatus === "Pending");
        setPendingCount(pendingOnly.length);
  
        console.log("Reminder data:", res.data);
      })
      .catch((err) => console.error("Error fetching contacts:", err));
  }, [backendUrl]);
    
  return (
    <div className='main'>
        <Sidebar  showButton={false} showBackToList={true}/>
        <div className='rightbar'>
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
          <AllMembers />
        </div>
    </div>
  )
}

export default ManageUsers