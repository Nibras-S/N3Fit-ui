import React, { useState } from 'react';
import './white.css';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import signIn function
import { auth } from '../../firebase/firebase'; // Import initialized auth instance
import { Outlet, Navigate ,useNavigate } from 'react-router-dom';

function AdminAuth() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [temp,setTemp] = useState(null)

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Authenticate using Firebase email/password authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;
            const token = await user.getIdToken();

        // Store token in localStorage
        localStorage.setItem("adminToken", token);
            navigate("/Active"); // Navigate to InActive page after successful login
            // Set logout timer for 1 hour (3600000 ms)
            setTimeout(() => {
                auth.signOut(); // Firebase logout
                localStorage.removeItem("adminToken"); // Clear token
                navigate("/admin"); // Redirect to login page
                alert("Session expired. Please log in again.");
            }, 60 * 60 * 1000); // 1 hour

            console.log('Login successful!');
        } catch (error) {
            setError('Invalid email or password');
            console.error("Error logging in:", error.message);
        }
        
    };

    return (
        <div className='login-container'>
            <div className='login-box'>
                <h1 className='login-title'>Admin Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className='input-group'>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='login-input'
                            required
                        />
                    </div>
                    <div className='input-group'>
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='login-input'
                            required
                        />
                    </div>
                    {error && <div className='error-message'>{error}</div>}
                    <button type="submit" className='login-button'>Login</button>
                </form>
            </div>
        </div>
    );
}

export default AdminAuth;



