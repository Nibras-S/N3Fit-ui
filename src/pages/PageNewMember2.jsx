import React from 'react';
import InactiveSoon from './InactiveSoon';
import Sidebar from './Sidebar';

function PageNewMember2() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar  showButton={false} showBackToList={true} />
      
      <div className="flex-grow px-4 py-6 mt-16 lg:mt-0 w-full">
        <InactiveSoon />
      </div>
    </div>
  );
}

export default PageNewMember2;
