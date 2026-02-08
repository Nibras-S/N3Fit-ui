import React, { useState } from 'react';
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './NewMember.css';
import { useNavigate } from 'react-router-dom';


function NewMember() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("+91");
    const [plan, setPlan] = useState("");
    const [date, setDate] = useState("");
    const [gender, setGender] = useState(""); // State for gender
    const navigate = useNavigate();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const Submit = async (e) => {
        e.preventDefault();
        let daysToAdd = 0;
        switch (plan) {
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
                console.log("Invalid option selection");
                return; 
        }
        const startDate = new Date(date); 
        const expirationDate = new Date(startDate);
        expirationDate.setDate(startDate.getDate() + daysToAdd);
        
        const today = new Date();
        const timeDiff = expirationDate - today;
        const dews = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        let status = "Active";
        if (dews < 0) {
            status = "InActive";
        }
        try {
            const result = await axios.post(`${backendUrl}/api/contacts/`, {
                name,
                phone,
                plan,
                date,
                gender,
                dews,
                status
            });
            console.log('Member added successfully:', result.data);
            navigate('/active');

        } catch (err) {
            console.error('Error adding member:', err.response ? err.response.data : err.message);
        }
    }

    return (
        <div className="max-w-4xl my-10  mx-auto p-6 bg-white rounded-lg shadow-md sm:max-w-md sm:p-4">
      <form onSubmit={Submit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">Name:</label>
          <input 
            type="text" 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
          />
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">Phone:</label>
          <PhoneInput
            country="IN"
            value={phone}
            onlyCountries={['in']}
            onChange={(value) => setPhone(value)}
            containerClass="w-full"
            inputClass="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Plan Selection */}
        <div>
          <label htmlFor="plan" className="block text-gray-700 font-semibold mb-2">Plan:</label>
          <select 
            id="plan" 
            value={plan} 
            onChange={(e) => setPlan(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a plan</option>
            <option value="1-Month">1 month</option>
            <option value="2-Month">2 months</option>
            <option value="3-Month">3 months</option>
          </select>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Gender:</label>
          <div className="flex flex-wrap items-center space-x-4 sm:space-x-8">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="gender" 
                value="Male" 
                checked={gender === 'Male'} 
                onChange={(e) => setGender(e.target.value)} 
                className="h-4 w-4 text-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2">Male</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="gender" 
                value="Female" 
                checked={gender === 'Female'} 
                onChange={(e) => setGender(e.target.value)} 
                className="h-4 w-4 text-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2">Female</span>
            </label>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label htmlFor="date" className="block text-gray-700 font-semibold mb-2">Date:</label>
          <input 
            type="date" 
            id="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button 
            type="submit" 
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 sm:w-auto sm:px-6 sm:py-3"
          >
            Add
          </button>
        </div>
      </form>
    </div>

    );
}

export default NewMember;

