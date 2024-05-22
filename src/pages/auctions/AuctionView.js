import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import pb from '../../pocketbase';

const AuctionView = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const auctionData = await pb.collection('auctions').getOne(id);
        setAuction(auctionData);
      } catch (error) {
        console.error("Error fetching auction:", error);
      }
    };

    fetchAuction();
  }, [id]);

  if (!auction) return <div>Loading...</div>;

  return (
    <div>
      <h1>{auction.title}</h1>
      <p>Description: {auction.description}</p>
      <p>Prix de départ: {auction.startingPrice}</p>
      <p>Status: {auction.status}</p>
    </div>
  );
};

export default AuctionView;
