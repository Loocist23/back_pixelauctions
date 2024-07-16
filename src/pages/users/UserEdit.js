import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/users.css'; // Importation du fichier CSS

const UserEdit = () => {
  document.title = "Modification d'utilisateur"; // Mise à jour du titre de la page

  const { id } = useParams(); // Récupération de l'ID de l'utilisateur à partir des paramètres de l'URL
  const navigate = useNavigate(); // Hook pour la navigation

  // Déclaration des états pour gérer les données de l'utilisateur et les états du formulaire
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

  // Hook useEffect pour récupérer les données de l'utilisateur et des enchères lors du montage du composant
  useEffect(() => {
    const fetchUserAndAuctions = async () => {
      try {
        // Récupération des données de l'utilisateur
        const response = await fetch(`http://localhost:3000/users/${id}`);
        if (!response.ok) {
          throw new Error('Error fetching user data');
        }
        const userData = await response.json();
        console.log('userData:', userData);

        setUser(userData); // Mise à jour de l'état de l'utilisateur
        setUsername(userData.username);
        setEmail(userData.email);
        setRole(userData.role);
        setBirthdate(formatDate(userData.birthdate));

        if (userData.avatar) {
          const url = `http://localhost:3000/users/${id}/avatar`;
          setAvatarUrl(url); // Mise à jour de l'URL de l'avatar
        }

        // Récupération de toutes les enchères
        const auctionsResponse = await pb.collection('auctions').getList(1, 100);
        setAllAuctions(auctionsResponse.items);

        // Récupération des enchères favorites de l'utilisateur
        const favoriteResponse = await pb.collection('favorite').getList(1, 50, {
          filter: `User="${id}"`,
          expand: 'Auction'
        });
        setFavoriteAuctions(favoriteResponse.items); // Mise à jour des enchères favorites
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserAndAuctions(); // Appel de la fonction de récupération des données
  }, [id]);

  // Fonction pour formater la date au format YYYY-MM-DD
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fonction pour gérer le changement d'avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file); // Mise à jour de l'état de l'avatar
    setAvatarPreview(URL.createObjectURL(file)); // Prévisualisation de l'avatar
  };

  // Fonction pour supprimer une enchère favorite
  const handleFavoriteAuctionRemove = async (auctionId) => {
    const favorite = favoriteAuctions.find(item => item.expand.Auction.id === auctionId);
    if (favorite) {
      try {
        await pb.collection('favorite').delete(favorite.id); // Suppression de l'enchère favorite
        setFavoriteAuctions(favoriteAuctions.filter(item => item.id !== favorite.id)); // Mise à jour de la liste des enchères favorites
      } catch (error) {
        console.error("Error removing favorite auction:", error);
      }
    }
  };

  // Fonction pour ajouter une enchère favorite
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
          setFavoriteAuctions([...favoriteAuctions, { ...newFavorite, expand: { Auction: auction } }]); // Ajout de la nouvelle enchère favorite
        } catch (error) {
          console.error("Error adding favorite auction:", error);
        }
      }
    }
  };

  // Fonction pour soumettre le formulaire de modification de l'utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('role', role);
    formData.append('birthdate', birthdate);

    if (avatar) {
      formData.append('avatar', avatar); // Ajout de l'avatar si présent
    }

    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      navigate('/users'); // Redirection vers la liste des utilisateurs après modification réussie
    } catch (error) {
      setError('Failed to update user');
      console.error("Error updating user:", error);
    }
  };

  if (!user) return <div>Loading...</div>; // Affichage du chargement si les données de l'utilisateur ne sont pas encore disponibles

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
        {error && <p id="error-message">{error}</p>} {/* Affichage des erreurs */}
      </div>
  );
};

export default UserEdit;
