import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../pocketbase';

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchAuctions = async () => {
      try {
        const auctionsList = await pb.collection('auctions').getFullList({ $cancelToken: controller.signal });
        setAuctions(auctionsList);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch cancelled');
        } else {
          console.error("Error fetching auctions:", error);
        }
      }
    };

    fetchAuctions();

    return () => {
      controller.abort();
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await pb.collection('auctions').delete(id);
      setAuctions(auctions.filter(auction => auction.id !== id));
    } catch (error) {
      console.error("Error deleting auction:", error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-auction/${id}`);
  };

  return (
    <div>
      <h1>Liste des enchères</h1>
      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Prix de départ</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {auctions.map(auction => (
            <tr key={auction.id}>
              <td>{auction.title}</td>
              <td>{auction.description}</td>
              <td>{auction.startingPrice}</td>
              <td>{auction.status}</td>
              <td>
                <button onClick={() => handleEdit(auction.id)}>Modifier</button>
                <button onClick={() => handleDelete(auction.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Auctions;
