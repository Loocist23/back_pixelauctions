import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/auctions.css'; // Import the CSS file

const AuctionList = () => {
  document.title = "Gestion des Encheres";
  const [auctions, setAuctions] = useState([]);
  const [users, setUsers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchAuctions = async () => {
      try {
        const auctionsList = await pb.collection('auctions').getFullList({ $cancelToken: controller.signal });
        setAuctions(auctionsList);

        // Fetch associated users
        const userIds = [...new Set(auctionsList.map(auction => auction.userId))];
        const usersList = await Promise.all(userIds.filter(id => id !== undefined).map(id => {
          return pb.collection('users').getOne(id).catch((error) => {
            console.log("Error fetching user with id:", id, "Error:", error); // Log the error
            return null;
          });
        }));
        const usersMap = usersList.filter(user => user).reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setUsers(usersMap);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch cancelled');
        } else {
          console.error("Error fetching auctions or users:", error);
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
    navigate(`/auctions/edit/${id}`);
  };

  return (
      <div className="container">
        <h1>Liste des enchères</h1>
        <Link to="/auctions/create">Créer une enchère</Link>
        <table>
          <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Prix de départ</th>
            <th>Status</th>
            <th>Utilisateur</th>
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
                  {users[auction.userId] ? (
                      <Link to={`/users/view/${auction.userId}`}>
                        {users[auction.userId].username}
                      </Link>
                  ) : (
                      'Utilisateur inconnu'
                  )}
                </td>
                <td className="actions">
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

export default AuctionList;
