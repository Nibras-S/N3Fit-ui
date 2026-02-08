// PageNewMember.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; // 👈 Reusing Sidebar
import NewMember from '../components/admin/newMember';

function PageNewMember() {
  const navigate = useNavigate();
  

  return (
    <div className="main min-h-screen bg-gray-100">
      {/* Sidebar (shared) */}
      <Sidebar  showBackToList={true}/>

      {/* Main Content */}
      <div className="rightbar px-4 py-auto  w-full">
        
        <NewMember/>
      </div>
    </div>
  );
}

export default PageNewMember;
