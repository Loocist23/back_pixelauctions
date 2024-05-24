import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/auctions.css'; // Import the CSS file

const AuctionEdit = () => {
  document.title = "Modification d'Enchere";
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [status, setStatus] = useState('open');
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const auctionData = await pb.collection('auctions').getOne(id);
        setAuction(auctionData);
        setTitle(auctionData.title);
        setDescription(auctionData.description);
        setStartingPrice(auctionData.startingPrice);
        setStatus(auctionData.status);
        setExistingImages(auctionData.images || []);
      } catch (error) {
        console.error("Error fetching auction:", error);
      }
    };

    fetchAuction();
  }, [id]);

  const handleImagesChange = (e) => {
    setImages(e.target.files);
  };

  const handleDeleteImage = async (filename) => {
    try {
      await pb.collection('auctions').update(id, {
        'images-': [filename]
      });
      setExistingImages(existingImages.filter(image => image !== filename));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
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
      await pb.collection('auctions').update(id, formData);
      navigate('/auctions');
    } catch (error) {
      setError('Failed to update auction');
      console.error("Error updating auction:", error);
    }
  };

  if (!auction) return <div>Loading...</div>;

  return (
      <div className="container">
        <h1>Modifier l'enchère</h1>
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
          <div>
            <h3>Images existantes</h3>
            {existingImages.map((image) => (
                <div key={image}>
                  <img src={pb.files.getUrl(auction, image)} alt="Auction Image" style={{ width: '100px', height: '100px' }} />
                  <button type="button" onClick={() => handleDeleteImage(image)}>Supprimer</button>
                </div>
            ))}
          </div>
          <button type="submit">Enregistrer</button>
        </form>
        {error && <p id="error-message">{error}</p>}
      </div>
  );
};

export default AuctionEdit;
