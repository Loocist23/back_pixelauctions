import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import pb from "../../pocketbase";
import '../../styles/users.css'; // Import the CSS file

const UserView = () => {
    // Mise à jour du titre du document
    document.title = "Utilisateur";

    // Récupération de l'ID de l'utilisateur à partir des paramètres d'URL
    const { id } = useParams();

    // Initialisation du hook de navigation
    const navigate = useNavigate();

    // Déclaration des états pour les données de l'utilisateur, les enchères, les offres, les favoris, le chargement et les erreurs
    const [user, setUser] = useState(null);
    const [auctions, setAuctions] = useState([]);
    const [bids, setBids] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hook d'effet pour récupérer les données utilisateur lors du montage du composant et chaque fois que l'ID change
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Récupération des données de l'utilisateur depuis l'API locale
                const userResponse = await fetch(`http://localhost:3000/users/${id}`);
                if (!userResponse.ok) {
                    throw new Error('Error fetching user data');
                }
                const userData = await userResponse.json();
                setUser(userData);

                // Récupération des enchères de l'utilisateur depuis PocketBase
                const auctionsResponse = await pb.collection('auctions').getList(1, 50, {
                    filter: `userId = "${id}"`
                });
                setAuctions(auctionsResponse.items);

                // Récupération des offres de l'utilisateur depuis PocketBase
                const bidsResponse = await pb.collection('bids').getList(1, 50, {
                    filter: `userId = "${id}"`
                });
                setBids(bidsResponse.items);

                // Récupération des enchères favorites de l'utilisateur depuis l'API locale
                const favoritesResponse = await fetch(`http://localhost:3000/users/${id}/favorites`);
                if (!favoritesResponse.ok) {
                    throw new Error('Error fetching favorite auctions data');
                }
                const userFavorites = await favoritesResponse.json();

                // Vérification de la structure des favoris et mise à jour de l'état
                if (userFavorites.items) {
                    setFavorites(userFavorites.items.map(item => item.expand?.Auction || item));
                }

            } catch (error) {
                // Gestion des erreurs lors de la récupération des données
                console.error('Error fetching user data:', error);
                setError('Error fetching user data');
            } finally {
                // Mise à jour de l'état de chargement à la fin de la récupération des données
                setLoading(false);
            }
        };

        // Appel de la fonction de récupération des données utilisateur
        fetchUserData();
    }, [id]);

    // Affichage d'un message de chargement ou d'erreur si nécessaire
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!user) return <div>User not found</div>;

    return (
        <div className="container">
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

            <h2>Enchères favorites de {user.username}</h2>
            <ul>
                {favorites.length > 0 ? (
                    favorites.map(favorite => (
                        <li key={favorite.id}>
                            <Link to={`/auctions/${favorite.id}`}>{favorite.title}</Link>
                        </li>
                    ))
                ) : (
                    <p>Aucune enchère favorite trouvée</p>
                )}
            </ul>

            {/* Bouton pour naviguer vers la page de modification de l'utilisateur */}
            <button onClick={() => navigate(`/users/edit/${id}`)}>Modifier</button>
        </div>
    );
};

export default UserView;
