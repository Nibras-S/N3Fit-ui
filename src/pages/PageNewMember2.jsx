import React from "react";
import AppLayout from "../layout/AppLayout";
import InactiveSoon from "./InactiveSoon";

function PageNewMember2() {
  return (
    <AppLayout showBackToList={true} showGenderSwitch={false}>
      <InactiveSoon />
    </AppLayout>
  );
}

export default PageNewMember2;
