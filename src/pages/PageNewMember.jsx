import React from "react";
import AppLayout from "../layout/AppLayout";
import NewMember from "../components/admin/newMember";

function PageNewMember() {
  return (
    <AppLayout showBackToList={true} showGenderSwitch={false}>
      <div className="w-full max-w-2xl mx-auto">
        <NewMember />
      </div>
    </AppLayout>
  );
}

export default PageNewMember;
