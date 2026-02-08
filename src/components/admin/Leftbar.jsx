import React from 'react'
import { useNavigate} from 'react-router-dom'
import { useState} from 'react';
import logo from "../static/assets/AZEELOGO.png"
import './Leftbar.css'

function Leftbar() {
    const [gender,setGender] = useState('Male')
    const HandleSwitchUser = () =>{
        setGender(prevGender => prevGender === 'Male' ? 'Female' : 'Male');
    }
    const navigate = useNavigate();
  return (
    <div className="leftbar">
    <div className="profile-pic-container">
        <img src={logo} alt="Profile" className="profile-pic" />
    </div>
    <div className="buttons-container">
        <button className="leftbar-btn" onClick={()=> navigate('/register')}>New Member</button>
        <button className="leftbar-btn">Announcement</button>
    </div>
    <div className="logout-container">
    <button className="leftbar-btn" onClick={HandleSwitchUser}>Switch User</button>
        <button className="logout-btn" onClick={()=> navigate('/')}>Logout</button>
    </div>
    </div>
  )
}

export default Leftbar
