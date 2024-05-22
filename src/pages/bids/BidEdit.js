import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';

const EditBid = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBid({ ...bid, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await pb.collection('bids').update(id, bid);
            navigate('/bids');
        } catch (error) {
            console.error("Error updating bid:", error);
        }
    };

    if (!bid) return <div>Loading...</div>;

    return (
        <div>
            <h1>Modifier l'offre</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Montant:
                    <input type="number" name="amount" value={bid.amount} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Status:
                    <select name="status" value={bid.status} onChange={handleChange}>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </label>
                <br />
                <button type="submit">Enregistrer</button>
            </form>
        </div>
    );
};

export default EditBid;
