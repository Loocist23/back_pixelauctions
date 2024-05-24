import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/users.css'; // Import the CSS file

const UserEdit = () => {
  document.title = "Modification d'utilisateur";
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [birthdate, setBirthdate] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await pb.collection('users').getOne(id);
        setUser(userData);
        setUsername(userData.username);
        setEmail(userData.email);
        setRole(userData.role);
        setBirthdate(formatDate(userData.birthdate));

        if (userData.avatar) {
          const url = pb.files.getUrl(userData, userData.avatar);
          setAvatarUrl(url);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('role', role);
    formData.append('birthdate', birthdate);

    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      await pb.collection('users').update(id, formData);
      navigate('/users');
    } catch (error) {
      setError('Failed to update user');
      console.error("Error updating user:", error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
      <div className="container">
        <h1>Modifier l'utilisateur</h1>
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
          {avatarUrl && (
              <div>
                <img src={avatarUrl} alt="User Avatar" style={{ width: '100px', height: '100px' }} />
              </div>
          )}
          <button type="submit">Enregistrer</button>
        </form>
        {error && <p id="error-message">{error}</p>}
      </div>
  );
};

export default UserEdit;
