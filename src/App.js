import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Home,
  CreateAuction,
  Auctions,
  EditAuction,
  AuctionView,
  CreateBid,
  Bids,
  EditBid,
  BidView,
  Login,
  UserList,
  UserEdit,
  UserCreate,
  UserView
} from './pages';
import Layout from './components/Layout';
import pb from './pocketbase';

const PrivateRoute = ({ element }) => {
  return pb.authStore.isValid ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute element={<Home />} />} />
          <Route path="/create-auction" element={<PrivateRoute element={<CreateAuction />} />} />
          <Route path="/auctions" element={<PrivateRoute element={<Auctions />} />} />
          <Route path="/auctions/edit/:id" element={<PrivateRoute element={<EditAuction />} />} />
          <Route path="/auctions/:id" element={<PrivateRoute element={<AuctionView />} />} />
          <Route path="/create-bid" element={<PrivateRoute element={<CreateBid />} />} />
          <Route path="/bids" element={<PrivateRoute element={<Bids />} />} />
          <Route path="/bids/edit/:id" element={<PrivateRoute element={<EditBid />} />} />
          <Route path="/bids/:id" element={<PrivateRoute element={<BidView />} />} />
          <Route path="/users" element={<PrivateRoute element={<UserList />} />} />
          <Route path="/users/create" element={<PrivateRoute element={<UserCreate />} />} />
          <Route path="/users/edit/:id" element={<PrivateRoute element={<UserEdit />} />} />
          <Route path="/users/view/:id" element={<PrivateRoute element={<UserView />} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
