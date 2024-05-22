import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';

const AuctionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const auctionData = await pb.collection('auctions').getOne(id);
        setAuction(auctionData);
      } catch (error) {
        console.error("Error fetching auction:", error);
      }
    };

    fetchAuction();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuction({ ...auction, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await pb.collection('auctions').update(id, auction);
      navigate('/auctions');
    } catch (error) {
      console.error("Error updating auction:", error);
    }
  };

  if (!auction) return <div>Loading...</div>;

  return (
    <div>
      <h1>Modifier l'enchère</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Titre:
          <input type="text" name="title" value={auction.title} onChange={handleChange} />
        </label>
        <br />
        <label>
          Description:
          <input type="text" name="description" value={auction.description} onChange={handleChange} />
        </label>
        <br />
        <label>
          Prix de départ:
          <input type="number" name="startingPrice" value={auction.startingPrice} onChange={handleChange} />
        </label>
        <br />
        <label>
          Status:
          <select name="status" value={auction.status} onChange={handleChange}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <br />
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
};

export default AuctionEdit;
