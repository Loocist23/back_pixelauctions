import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/users.css'; // Import the CSS file

const UserCreate = () => {
  document.title = "Création d'utilisateur";
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('user');
  const [birthdate, setBirthdate] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('emailVisibility', true);
    formData.append('password', password);
    formData.append('passwordConfirm', passwordConfirm);
    formData.append('birthdate', birthdate);
    formData.append('role', role);

    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      const response = await fetch('http://localhost:3000/users/create', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const result = await response.json();
      console.log('User created:', result);
      navigate('/users');
    } catch (error) {
      setError('Failed to create user');
      console.error("Error creating user:", error);
    }
  };

  return (
      <div className="container">
        <h1>Create User</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
          </label>
          <label>
            Email:
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
          </label>
          <label>
            Password:
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </label>
          <label>
            Confirm Password:
            <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
            />
          </label>
          <label>
            Role:
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>
            Birthdate:
            <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
            />
          </label>
          <label>
            Avatar:
            <input type="file" onChange={handleAvatarChange} />
          </label>
          {avatarPreview && (
              <div>
                <img src={avatarPreview} alt="Avatar Preview" style={{ width: '100px', height: '100px' }} />
              </div>
          )}
          <button type="submit">Create</button>
        </form>
        {error && <p id="error-message">{error}</p>}
      </div>
  );
};

export default UserCreate;
