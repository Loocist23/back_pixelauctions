import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../pocketbase';

const Bids = () => {
  const [bids, setBids] = useState([]);
  const [users, setUsers] = useState({});
  const [auctions, setAuctions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchBids = async () => {
      try {
        // Fetch all bids
        const bidsList = await pb.collection('bids').getFullList({ $cancelToken: controller.signal });

        // Fetch associated users and auctions
        const userIds = [...new Set(bidsList.map(bid => bid.userId))];
        const auctionIds = [...new Set(bidsList.map(bid => bid.auctionId))];

        const usersList = await Promise.all(userIds.map(id => pb.collection('users').getOne(id, { $cancelToken: controller.signal }).catch(() => null)));
        const auctionsList = await Promise.all(auctionIds.map(id => pb.collection('auctions').getOne(id, { $cancelToken: controller.signal }).catch(() => null)));

        // Map users and auctions by ID
        const usersMap = usersList.filter(user => user).reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});

        const auctionsMap = auctionsList.filter(auction => auction).reduce((acc, auction) => {
          acc[auction.id] = auction;
          return acc;
        }, {});

        setUsers(usersMap);
        setAuctions(auctionsMap);
        setBids(bidsList);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch cancelled');
        } else {
          console.error("Error fetching bids:", error);
        }
      }
    };

    fetchBids();

    return () => {
      controller.abort();
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await pb.collection('bids').delete(id);
      setBids(bids.filter(bid => bid.id !== id));
    } catch (error) {
      console.error("Error deleting bid:", error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-bid/${id}`);
  };

  return (
    <div>
      <h1>Liste des offres</h1>
      <table>
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Enchère</th>
            <th>Montant</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bids.map(bid => (
            <tr key={bid.id}>
              <td>{users[bid.userId]?.username || 'Inconnu'}</td>
              <td>{auctions[bid.auctionId]?.title || 'Inconnu'}</td>
              <td>{bid.amount}</td>
              <td>{bid.status}</td>
              <td>
                <button onClick={() => handleEdit(bid.id)}>Modifier</button>
                <button onClick={() => handleDelete(bid.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Bids;
