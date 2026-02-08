import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Active.css';
import { FaUsers, FaMale, FaFemale } from 'react-icons/fa';


function Active(props) {
    const [members, setMembers] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [customDate, setCustomDate] = useState('');
    const [loading, setloading] = useState(false);
    const [renewing,setRenewing] = useState(false)

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const fetchAllMembersWithReminders = async (setMembers, setLoading, backendUrl) => {
        setLoading(true);
        try {
          const [contactsRes, remindersRes] = await Promise.all([
            axios.get(`${backendUrl}/api/contacts/`),
            axios.get(`${backendUrl}/api/reminders/with-status`)
          ]);
      
          const mergedData = contactsRes.data.map(contact => {
            const reminder = remindersRes.data.find(r => r._id === contact._id);
      
            return {
              ...contact,
              ...reminder,
            };
          });
      
          setMembers(mergedData);
        } catch (error) {
          console.error("Error fetching merged contacts and reminders:", error);
        } finally {
          setLoading(false);
        }
      };
      
      useEffect(() => {
        let isMounted = true;
        if (isMounted) {
          fetchAllMembersWithReminders(setMembers, setloading, backendUrl);
        }
        return () => {
          isMounted = false;
        };
      }, [backendUrl]);
      
      

    const handleDeleteClick = async (userId, userName) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete ${userName}?`);
        
        if (!confirmDelete) return;
      
        if (!userId) {
          console.warn("User ID not available.");
          return;
        }
      
        try {
          const res = await axios.delete(`${backendUrl}/api/contacts/${userId}`);
      
          if (res.status === 200) {
            console.log(`Successfully deleted user: ${userId}`);
            setMembers(prev => prev.filter(u => u._id !== userId));
          } else {
            console.warn("Unexpected response:", res);
          }
        } catch (err) {
          console.error("Failed to delete user:", err);
        }
      };
      const handleWhatsAppClick = async(phone, name, dews,_id) => {
        console.log("User Id ",_id)
        const message = encodeURIComponent(
            `Hello ${name}, your membership is overdue by ${Math.abs(dews)} day(s). *Please pay your membership fee via Google Pay to +91 89714 23247 to reactivate your gym access*. Send us a screenshot after payment. 
            
Let us know if you need help. Thank you!`
          );          
        const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
        
        try {
            // Update reminder status in backend
            await axios.post(`${backendUrl}/api/reminders/send/${_id}`);
        
            // Open WhatsApp chat with message
            window.open(whatsappUrl, '_blank');
        } catch (error) {
            console.error("Error sending WhatsApp reminder:", error);
          }
    };
    

    const handleExpandClick = (userId) => {
        setExpandedRow(expandedRow === userId ? null : userId);
    };

    const handleRadioChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleCustomDateChange = (event) => {
        setCustomDate(event.target.value);
    };

    const handleRenewClick = async (userId) => {
        setRenewing(true)
        let daysToAdd = 0;
        switch (selectedOption) {
            case '1-Month': daysToAdd = 30; break;
            case '2-Month': daysToAdd = 60; break;
            case '3-Month': daysToAdd = 90; break;
            default:
                console.error('No valid option selected');
                return;
        }

        try {
            const contactResponse = await axios.get(`${backendUrl}/api/contacts/${userId}`);
            const contact = contactResponse.data;

            const phone=contact.phone;

            const newStartDate = customDate ? new Date(customDate).toISOString()
                : (contact.endDate ? new Date(contact.endDate).toISOString() : new Date().toISOString());

            const newEndDate = customDate ? new Date(customDate)
                : (contact.endDate ? new Date(contact.endDate) : new Date());
            newEndDate.setDate(newEndDate.getDate() + daysToAdd);
            const newEndDateISO = newEndDate.toISOString();

            // Calculate the duration between the new start and end date in days
            const today = new Date();
            const endDate = new Date(newEndDateISO);
            const adjustedToday = new Date(today);
            adjustedToday.setDate(adjustedToday.getDate() - 1);
            const durationInDays = Math.floor((endDate - adjustedToday) / (1000 * 60 * 60 * 24)); // Days difference

            // Set the total dews as the duration (no per-day cost)
            const dews = durationInDays; // Directly use the duration as the dews

            const status = dews >= 0 ? "Active" : "InActive";
            await axios.put(`${backendUrl}/api/contacts/${userId}`, {
                date: newStartDate,
                endDate: newEndDateISO,
                status: status,
                plan: selectedOption,
                dews:dews,
            });


            // ALSO update reminder to reset it on renewal
            await axios.patch(`${backendUrl}/api/reminders/reset/${userId}`, {
                sentCount: 0,
                messageStatus: 'Pending',
                lastSentAt: null,
            });

            setRenewing(false)
            await fetchAllMembersWithReminders(setMembers, setloading, backendUrl);

            setExpandedRow(null);

            const formattedDate = newEndDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
            const whatsappMessage = `Hello! Your plan has been successfully renewed for ${selectedOption}. Valid till ${formattedDate}. Thank you!`;
                          const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');
        } catch (error) {
            console.error('Error renewing contact:', error);
        }
    };

    const inactiveMembers = members.filter(user =>  user.dews< 0);
        const menCount = inactiveMembers.filter(user => user.gender === "Male").length;
        const womenCount = inactiveMembers.filter(user => user.gender === "Female").length;
        const totalCount = inactiveMembers.length;

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div>
            {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center pointer-events-auto">
                <div className="flex flex-col items-center space-y-4 animate-fadeIn">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-white animate-spin" />
                </div>
                <p className="text-white text-lg font-semibold">loading ...</p>
                </div>
            </div>
            )}
            {renewing && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center pointer-events-auto">
                <div className="flex flex-col items-center space-y-4 animate-fadeIn">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-white animate-spin" />
                </div>
                <p className="text-white text-lg font-semibold">renewing ...</p>
                </div>
            </div>
            )}

            {/* Search Bar */}
            <div className="search-bar-container">
                <input
                    type="text"
                    className="search-bar-input"
                    placeholder="Search by phone number or name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="flex flex-wrap gap-4 mb-4 ml-8 text-sm">
                    <span className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full shadow-sm">
                        <FaUsers /> Total: {totalCount}
                    </span>
                    <span className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full shadow-sm">
                        <FaMale /> Men: {menCount}
                    </span>
                    <span className="flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full shadow-sm">
                        <FaFemale /> Women: {womenCount}
                    </span>
                </div>

            <div className="container mt-5">
                <div  className="lg:block hidden">
                <div className='px-3  block overflow-y-auto '
                
                  >
                    <table className="table table-dark table-striped">
                        <thead className="thead-dark">
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Due</th>
                                <th>Send Message</th>
                                <th>Reminder Status</th>
                                <th>Sent Count</th>
                                <th>Expand</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members
                                .filter(user =>
                                    user.dews<0 &&
                                     
                                    user.gender === props.gender &&
                                    (
                                        user.phone.includes(searchTerm) ||
                                        user.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                )
                                .sort((a, b) => b.dews - a.dews)
                                .map(user => (
                                    <React.Fragment key={user._id}>
                                        <tr>
                                            <td>{user.name}</td>
                                            <td>{user.phone}</td>
                                            <td
                                            >
                                                <div className={`${user.dews<0 ? 'bg-red-600' :'bg-green-600'} px-2 py-1  rounded-2xl flex items-center justify-center  `}>
                                                {user.dews>=0?"Active":"Expired"}
                                            </div>
                                            </td>
                                            <td>{user.dews}</td>
                                            <td>
                                                <button onClick={() => handleWhatsAppClick(user.phone, user.name, user.dews,user._id)} className='submitbutton'>Send</button>
                                            </td>
                                            <td className=" px-4 py-2">
                                            <span
                                                className={`text-xs inline-flex items-center justify-center w-16 py-1 rounded-full  font-semibold ${
                                                user.reminderStatus === "Sent"
                                                    ? "bg-green-200 text-green-800 "
                                                    : user.reminderStatus === "Failed"
                                                    ? "bg-red-200 text-red-800"
                                                    : "bg-yellow-200 text-yellow-800"
                                                }`}
                                            >
                                                {user.reminderStatus || "Pending"}
                                            </span>
                                            </td>
                                            <td className=" px-4 py-2">{user.sentCount}</td>
                                            <td>
                                                <button onClick={() => handleExpandClick(user._id)} className='submitbutton'>Renew</button>
                                            </td>
                                            <td>
                                        <button
                                            onClick={() => handleDeleteClick(user._id, user.name)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition duration-300 ml-2"
                                            >
                                            <i className="fas fa-trash-alt"></i>
                                            </button>

                                        </td>
                                        </tr>
                                        {expandedRow === user._id && (
                                            <tr>
                                                <td colSpan="6">
                                                    <div className='expand'>
                                                        <label>
                                                            <input
                                                                type="radio"
                                                                name="options"
                                                                value="1-Month"
                                                                checked={selectedOption === '1-Month'}
                                                                onChange={handleRadioChange}
                                                            /> 1 Month
                                                        </label>
                                                        <label style={{ marginLeft: '20px' }}>
                                                            <input
                                                                type="radio"
                                                                name="options"
                                                                value="2-Month"
                                                                checked={selectedOption === '2-Month'}
                                                                onChange={handleRadioChange}
                                                            /> 2 Month
                                                        </label>
                                                        <label style={{ marginLeft: '20px' }}>
                                                            <input
                                                                type="radio"
                                                                name="options"
                                                                value="3-Month"
                                                                checked={selectedOption === '3-Month'}
                                                                onChange={handleRadioChange}
                                                            /> 3 Month
                                                        </label>
                                                        <input 
                                                        style={{ marginLeft: '20px' }}
                                                            type="date" 
                                                            className="text-black" 
                                                            value={customDate} 
                                                            onChange={handleCustomDateChange} 
                                                        />
                                                        <button
                                                            className='renew'
                                                            style={{ marginLeft: '20px' }}
                                                            onClick={() => handleRenewClick(user._id)}
                                                        >
                                                            Renew
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                        </tbody>
                    </table>
                </div>
                </div>

                {/* Mobile View */}
                <div className="mobile-card-view1">
                    {members
                        .filter(user =>
                            user.dews<0 &&
                            
                            user.gender === props.gender &&
                            (
                                user.phone.includes(searchTerm) ||
                                user.name.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                        )
                        .sort((a, b) => b.dews - a.dews)
                        .map(user => (
                            <div className="mobile-card" key={user._id}>
                                
                                <div className="status-badge inactive">
                                <div className={`${user.dews<0 ? '' :''} pt-1 px-2 `}>
                                    {user.dews>=0?"Active":"Expired"}
                                </div>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-user icon"></i>
                                    <span>{user.name}</span>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-phone icon"></i>
                                    <span>{user.phone}</span>
                                </div>
                                <div className="info-row">
                                    <i className="fas fa-coins icon"></i>
                                    <span>{user.dews}</span>
                                </div>
                                {/* Reminder status badge */}
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
                    <span className="text-xs text-gray-50">
                      Sent: {user.sentCount}
                    </span>
                  </div>
                                <div >
                                    <div className='flex'>
                                        <button
                                            className='submitbutton'
                                            onClick={() => handleWhatsAppClick(user.phone, user.name, user.dews,user._id)}
                                        >
                                            Send
                                        </button>
                                        <button
                                            className='submitbutton'
                                            onClick={() => handleExpandClick(user._id)}
                                        >
                                            Renew
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(user._id, user.name)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition duration-300 ml-2"
                                            >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>    
                                    <div>
                                        {expandedRow === user._id && (
                                            <div className="expand">
                                                <label>
                                                    <input
                                                        type="radio"
                                                        name="mobile-options"
                                                        value="1-Month"
                                                        checked={selectedOption === '1-Month'}
                                                        onChange={handleRadioChange}
                                                    /> 1 Month
                                                </label>
                                                <label style={{ marginLeft: '10px' }}>
                                                    <input
                                                        type="radio"
                                                        name="mobile-options"
                                                        value="2-Month"
                                                        checked={selectedOption === '2-Month'}
                                                        onChange={handleRadioChange}
                                                    /> 2 Month
                                                </label>
                                                <label style={{ marginLeft: '10px' }}>
                                                    <input
                                                        type="radio"
                                                        name="mobile-options"
                                                        value="3-Month"
                                                        checked={selectedOption === '3-Month'}
                                                        onChange={handleRadioChange}
                                                    /> 3 Month
                                                </label>
                                                <div className='flex gap-2'>
                                                    <input
                                                        type="date"
                                                        className=" text-black"
                                                        value={customDate}
                                                        onChange={handleCustomDateChange}
                                                    />
                                                    <button
                                                        className='p-4'
                                                        onClick={() => handleRenewClick(user._id)}
                                                    >
                                                        Renew
                                                    </button>

                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default Active;