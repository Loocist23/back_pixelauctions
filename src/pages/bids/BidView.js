import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import pb from '../../pocketbase';

const BidView = () => {
    const { id } = useParams();
    const [bid, setBid] = useState(null);

    useEffect(() => {
        const fetchBid = async () => {
            try {
                const bidData = await pb.collection('bids').getOne(id);
                setBid(bidData);
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
        </div>
    );
};

export default BidView;
