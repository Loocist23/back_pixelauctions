import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/auctions.css';

const AuctionView = () => {
  // Définition des états pour l'enchère, l'utilisateur et le chargement
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour récupérer les données de l'enchère et de l'utilisateur
  const fetchAuctionData = async () => {
    setIsLoading(true);
    try {
      const auctionData = await pb.collection('auctions').getOne(id);
      setAuction(auctionData);

      // Si l'enchère a un utilisateur associé, récupérer les données de cet utilisateur
      if (auctionData.userId) {
        const userData = await pb.collection('users').getOne(auctionData.userId);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching auction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Utiliser useEffect pour charger les données au montage du composant
  useEffect(() => {
    fetchAuctionData();
  }, [id]);

  // Affichage pendant le chargement des données
  if (isLoading) return <div>Loading...</div>;

  // Affichage des détails de l'enchère
  return (
    <div className="container">
      <h1>{auction.title}</h1>
      <p>Description: {auction.description}</p>
      <p>Prix de départ: {auction.startingPrice}</p>
      <p>Status: {auction.status}</p>
      {auction.images && auction.images.length > 0 && (
        <div>
          <h3>Images:</h3>
          {auction.images.map((image, index) => (
            <img
              key={index}
              src={pb.files.getUrl(auction, image)}
              alt={`Auction Image ${index + 1}`}
              style={{ width: '100px', height: '100px' }}
            />
          ))}
        </div>
      )}
      {user && (
        <p>
          Utilisateur: <Link to={`/users/view/${user.id}`}>{user.username}</Link>
        </p>
      )}
    </div>
  );
};

export default AuctionView;