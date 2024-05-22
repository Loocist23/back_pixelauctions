import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';

const AuctionCreate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [status, setStatus] = useState('open');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      title,
      description,
      startingPrice,
      status,
    };

    try {
      await pb.collection('auctions').create(data);
      navigate('/auctions');
    } catch (error) {
      console.error("Error creating auction:", error);
    }
  };

  return (
    <div>
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
        <br />
        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Prix de départ:
          <input
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Status:
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <br />
        <button type="submit">Créer</button>
      </form>
    </div>
  );
};

export default AuctionCreate;
