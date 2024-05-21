import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Bienvenue sur PixelAuction</h1>
      <nav>
        <ul>
          <li><Link to="/create-auction">Créer une enchère</Link></li>
          <li><Link to="/auctions">Voir les enchères</Link></li>
          <li><Link to="/bids">Voir les offres</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
