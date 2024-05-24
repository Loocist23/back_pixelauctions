import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/bids.css'; // Import the CSS file

const BidList = () => {
  document.title = "Gestion des Offres";
  const [bids, setBids] = useState([]);
  const [users, setUsers] = useState({});
  const [auctions, setAuctions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const bidsList = await pb.collection('bids').getFullList();

        // Fetch associated users and auctions
        const userIds = [...new Set(bidsList.map(bid => bid.userId))];
        const auctionIds = [...new Set(bidsList.map(bid => bid.auctionId))];

        const usersList = await Promise.all(userIds.map(id => pb.collection('users').getOne(id).catch(() => null)));
        const auctionsList = await Promise.all(auctionIds.map(id => pb.collection('auctions').getOne(id).catch(() => null)));

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
        console.error("Error fetching bids:", error);
      }
    };

    fetchBids();
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
    navigate(`/bids/edit/${id}`);
  };

  return (
      <div className="container">
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
                <td>
                  <Link to={`/users/view/${bid.userId}`}>
                    {users[bid.userId]?.username || 'Inconnu'}
                  </Link>
                </td>
                <td>
                  <Link to={`/auctions/${bid.auctionId}`}>
                    {auctions[bid.auctionId]?.title || 'Inconnu'}
                  </Link>
                </td>
                <td>{bid.amount}</td>
                <td>{bid.status}</td>
                <td className="actions">
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

export default BidList;
