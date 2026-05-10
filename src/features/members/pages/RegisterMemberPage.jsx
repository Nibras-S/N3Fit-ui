import React from "react";
import { FaUserPlus } from "react-icons/fa";
import AppLayout from '../../../shared/components/layout/AppLayout';
import NewMember from '../components/MemberForm';

function PageNewMember() {
  return (
    <AppLayout title="New Member" description="Enroll a new member with plan, payment, and contact details" icon={FaUserPlus} showBackToList={true} showGenderSwitch={false}>
      <div className="w-full">
        <NewMember />
      </div>
    </AppLayout>
  );
}

export default PageNewMember;
