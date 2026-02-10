import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import AppLayout from "../layout/AppLayout";
import AllMembers from "../components/admin/AllMembers";
import bellAnimation from "./bellAnimation.json";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    axios
      .get(`${backendUrl}/api/reminders/with-status`)
      .then((res) => {
        const filtered = res.data
          .filter((user) => user.dews <= 4 && user.dews >= 0)
          .sort((a, b) => a.dews - b.dews);
        const pendingOnly = filtered.filter(
          (user) => user.reminderStatus === "Pending"
        );
        setPendingCount(pendingOnly.length);
      })
      .catch((err) => console.error("Error fetching contacts:", err));
  }, [backendUrl]);

  return (
    <AppLayout showBackToList={true} showGenderSwitch={false}>
      <div className="space-y-4">
        <AllMembers />
      </div>

      <div className="fixed bottom-20 right-4 z-10 md:bottom-6 md:right-6">
        <button
          onClick={() => navigate("/inactivesoon")}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-card border border-gray-100 hover:shadow-card-hover transition-shadow relative"
          aria-label="Reminders"
        >
          <Lottie animationData={bellAnimation} loop style={{ width: 32, height: 32 }} />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>
    </AppLayout>
  );
};

export default ManageUsers;
