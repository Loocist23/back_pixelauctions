import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/bids.css'; // Import the CSS file

const BidList = () => {
  document.title = "Gestion des Offres";
  const [bids, setBids] = useState([]);
  const [users, setUsers] = useState({});
  const [auctions, setAuctions] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const options = {
          page,
          perPage: 10,
        };

        if (search) {
          options.filter = `username~"${search}" || auction.title~"${search}"`;
        }

        if (sort) {
          options.sort = sort;
        }

        const response = await pb.collection('bids').getList(options.page, options.perPage, options);
        setBids(response.items);
        setTotalPages(response.totalPages);

        // Fetch associated users and auctions
        const userIds = [...new Set(response.items.map(bid => bid.userId))];
        const auctionIds = [...new Set(response.items.map(bid => bid.auctionId))];

        const usersList = await Promise.all(userIds.filter(id => id !== undefined).map(id => {
          return pb.collection('users').getOne(id).catch((error) => {
            console.log("Error fetching user with id:", id, "Error:", error); // Log the error
            return null;
          });
        }));

        const auctionsList = await Promise.all(auctionIds.filter(id => id !== undefined).map(id => {
          return pb.collection('auctions').getOne(id).catch((error) => {
            console.log("Error fetching auction with id:", id, "Error:", error); // Log the error
            return null;
          });
        }));

        const usersMap = usersList.filter(user => user).reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});

        const auctionsMap = auctionsList.filter(auction => auction).reduce((acc, auction) => {
          acc[auction.id] = auction;
          return acc;
        }, {});

        setUsers(usersMap);
        setAuctions(auctionsMap);
      } catch (error) {
        console.error("Error fetching bids, users, or auctions:", error);
      }
    };

    fetchBids();
  }, [page, search, sort]);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await pb.collection('bids').delete(id);
        setBids(bids.filter(bid => bid.id !== id));
      } catch (error) {
        console.error("Error deleting bid:", error);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/bids/edit/${id}`);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
      <div className="container">
        <h1>Liste des offres</h1>
        <div>
          <input
              type="text"
              placeholder="Rechercher par utilisateur ou enchère"
              value={search}
              onChange={handleSearchChange}
          />
          <select value={sort} onChange={handleSortChange}>
            <option value="">Trier par</option>
            <option value="-created">Date de création</option>
            <option value="amount">Montant</option>
          </select>
        </div>
        <table>
          <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Enchère</th>
            <th>Montant</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {bids.map(bid => (
              <tr key={bid.id}>
                <td>
                  <Link to={`/users/view/${bid.userId}`}>
                    {users[bid.userId]?.username || 'Inconnu'}
                  </Link>
                </td>
                <td>
                  <Link to={`/auctions/${bid.auctionId}`}>
                    {auctions[bid.auctionId]?.title || 'Inconnu'}
                  </Link>
                </td>
                <td>{bid.amount}</td>
                <td>{bid.status}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(bid.id)}>Modifier</button>
                  <button onClick={() => handleDelete(bid.id)}>Supprimer</button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
        {totalPages > 1 && (
            <div className="pagination">
              <button onClick={handlePreviousPage} disabled={page === 1}>{'<<<'}</button>
              <span>Page {page} / {totalPages}</span>
              <button onClick={handleNextPage} disabled={page === totalPages}>{'>>>'}</button>
            </div>
        )}
      </div>
  );
};

export default BidList;
