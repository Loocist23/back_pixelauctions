import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';

const UserCreate = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('user');
  const [birthdate, setBirthdate] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
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
      await pb.collection('users').create(formData);
      await pb.collection('users').requestVerification(email);
      navigate('/users');
    } catch (error) {
      setError('Failed to create user');
      console.error("Error creating user:", error);
    }
  };

  return (
    <div>
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
        <br />
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Confirm Password:
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Role:
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <br />
        <label>
          Birthdate:
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Avatar:
          <input type="file" onChange={handleAvatarChange} />
        </label>
        <br />
        <button type="submit">Create</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default UserCreate;
