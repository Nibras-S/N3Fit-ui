import React, { useState } from 'react';
import './pageActive.css';
import Expired from '../components/admin/Expired';
import Sidebar from './Sidebar';  // Import the Sidebar component
import { useNavigate } from 'react-router-dom';
import logo from '../components/static/assets/AZEELOGO.png';

function PageExpired() {
  const [gender, setGender] = useState('Male');
  const navigate = useNavigate();

  // Handle switching user gender
  const handleSwitchUser = () => {
    setGender(prevGender => prevGender === 'Male' ? 'Female' : 'Male');
  };

  return (
    <div className='main'>
      <Sidebar handleSwitchUser={handleSwitchUser} showButton={true} />  {/* Use the Sidebar component */}
      
      <div className='rightbar'>
        <div className='rtbuttons'>
          <button className='rtbtnActive' onClick={() => navigate('/active')}>Active Members</button>
          <button className='rtbtnInActive' onClick={() => navigate('/inactive')}>Due Members</button>
          {/* <button className='rtbtnExpired' style={{ color: 'red' }} onClick={() => navigate('/expired')}>Expired Members</button> */}
        </div>
        <Expired gender={gender} />
      </div>
    </div>
  );
}

export default PageExpired;
