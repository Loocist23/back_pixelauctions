import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';

const BidCreate = () => {
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('pending');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            amount,
            status,
        };

        try {
            await pb.collection('bids').create(data);
            navigate('/bids');
        } catch (error) {
            console.error("Error creating bid:", error);
        }
    };

    return (
        <div>
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
                <br />
                <label>
                    Status:
                    <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </label>
                <br />
                <button type="submit">Créer</button>
            </form>
        </div>
    );
};

export default BidCreate;
