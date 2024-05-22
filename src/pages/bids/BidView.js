import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import pb from '../../pocketbase';

const BidView = () => {
    const { id } = useParams();
    const [bid, setBid] = useState(null);
    const [user, setUser] = useState(null);
    const [auction, setAuction] = useState(null);

    useEffect(() => {
        const fetchBid = async () => {
            try {
                const bidData = await pb.collection('bids').getOne(id);
                setBid(bidData);

                if (bidData.userId) {
                    const userData = await pb.collection('users').getOne(bidData.userId);
                    setUser(userData);
                }

                if (bidData.auctionId) {
                    const auctionData = await pb.collection('auctions').getOne(bidData.auctionId);
                    setAuction(auctionData);
                }
            } catch (error) {
                console.error("Error fetching bid:", error);
            }
        };

        fetchBid();
    }, [id]);

    if (!bid) return <div>Loading...</div>;

    return (
        <div>
            <h1>Détails de l'offre</h1>
            <p>Montant: {bid.amount}</p>
            <p>Status: {bid.status}</p>
            {user && (
                <p>
                    Utilisateur: <Link to={`/users/view/${user.id}`}>{user.username}</Link>
                </p>
            )}
            {auction && (
                <p>
                    Enchère: <Link to={`/auctions/${auction.id}`}>{auction.title}</Link>
                </p>
            )}
        </div>
    );
};

export default BidView;
