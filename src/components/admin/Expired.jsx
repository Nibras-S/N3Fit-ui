import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Active.css';
import { FaUsers, FaMale, FaFemale } from 'react-icons/fa';

function Active(props) {
    const [members, setMembers] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    const [loading, setloading] = useState(false);


    useEffect(() => {
        setloading(true)
        let isMounted = true; 
    
        const fetchMembers = async () => {
          try {
            const response = await axios.get(`${backendUrl}/api/contacts/`);
            if (isMounted) {
              setMembers(response.data);
            }
          } catch (error) {
            console.error("Error fetching contacts:", error);
          }finally{
            setloading(false)
          }
        };
    
        fetchMembers();
    
        return () => {
          isMounted = false;
        };
      }, []);

    

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

    const handleWhatsAppClick = (phone, name) => {
        const message = encodeURIComponent(`Hello ${name}, we noticed that your membership is inactive. Please contact us for more details.`);
        const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleExpandClick = (userId) => {
        setExpandedRow(expandedRow === userId ? null : userId);
        setSelectedOption(''); // Reset option when expanding a new row
    };

    const handleRadioChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleRenewClick = async (userId) => {
        let daysToAdd = 0;
        switch (selectedOption) {
            case '1-Month':
                daysToAdd = 30;
                break;
            case '2-Month':
                daysToAdd = 60;
                break;
            case '3-Month':
                daysToAdd = 90;
                break;
            default:
                console.error('No valid option selected');
                return;
        }

        try {
            const contactResponse = await axios.get(`${backendUrl}/api/contacts/${userId}`);
            const contact = contactResponse.data;

            const newStartDate = new Date().toISOString();
            const newEndDate = new Date();
            newEndDate.setDate(newEndDate.getDate() + daysToAdd);
            const newEndDateISO = newEndDate.toISOString();
            

            await axios.put(`${backendUrl}/api/contacts/${userId}`, {
                date: newStartDate,
                endDate: newEndDateISO,
                status: 'Active',
                plan: selectedOption,
                dews:daysToAdd,
            });

            console.log(`Contact ${userId} renewed successfully.`);
            const response = await axios.get(`${backendUrl}/api/contacts/`);
            setMembers(response.data);
            setExpandedRow(null);
        } catch (error) {
            console.error('Error renewing contact:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredMembers = members
        .filter(user =>
            user.dews < 0 &&
            user.gender === props.gender &&
            (
                user.phone.includes(searchTerm) ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            ) &&
            user.dews < -30
        )
        .sort((a, b) => b.dews - a.dews);

        const expiredMembers = members.filter(user => user.status === "InActive" && user.dews<-30);
        const menCount = expiredMembers.filter(user => user.gender === "Male").length;
        const womenCount = expiredMembers.filter(user => user.gender === "Female").length;
        const totalCount = expiredMembers.length;
    
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
                {/* Desktop Table */}
                <div className="desktop-table">
                    <table className="table table-dark table-striped">
                        <thead className="thead-dark">
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Due</th>
                                <th>Send Message</th>
                                <th>Expand</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((user) => (
                                <React.Fragment key={user._id}>
                                    <tr>
                                        <td>{user.name}</td>
                                        <td>{user.phone}</td>
                                        <td>{user.status}</td>
                                        <td>{user.dews}</td>
                                        <td >
                                            <button
                                                onClick={() => handleWhatsAppClick(user.phone, user.name)}
                                                className="submitbutton"
                                            >
                                                Send
                                            </button>
                                        </td>
                                        <td >
                                            <button
                                                onClick={() => handleExpandClick(user._id)}
                                                className="submitbutton"
                                            >
                                                Renew
                                            </button>
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
                                                <div className="renew-options">
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name={`options-${user._id}`}
                                                            value="1-Month"
                                                            checked={selectedOption === '1-Month'}
                                                            onChange={handleRadioChange}
                                                        /> 1 Month
                                                    </label>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name={`options-${user._id}`}
                                                            value="2-Month"
                                                            checked={selectedOption === '2-Month'}
                                                            onChange={handleRadioChange}
                                                        /> 2 Month
                                                    </label>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name={`options-${user._id}`}
                                                            value="3-Month"
                                                            checked={selectedOption === '3-Month'}
                                                            onChange={handleRadioChange}
                                                        /> 3 Month
                                                    </label>
                                                    <button
                                                        className='renew'
                                                        onClick={() => handleRenewClick(user._id)}
                                                        style={{ marginLeft: '20px' }}
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

                {/* Mobile View */}
                <div className="mobile-table">
                    {filteredMembers.map((user) => (
                        <div className="mobile-card" key={user._id}>
                            <p><strong>Name:</strong> {user.name}</p>
                            <p><strong>Phone:</strong> {user.phone}</p>
                            <p><strong>Status:</strong> {user.status}</p>
                            <p><strong>Due:</strong> {user.dews}</p>
                            <div className="mobile-card-buttons">
                                <button
                                    onClick={() => handleWhatsAppClick(user.phone, user.name)}
                                    className="submitbutton"
                                >
                                    Send
                                </button>
                                <button
                                    onClick={() => handleExpandClick(user._id)}
                                    className="submitbutton"
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

                            {expandedRow === user._id && (
                                <div className="renew-options">
                                    <label>
                                        <input
                                            type="radio"
                                            name={`options-mobile-${user._id}`}
                                            value="1-Month"
                                            checked={selectedOption === '1-Month'}
                                            onChange={handleRadioChange}
                                        /> 1 Month
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`options-mobile-${user._id}`}
                                            value="2-Month"
                                            checked={selectedOption === '2-Month'}
                                            onChange={handleRadioChange}
                                        /> 2 Month
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`options-mobile-${user._id}`}
                                            value="3-Month"
                                            checked={selectedOption === '3-Month'}
                                            onChange={handleRadioChange}
                                        /> 3 Month
                                    </label>
                                    <button 
                                        onClick={() => handleRenewClick(user._id)}
                                    >Renew</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Active;
