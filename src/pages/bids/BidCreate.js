import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/bids.css'; // Import the CSS file

const BidCreate = () => {
    document.title = "Creation d'offre";
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('pending');
    const [auctionId, setAuctionId] = useState('');
    const [userId, setUserId] = useState('');
    const [auctions, setAuctions] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAuctions = async () => {
            const response = await pb.collection('auctions').getFullList();
            setAuctions(response);
        };

        const fetchUsers = async () => {
            const response = await pb.collection('users').getFullList();
            setUsers(response);
        };

        fetchAuctions();
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            amount,
            status,
            auctionId,
            userId,
        };

        try {
            await pb.collection('bids').create(data);
            navigate('/bids');
        } catch (error) {
            console.error("Error creating bid:", error);
        }
    };

    return (
        <div className="container">
            <h1>Créer une nouvelle offre</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Montant:
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Statut:
                    <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </label>
                <label>
                    Enchère:
                    <select value={auctionId} onChange={(e) => setAuctionId(e.target.value)} required>
                        <option value="">Sélectionnez une enchère</option>
                        {auctions.map((auction) => (
                            <option key={auction.id} value={auction.id}>
                                {auction.title}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Utilisateur:
                    <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
                        <option value="">Sélectionnez un utilisateur</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </label>
                <button type="submit">Créer</button>
            </form>
        </div>
    );
};

export default BidCreate;
