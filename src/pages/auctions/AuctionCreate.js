import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/auctions.css'; // Import the CSS file

const categories = [
  'All Categories',
  'NFTs (Non-Fungible Tokens)',
  'Cryptomonnaies rares',
  'Œuvres d\'art numériques',
  'Cartes à collectionner numériques',
  'Photographies digitales',
  'Musiques exclusives',
  'Films et courts métrages numériques',
  'Livres électroniques rares',
  'Jeux vidéo en édition limitée',
  'Skins et objets virtuels de jeux vidéo',
  'Domaines internet premium',
  'Logiciels vintage',
  'Collections de polices de caractères exclusives',
  'Thèmes et templates de sites web personnalisés',
  'Modèles 3D rares',
  'Comics et bandes dessinées numériques',
  'Vidéo tutorielles uniques',
  'Photographies de la NASA ou de l\'espace',
  'Enregistrements de podcasts exclusifs',
  'Hologrammes et animations 3D'
];

const AuctionCreate = () => {
  document.title = "Création d'Enchere";
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [status, setStatus] = useState('open');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await pb.collection('users').getFullList();
        const usersWithAvatars = usersList.map(user => ({
          ...user,
          avatarUrl: user.avatar ? pb.files.getUrl(user, user.avatar) : null,
        }));
        setUsers(usersWithAvatars);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('startingPrice', startingPrice);
    formData.append('status', status);
    formData.append('userId', userId);
    formData.append('category', selectedCategory);

    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      await pb.collection('auctions').create(formData);
      navigate('/auctions');
    } catch (error) {
      setError('Failed to create auction');
      console.error("Error creating auction:", error);
    }
  };

  return (
      <div className="container">
        <h1>Créer une nouvelle enchère</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Titre:
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
          </label>
          <label>
            Description:
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
          </label>
          <label>
            Prix de départ:
            <input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                required
            />
          </label>
          <label>
            Status:
            <select value={status} onChange={(e) => setStatus(e.target.value)} required>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label>
            Utilisateur:
            <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
              <option value="" disabled>Select User</option>
              {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.avatarUrl && <img src={user.avatarUrl} alt="Avatar" style={{ width: '20px', height: '20px', marginRight: '5px' }} />}
                    {user.username}
                  </option>
              ))}
            </select>
          </label>
          <label>
            Catégorie:
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
              <option value="" disabled>Select Category</option>
              {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            Images:
            <input type="file" multiple onChange={handleImagesChange} />
          </label>
          <div>
            <h3>Prévisualisation des images</h3>
            {imagePreviews.map((preview, index) => (
                <div key={index}>
                  <img src={preview} alt="Preview" style={{ width: '100px', height: '100px' }} />
                </div>
            ))}
          </div>
          <button type="submit">Créer</button>
        </form>
        {error && <p id="error-message">{error}</p>}
      </div>
  );
};

export default AuctionCreate;
