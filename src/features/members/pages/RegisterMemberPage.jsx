import React from "react";
import AppLayout from '../../../shared/components/layout/AppLayout';
import NewMember from '../components/MemberForm';

function PageNewMember() {
  return (
    <AppLayout showBackToList={true} showGenderSwitch={false}>
      <div className="w-full">
        <NewMember />
      </div>
    </AppLayout>
  );
}

export default PageNewMember;
