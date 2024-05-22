import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1>Bienvenue sur PixelAuction</h1>
      <p>
        PixelAuction est une plateforme d'enchères en ligne qui permet aux utilisateurs de créer, voir, et gérer des enchères et des offres.
        Notre objectif est de fournir un espace sécurisé et fiable pour que les utilisateurs puissent participer à des enchères excitantes,
        faire des offres sur des articles intéressants, et gérer leurs enchères et leurs offres de manière efficace.
      </p>
      <h2>Fonctionnalités</h2>
      <ul>
        <li>Créer et gérer des enchères</li>
        <li>Voir toutes les enchères en cours</li>
        <li>Faire des offres sur des enchères</li>
        <li>Voir et gérer vos offres</li>
        <li>Gérer les utilisateurs de la plateforme</li>
      </ul>
      <h2>Commencer</h2>
      <p>
        Pour commencer, vous pouvez créer une enchère en cliquant sur le lien "Créer une enchère" dans la barre de navigation.
        Vous pouvez également voir les enchères en cours en cliquant sur le lien "Voir les enchères".
        Pour gérer les utilisateurs de la plateforme, vous pouvez cliquer sur le lien "Gérer les utilisateurs".
      </p>
    </div>
  );
};

export default Home;
