import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import pb from '../../pocketbase';

const UserView = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [bids, setBids] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data
        const userData = await pb.collection('users').getOne(id);
        setUser(userData);

        // Fetch user's auctions
        const userAuctions = await pb.collection('auctions').getFullList({
          filter: `userId = '${id}'`,
        });
        setAuctions(userAuctions);

        // Fetch user's bids
        const userBids = await pb.collection('bids').getFullList({
          filter: `userId = '${id}'`,
        });
        setBids(userBids);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Détails de l'utilisateur</h1>
      <p>Nom d'utilisateur: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Rôle: {user.role}</p>
      <p>Date de naissance: {new Date(user.birthdate).toLocaleDateString()}</p>

      <h2>Enchères créées par {user.username}</h2>
      <ul>
        {auctions.length > 0 ? (
          auctions.map(auction => (
            <li key={auction.id}>
              <Link to={`/auctions/${auction.id}`}>{auction.title}</Link>
            </li>
          ))
        ) : (
          <p>Aucune enchère trouvée</p>
        )}
      </ul>

      <h2>Offres faites par {user.username}</h2>
      <ul>
        {bids.length > 0 ? (
          bids.map(bid => (
            <li key={bid.id}>
              <Link to={`/bids/${bid.id}`}>Offre sur l'enchère {bid.auctionId}: {bid.amount}</Link>
            </li>
          ))
        ) : (
          <p>Aucune offre trouvée</p>
        )}
      </ul>
    </div>
  );
};

export default UserView;
