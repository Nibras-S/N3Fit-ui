import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Active.css';
import PhoneInput from 'react-phone-input-2';
import { FaUsers, FaMale, FaFemale } from 'react-icons/fa';

const AllMembers = () => {
  
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [loading, setloading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);


    // const backendUrl = process.env.BACKEND_URL;// State to store the search input

    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        let isMounted = true;
      
        const loadMembers = async () => {
          await fetchMembers();
        };
      
        if (isMounted) {
          loadMembers();
        }
      
        return () => {
          isMounted = false;
        };
      }, []);
      
      const fetchMembers = async () => {
        setloading(true);
        try {
          const response = await axios.get(`${backendUrl}/api/contacts/`);
          setMembers(response.data);
        } catch (error) {
          console.error("Error fetching contacts:", error);
        } finally {
          setloading(false);
        }
      };
      

    
    const menCount = members.filter(user => user.gender === "Male").length;
    const womenCount = members.filter(user => user.gender === "Female").length;
    const totalCount = members.length;

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

    const handleEditClick = async (userId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/contacts/${userId}`);
            setEditData(response.data);
            setIsEditing(true);
        } catch (err) {
            console.error("Error fetching user data:", err.response ? err.response.data : err.message);
        }
    };
    const handleUpdate = async (e) => {
        e.preventDefault();
      
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to local midnight
        
            let daysToAdd = 0;
            switch (editData.plan) {
              case "1-Month":
                daysToAdd = 30;
                break;
              case "2-Month":
                daysToAdd = 60;
                break;
              case "3-Month":
                daysToAdd = 90;
                break;
              default:
                daysToAdd = 0;
            }
        
            const startDate = new Date(editData.date);
            startDate.setHours(0, 0, 0, 0); // Normalize to midnight
        
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + daysToAdd);
            endDate.setHours(0, 0, 0, 0); // Normalize to midnight
        
            const timeDiff = endDate.getTime() - today.getTime();
            const dews = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) ;
        
            const status = dews >= 0 ? "Active" : "InActive";
        
            const updatedData = {
              ...editData,
              endDate: endDate.toISOString(),
              status,
              dews,
            };
        
            console.log("Updating with data:", updatedData);
      
          await axios.put(`${backendUrl}/api/contacts/${editData._id}`, updatedData);
      
          setIsEditing(false);
          fetchMembers();
        } catch (err) {
          console.error("Error updating member:", err.response ? err.response.data : err.message);
        }
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
            <div className="container mt-5 ">
                {/* Search Bar */}
                {/* Mobile View Cards */}

                <div className="mobile-card-view">
                {members
                    .filter(user =>
                    
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
                    let rowBgClass = '';
                                if (user.dews >= 0) {
                                    rowBgClass = 'bg-green-600';
                                } else if (user.dews < 0 ) {
                                    // rowBgClass = 'bg-red-600 ';
                                    rowBgClass = 'bg-red-600';
                                } 

                    return (
                        <div className="mobile-card" key={user._id}>
                            <div className="flex justify-between">
                                <div className="info-row">
                                
                                    <i className="fas fa-user icon"></i>
                                    <span>{user.name}</span>
                                </div>
                                <div className={`${rowBgClass} px-2 py-1  rounded-2xl flex items-center justify-center`}>
                                        {user.dews < 0 ? 'Expired' : 'Active'}
                                </div>
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
                                <button
                                    onClick={() => handleEditClick(user._id, user.name)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition duration-300 "
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(user._id, user.name)}
                                    style={{background:'#ef2c2c'}}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition duration-300 "
                                    >
                                <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                            </div>



                    );
                    })}
                </div>

                {/* Table */}
                <div >
                <div className='px-3  block overflow-y-auto'>
                <table className="table table-dark table-striped">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Status</th>
                            <th scope="col">Rem</th>
                            <th scope="col">Start Date</th>
                            <th scope="col">End Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {members
                            .filter(user => 
                                 
                                (
                                    user.phone.includes(searchTerm) ||
                                    user.name.toLowerCase().includes(searchTerm.toLowerCase())
                                  ) // Filter by phone number based on search term
                            )
                            .sort((a, b) => a.dews - b.dews) // Sorting by date in descending order
                            .map((user) => {
                                const formatDate = (dateString) => {
                                    const date = new Date(dateString);
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const year = date.getFullYear();
                                    return `${day}-${month}-${year}`;
                                };
                            
                                const formattedStartDate = formatDate(user.date);
                                const formattedEndDate = formatDate(user.endDate);
                            
                                
                                let rowBgClass = '';
                                if (user.dews >= 0) {
                                    rowBgClass = 'bg-green-600';
                                } else if (user.dews < 0 ) {
                                    // rowBgClass = 'bg-red-600 ';
                                    rowBgClass = 'bg-red-600';
                                } 
                            
                                return (
                                    <tr key={user._id} className={` text-white`}>
                                        <td>{user.name}</td>
                                        <td>{user.phone}</td>
                                        <td>
                                        <div className={`${rowBgClass} px-2 py-1  rounded-2xl flex items-center justify-center`}>
                                        {user.dews < 0 ? 'Expired' : 'Active'}
                                        </div>

                                        </td>
                                        <td>{user.dews}</td>
                                        <td>{formattedStartDate}</td>
                                        <td>{formattedEndDate}</td>
                                        <td>
                                            <button
                                                onClick={() => handleEditClick(user._id, user.name)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition duration-300 ml-2"
                                            >
                                                 <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user._id, user.name)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition duration-300 ml-2"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                            
                        }
                    </tbody>
                </table>
                </div>
                </div>
            </div>
            {isEditing && (
            <div className="fixed inset-0 lg:px-0 px-3 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
                <h2 className="text-xl font-semibold mb-4">Edit Member</h2>
                <form onSubmit={handleUpdate}>
                    <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Name"
                    className="w-full p-2 border rounded mb-4"
                    />
                    <PhoneInput
                    country="IN"
                    value={editData.phone}
                    onlyCountries={['in']}
                    onChange={(value) => setEditData({ ...editData, phone: value })}
                    containerClass="w-full mb-4"
                    inputClass="w-full p-2 border rounded"
                    />
                    <select
                    value={editData.plan}
                    onChange={(e) => setEditData({ ...editData, plan: e.target.value })}
                    className="w-full p-2 border rounded mb-4"
                    >
                    <option value="">Select a plan</option>
                    <option value="1-Month">1 month</option>
                    <option value="2-Month">2 months</option>
                    <option value="3-Month">3 months</option>
                    </select>
                    <div className="flex space-x-4 mb-4">
                    <label>
                        <input
                        type="radio"
                        value="Male"
                        checked={editData.gender === "Male"}
                        onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                        /> Male
                    </label>
                    <label>
                        <input
                        type="radio"
                        value="Female"
                        checked={editData.gender === "Female"}
                        onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                        /> Female
                    </label>
                    </div>
                    <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="w-full p-2 border rounded mb-4"
                    />

                    <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Update
                    </button>
                    </div>
                </form>
                </div>
            </div>
            )}

        </div>
  )
}

export default AllMembers
