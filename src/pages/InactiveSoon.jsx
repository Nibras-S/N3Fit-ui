import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPhoneAlt,
  FaClock,
  FaUser,
  FaWhatsapp,
  FaFilter,
} from "react-icons/fa";

const InactiveSoon = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [dewsFilter, setDewsFilter] = useState("All");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    axios
      .get(`${backendUrl}/api/reminders/with-status`)
      .then((res) => {
        const filtered = res.data
          .filter((user) => user.dews <= 4 && user.dews >= 0)
          .sort((a, b) => a.dews - b.dews);
        setContacts(filtered);
        setFilteredContacts(filtered);
      })
      .catch((err) => console.error("Error fetching contacts:", err));
  }, [backendUrl]);

  useEffect(() => {
    let filtered = [...contacts];

    if (statusFilter !== "All") {
      filtered = filtered.filter((c) => c.reminderStatus === statusFilter);
    }

    if (dewsFilter !== "All") {
      filtered = filtered.filter((c) => String(c.dews) === dewsFilter);
    }

    setFilteredContacts(filtered);
  }, [statusFilter, dewsFilter, contacts]);

  const handleWhatsAppSend = async (contact) => {
    const { phone, name, dews, _id } = contact;
    if (!phone || !name || dews === undefined || dews === null) return;

    const message = `Hi ${name}, your gym membership is set to expire in ${Math.abs(dews)} day(s).
To continue enjoying your workouts.
*Please renew your membership via Google Pay at +91 89714 23247.*
Once done, send us a screenshot of the payment to restore access.

Need any help? Just reply here. Thanks and stay fit! `;

    const encodedMsg = encodeURIComponent(message);
    const phoneNumber = phone.startsWith("91") ? phone : `+91${phone}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;

    try {
      await axios.post(`${backendUrl}/api/reminders/send/${_id}`);
      window.open(whatsappUrl, "_blank");
    } catch (error) {
      console.error("Error sending WhatsApp reminder:", error);
    }
  };

  const sentCount = contacts.filter((c) => c.reminderStatus === "Sent").length;
  const pendingCount = contacts.filter((c) => c.reminderStatus !== "Sent").length;

  return (
    <div className="p-4">
      <p className="font-semibold mb-2 text-yellow-800 flex items-center gap-2">
        <FaClock className="text-yellow-600" />
        Heads up! Users about to go inactive:
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-600" />
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="All">All</option>
            <option value="Sent">Sent ({sentCount})</option>
            <option value="Pending">Pending ({pendingCount})</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label>Dews:</label>
          <select
            value={dewsFilter}
            onChange={(e) => setDewsFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="All">All</option>
            <option value="4">4 days left</option>
            <option value="3">3 days left</option>
            <option value="2">2 days left</option>
            <option value="1">1 day left</option>
            <option value="0">0 days left</option>
          </select>
        </div>

        {/* Count badges */}
        <div className="ml-auto flex gap-3">
          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
            Pending: {pendingCount}
          </span>
          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
            Sent: {sentCount}
          </span>
        </div>
      </div>

      {filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((user) => (
            <div
              key={user._id}
              className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md shadow-md flex flex-col justify-between"
            >
              <div className="space-y-1">
                <p className="font-bold text-md flex items-center gap-2">
                  <FaUser className="text-yellow-700" /> {user.name}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <FaPhoneAlt className="text-yellow-700" /> {user.phone}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <FaClock className="text-yellow-700" /> {user.dews} days left
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      user.reminderStatus === "Sent"
                        ? "bg-green-200 text-green-800"
                        : user.reminderStatus === "Failed"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {user.reminderStatus}
                  </span>
                  <span className="text-xs text-gray-600">
                    Sent: {user.sentCount}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleWhatsAppSend(user)}
                className="mt-3 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-1.5 px-3 rounded shadow"
              >
                <FaWhatsapp /> Send WhatsApp Message
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md shadow-md">
          <p className="font-semibold flex items-center gap-2">
            <FaClock className="text-green-600" />
            All clear! No users going inactive soon.
          </p>
        </div>
      )}
    </div>
  );
};

export default InactiveSoon;
