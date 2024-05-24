import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/auctions.css'; // Import the CSS file

const AuctionCreate = () => {
  document.title = "Creation d'Enchere";
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [status, setStatus] = useState('open');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleImagesChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('startingPrice', startingPrice);
    formData.append('status', status);

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
            Images:
            <input type="file" multiple onChange={handleImagesChange} />
          </label>
          <button type="submit">Créer</button>
        </form>
        {error && <p id="error-message">{error}</p>}
      </div>
  );
};

export default AuctionCreate;
