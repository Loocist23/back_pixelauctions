import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../pocketbase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      
      console.log("Auth Data:", authData);  // Log the authentication data

      // Check if the user is an admin
      const user = await pb.collection('users').getOne(authData.record.id);
      console.log("User Data:", user);  // Log the user data

      if (user.role !== 'admin') {
        setError('Access denied: Admins only');
        pb.authStore.clear(); // Clear the auth store
        return;
      }

      navigate('/'); // Redirect to the home page or another page for admins
    } catch (error) {
      setError('Invalid email or password');
      console.error("Error during login:", error);
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;
