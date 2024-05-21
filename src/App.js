import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import CreateAuction from './pages/CreateAuction';
import Auctions from './pages/Auctions';
import Bids from './pages/Bids';
import EditAuction from './pages/EditAuction';
import EditBid from './pages/EditBid';
import Login from './pages/Login';
import pb from './pocketbase';

const PrivateRoute = ({ element }) => {
  return pb.authStore.isValid ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute element={<Home />} />} />
        <Route path="/create-auction" element={<PrivateRoute element={<CreateAuction />} />} />
        <Route path="/auctions" element={<PrivateRoute element={<Auctions />} />} />
        <Route path="/bids" element={<PrivateRoute element={<Bids />} />} />
        <Route path="/edit-auction/:id" element={<PrivateRoute element={<EditAuction />} />} />
        <Route path="/edit-bid/:id" element={<PrivateRoute element={<EditBid />} />} />
      </Routes>
    </Router>
  );
}

export default App;
