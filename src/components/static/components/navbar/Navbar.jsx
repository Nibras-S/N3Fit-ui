import React from 'react';
import './navbar.css';
import logo from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  return (
    <div className='nav'>
      <div className="nav__logo">
        <a><img src={logo} alt="logo" /></a>
      </div>
      <ul className="nav__links">
        <li className="link"><a>Home</a></li>
        <li className="link"><a>Program</a></li>
        <li className="link"><a>Service</a></li>
        <li className="link"><a>About</a></li>
        <li className="link"><a>Community</a></li>
      </ul>
      <button onClick={()=> navigate("/admin")} className="btn">Admin</button>
    </div>
  )
}

export default Navbar;
