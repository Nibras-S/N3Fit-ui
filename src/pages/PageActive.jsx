import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Lottie from 'lottie-react';
import { FaWhatsapp } from 'react-icons/fa';

import Sidebar from './Sidebar';
import Active from '../components/admin/Active';
import bellAnimation from './bellAnimation.json';
import QRPage from './QRPage'; // ✅ Import the modal

function PageActive() {
  const navigate = useNavigate();
  const [gender, setGender] = useState('Male');
  const [pendingCount, setPendingCount] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false); // ✅ QR modal toggle
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [isConnected, setIsConnected] = useState(false);


  useEffect(() => {
    axios
      .get(`${backendUrl}/api/reminders/with-status`)
      .then((res) => {
        const filtered = res.data
          .filter((user) => user.dews <= 4 && user.dews >= 0)
          .sort((a, b) => a.dews - b.dews);

        const pendingOnly = filtered.filter(
          (user) => user.reminderStatus === 'Pending'
        );
        setPendingCount(pendingOnly.length);
      })
      .catch((err) => console.error('Error fetching contacts:', err));

      // 🔄 Fetch WhatsApp connection status
      const checkConnection = async () => {
        try {
          const res = await axios.get(`${backendUrl}/api/whatsapp/status`);
          setIsConnected(res.data.connected);
        } catch (err) {
          console.error("Error checking WhatsApp connection:", err);
        }
      };

      checkConnection();

      // Optional: poll every 5s to stay updated
      const interval = setInterval(checkConnection, 5000);
      return () => clearInterval(interval);
  }, [backendUrl]);

  const handleSwitchUser = () => {
    setGender((prevGender) => (prevGender === 'Male' ? 'Female' : 'Male'));
  };

  return (
    <div className="main flex min-h-screen bg-gray-100">
      <Sidebar handleSwitchUser={handleSwitchUser} gender={gender} showButton={true} />

      <div className="rightbar relative flex-1">
        {/* Top Buttons */}
        <div className="rtbuttons">
          <button
            className="rtbtnActive"
            style={{ color: 'green' }}
            onClick={() => navigate('/active')}
          >
            Active Members
          </button>
          <button className="rtbtnInActive" onClick={() => navigate('/inactive')}>
            Expired Members
          </button>
        </div>

        {/* 🔔 Bell Notification */}
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => navigate('/inactiveSoon')}
            style={{
              backgroundColor: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              padding: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Lottie
              animationData={bellAnimation}
              loop
              style={{ width: '45px', height: '45px' }}
            />
            {pendingCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '4px 7px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  lineHeight: 1,
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* ✅ WhatsApp Connect Floating Button */}
        <div
  style={{
    position: 'fixed',
    bottom: '20px',
    right: '100px',
    zIndex: 9999,
  }}
>
  <button
    onClick={() => {
      if (!isConnected) {
        setShowQRModal(true);
      } else {
        alert("✅ Already connected to WhatsApp!");
      }
    }}
    style={{
      backgroundColor: isConnected ? '#d1fae5' : '#ffffff',
      border: 'none',
      borderRadius: '50%',
      padding: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      cursor: 'pointer',
      position: 'relative'
    }}
  >
    <FaWhatsapp color={isConnected ? '#10b981' : '#3B86A9'} size={36} />
    {isConnected && (
      <span
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: '#10b981',
          color: '#fff',
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '12px',
          fontWeight: 'bold'
        }}
      >
        Connected
      </span>
    )}
  </button>
</div>


        {/* 👇 Your Members Table */}
        <Active gender={gender} />

        {/* ✅ QR Modal */}
        {showQRModal && <QRPage onClose={() => setShowQRModal(false)} />}
      </div>
    </div>
  );
}

export default PageActive;
