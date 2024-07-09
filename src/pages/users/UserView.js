import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../../styles/users.css'; // Import the CSS file

const UserView = () => {
    document.title = "Utilisateur";
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [auctions, setAuctions] = useState([]);
    const [bids, setBids] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch user data
                const userResponse = await fetch(`http://localhost:3000/users/${id}`);
                if (!userResponse.ok) {
                    throw new Error('Error fetching user data');
                }
                const userData = await userResponse.json();
                setUser(userData);

                // Fetch user's auctions
                const auctionsResponse = await fetch(`http://localhost:3000/auctions?userId=${id}`);
                if (!auctionsResponse.ok) {
                    throw new Error('Error fetching auctions data');
                }
                const userAuctions = await auctionsResponse.json();
                setAuctions(userAuctions);

                // Fetch user's bids
                const bidsResponse = await fetch(`http://localhost:3000/bids?userId=${id}`);
                if (!bidsResponse.ok) {
                    throw new Error('Error fetching bids data');
                }
                const userBids = await bidsResponse.json();
                setBids(userBids);

                // Fetch user's favorite auctions
                const favoritesResponse = await fetch(`http://localhost:3000/users/${id}/favorites`);
                if (!favoritesResponse.ok) {
                    throw new Error('Error fetching favorite auctions data');
                }
                const userFavorites = await favoritesResponse.json();
                setFavorites(userFavorites.items.map(item => item.expand.Auction));

            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Error fetching user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

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
        </div>
    );
};

export default UserView;
