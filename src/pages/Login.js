import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../pocketbase';
import '../styles/login.css'; // Import the login CSS

/**
 * Represents the login component for admin users.
 * This component allows admin users to log in to the application.
 */
const Login = () => {
  // Set the document title to "Login"
  document.title = "Login";

  // State hooks for email, password, and error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Hook to navigate programmatically
  const navigate = useNavigate();

  /**
   * Handles the form submission for login.
   * Authenticates the user with email and password.
   * Redirects to the home page if authentication is successful and user is an admin.
   * Otherwise, displays an error message.
   *
   * @param {Object} e - The event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Authenticate the user with PocketBase
      const authData = await pb.collection('users').authWithPassword(email, password);

      // Retrieve the authenticated user's details
      const user = await pb.collection('users').getOne(authData.record.id);

      // Check if the user is an admin
      if (user.role !== 'admin') {
        setError('Access denied: Admins only');
        pb.authStore.clear(); // Clear the auth store if not an admin
        return;
      }

      navigate('/'); // Redirect to the home page or another page for admins
    } catch (error) {
      setError('Invalid email or password');
      console.error("Error during login:", error);
    }
  };

  return (
      <div id={"login"}>
        <div id="login-container">
          <h1>Admin Login</h1>
          <form onSubmit={handleSubmit}>
            <label>
              Email:
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </label>
            <label>
              Password:
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            </label>
            <button type="submit">Login</button>
          </form>
          {error && <p id="error-message">{error}</p>}
        </div>
      </div>
  );
};

export default Login;