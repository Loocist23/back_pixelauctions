import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/users.css'; // Import the CSS file
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pocketbase.0shura.fr');

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
  const [favoriteAuctions, setFavoriteAuctions] = useState([]);
  const [allAuctions, setAllAuctions] = useState([]);

  useEffect(() => {
    const fetchUserAndAuctions = async () => {
      try {
        const userResponse = await pb.collection('users').getOne(id, {
          expand: 'favorite_auctions'
        });
        console.log('userData:', userResponse);

        setUser(userResponse);
        setUsername(userResponse.username);
        setEmail(userResponse.email);
        setRole(userResponse.role);
        setBirthdate(formatDate(userResponse.birthdate));
        setFavoriteAuctions(userResponse.expand?.favorite_auctions || []);

        if (userResponse.avatar) {
          const url = pb.files.getUrl(userResponse, userResponse.avatar);
          setAvatarUrl(url);
        }

        const auctionsResponse = await pb.collection('auctions').getList(1, 100);
        setAllAuctions(auctionsResponse.items);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserAndAuctions();
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

  const handleFavoriteAuctionRemove = async (auctionId) => {
    try {
      const updatedFavoriteAuctions = favoriteAuctions.filter(auction => auction.id !== auctionId);
      await pb.collection('users').update(id, {
        'favorite_auctions-': auctionId
      });
      setFavoriteAuctions(updatedFavoriteAuctions);
    } catch (error) {
      console.error("Error removing favorite auction:", error);
    }
  };

  const handleFavoriteAuctionAdd = async (e) => {
    const auctionId = e.target.value;
    if (auctionId && !favoriteAuctions.find(auction => auction.id === auctionId)) {
      try {
        await pb.collection('users').update(id, {
          'favorite_auctions+': auctionId
        });
        const auction = allAuctions.find(auction => auction.id === auctionId);
        setFavoriteAuctions([...favoriteAuctions, auction]);
      } catch (error) {
        console.error("Error adding favorite auction:", error);
      }
    }
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
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

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
          <label>
            Favorite Auctions:
            <ul>
              {favoriteAuctions.map(auction => (
                  <li key={auction.id}>
                    {auction.title} <button type="button" onClick={() => handleFavoriteAuctionRemove(auction.id)}>Remove</button>
                  </li>
              ))}
            </ul>
            <select onChange={handleFavoriteAuctionAdd} value="">
              <option value="" disabled>Select an auction to add</option>
              {allAuctions.map(auction => (
                  <option key={auction.id} value={auction.id}>{auction.title}</option>
              ))}
            </select>
          </label>
          <button type="submit">Enregistrer</button>
        </form>
        {error && <p id="error-message">{error}</p>}
      </div>
  );
};

export default UserEdit;
