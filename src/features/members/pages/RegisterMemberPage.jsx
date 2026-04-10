import React from "react";
import { FaUserPlus } from "react-icons/fa";
import AppLayout from '../../../shared/components/layout/AppLayout';
import PageHeader from '../../../shared/components/layout/PageHeader';
import NewMember from '../components/MemberForm';

function PageNewMember() {
  return (
    <AppLayout showBackToList={true} showGenderSwitch={false}>
      <div className="w-full">
        <PageHeader
          title="New Member"
          description="Enroll a new member with plan, payment, and contact details"
          icon={FaUserPlus}
        />
        <NewMember />
      </div>
    </AppLayout>
  );
}

export default PageNewMember;
