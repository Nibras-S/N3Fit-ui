import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Active.css';
import { FaUsers, FaMale, FaFemale } from 'react-icons/fa';


function Active(props) {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [loading, setloading] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [customDate, setCustomDate] = useState('');
    const [renewing,setRenewing] = useState(false)

    // const backendUrl = process.env.BACKEND_URL;// State to store the search input

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

    const activeMembers = members.filter(user => user.dews>=0);
    const menCount = activeMembers.filter(user => user.gender === "Male").length;
    const womenCount = activeMembers.filter(user => user.gender === "Female").length;
    const totalCount = activeMembers.length;

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
        console.log("UserID : ",userId)
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
    // Function to handle the search input change
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
                <div className="search-bar-container ">
                    <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Search by phone number or name"
                        value={searchTerm}
                        onChange={handleSearchChange} // Update the search input state
                    />
                </div>
                <div className="flex flex-wrap gap-4 mb-4 ml-8 text-sm">
                    <span className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-full shadow-sm">
                     <FaUsers /> Total: {totalCount}
                    </span>
                        <span className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full shadow-sm">
                        <FaMale /> Men: {menCount}
                    </span>
                    <span className="flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full shadow-sm">
                        <FaFemale /> Women: {womenCount}
                    </span>
                </div>
            <div className="container mt-5 ">
                {/* Search Bar */}
                {/* Mobile View Cards */}

                <div className="mobile-card-view">
                {members
                    .filter(user =>
                        user.dews>=0 &&
                    user.gender === props.gender &&
                    (
                        user.phone.includes(searchTerm) ||
                        user.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                    )
                    .sort((a, b) => a.dews - b.dews)
                    .map(user => {
                    const formatDate = (dateString) => {
                        const date = new Date(dateString);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                    };

                    return (
                        <div className="mobile-card" key={user._id}>

                        <div  >
                            <div className="status-badge">
                                <div className={`${user.dews<0 ? '' :''} pt-1 px-2 `}>
                                    {user.dews>=0?"Active":"Expired"}
                                </div></div>
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

                            <div className="date-row">
                                <div className="info-row">
                                <i className="fas fa-play icon"></i>
                                <span>{formatDate(user.date)}</span>
                                </div>
                                <div className="info-row">
                                <i className="fas fa-flag icon"></i>
                                <span>{formatDate(user.endDate)}</span>
                                </div>
                            </div>
                                <div>
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
                                        <button
                                            className='p-4 ml-2'
                                            onClick={() => handleRenewClick(user._id)}
                                        >
                                            Renew
                                        </button>
                                    
                                </div>
                            )}
                        </div>
                                </div>
                    


                    );
                    })}
                </div>

                {/* Table */}
                <div style={{ height: '100vh' }}>
                <div className='px-3 block overflow-y-auto max-h-[73vh] 2xl:max-h-[90vh]'
                
                  >

                <table className="table table-dark table-striped ">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Status</th>
                            <th scope="col">Rem</th>
                            <th scope="col">Start Date</th>
                            <th scope="col">End Date</th>
                            <th>Expand</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members
                            .filter(user => 
                                user.dews>=0 && 
                                user.gender === props.gender && 
                                (
                                    user.phone.includes(searchTerm) ||
                                    user.name.toLowerCase().includes(searchTerm.toLowerCase())
                                  ) // Filter by phone number based on search term
                            )
                            .sort((a, b) => a.dews - b.dews) // Sorting by date in descending order
                            .map((user) => {
                                // Helper function to format a date as 'dd-mm-yyyy'
                                const formatDate = (dateString) => {
                                    const date = new Date(dateString);
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
                                    const year = date.getFullYear();
                                    return `${day}-${month}-${year}`;
                                };

                                // Format the start date and end date
                                const formattedStartDate = formatDate(user.date);
                                const formattedEndDate = formatDate(user.endDate);

                                return (
                                    <React.Fragment key={user._id}>

                                    
                                    <tr>
                                        <td>{user.name}</td>
                                        <td>{user.phone}</td>
                                        <td>
                                            <div className={`${user.dews<0 ? 'bg-red-600' :'bg-green-600'} px-2 py-1  rounded-2xl flex items-center justify-center  `}>
                                                {user.dews>=0?"Active":"Expired"}
                                            </div>
                                        </td>
                                        <td>
                                            {user.dews}
                                        </td>
                                        <td>{formattedStartDate}</td>
                                        <td>{formattedEndDate}</td>
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
                                );
                            })
                        }
                    </tbody>
                </table>
                </div>
                </div>
            </div>
        </div>
    );
}

export default Active;
