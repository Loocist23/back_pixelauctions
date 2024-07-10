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
  const [avatarPreview, setAvatarPreview] = useState('');
  const [favoriteAuctions, setFavoriteAuctions] = useState([]);
  const [allAuctions, setAllAuctions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserAndAuctions = async () => {
      try {
        // Fetch user data
        const response = await fetch(`http://localhost:3000/users/${id}`);
        if (!response.ok) {
          throw new Error('Error fetching user data');
        }
        const userData = await response.json();
        console.log('userData:', userData);

        setUser(userData);
        setUsername(userData.username);
        setEmail(userData.email);
        setRole(userData.role);
        setBirthdate(formatDate(userData.birthdate));

        if (userData.avatar) {
          const url = `http://localhost:3000/users/${id}/avatar`;
          setAvatarUrl(url);
        }

        // Fetch all auctions
        const auctionsResponse = await pb.collection('auctions').getList(1, 100);
        setAllAuctions(auctionsResponse.items);

        // Fetch favorite auctions
        const favoriteResponse = await pb.collection('favorite').getList(1, 50, {
          filter: `User="${id}"`,
          expand: 'Auction'
        });
        setFavoriteAuctions(favoriteResponse.items);
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
    const file = e.target.files[0];
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleFavoriteAuctionRemove = async (auctionId) => {
    const favorite = favoriteAuctions.find(item => item.expand.Auction.id === auctionId);
    if (favorite) {
      try {
        await pb.collection('favorite').delete(favorite.id);
        setFavoriteAuctions(favoriteAuctions.filter(item => item.id !== favorite.id));
      } catch (error) {
        console.error("Error removing favorite auction:", error);
      }
    }
  };

  const handleFavoriteAuctionAdd = async (e) => {
    const auctionId = e.target.value;
    if (auctionId && !favoriteAuctions.find(item => item.expand.Auction.id === auctionId)) {
      const auction = allAuctions.find(auction => auction.id === auctionId);
      if (auction) {
        try {
          const newFavorite = await pb.collection('favorite').create({
            User: id,
            Auction: auctionId
          });
          setFavoriteAuctions([...favoriteAuctions, { ...newFavorite, expand: { Auction: auction } }]);
        } catch (error) {
          console.error("Error adding favorite auction:", error);
        }
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
          {(avatarPreview || avatarUrl) && (
              <div>
                <img src={avatarPreview || avatarUrl} alt="User Avatar" style={{ width: '100px', height: '100px' }} />
              </div>
          )}
          <label>
            Favorite Auctions:
            <ul>
              {favoriteAuctions.map(item => (
                  <li key={item.id}>
                    {item.expand.Auction.title} <button type="button" onClick={() => handleFavoriteAuctionRemove(item.expand.Auction.id)}>Remove</button>
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
