import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pb from '../../pocketbase';
import '../../styles/auctions.css'; // Import the CSS file

const AuctionList = () => {
  document.title = "Gestion des Encheres";
  const [auctions, setAuctions] = useState([]);
  const [users, setUsers] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const options = {
          page,
          perPage: 10,
        };

        if (search) {
          options.filter = `title~"${search}" || description~"${search}"`;
        }

        if (sort) {
          options.sort = sort;
        }

        const response = await pb.collection('auctions').getList(options.page, options.perPage, options);
        setAuctions(response.items);
        setTotalPages(response.totalPages);

        // Fetch associated users
        const userIds = [...new Set(response.items.map(auction => auction.userId))];
        const usersList = await Promise.all(userIds.filter(id => id !== undefined).map(id => {
          return pb.collection('users').getOne(id).catch((error) => {
            console.log("Error fetching user with id:", id, "Error:", error); // Log the error
            return null;
          });
        }));
        const usersMap = usersList.filter(user => user).reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching auctions or users:", error);
      }
    };

    fetchAuctions();
  }, [page, search, sort]);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette enchère ?")) {
      try {
        await pb.collection('auctions').delete(id);
        setAuctions(auctions.filter(auction => auction.id !== id));
      } catch (error) {
        console.error("Error deleting auction:", error);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/auctions/edit/${id}`);
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
        <h1>Liste des enchères</h1>
        <Link to="/auctions/create">Créer une enchère</Link>
        <div>
          <input
              type="text"
              placeholder="Rechercher par titre ou description"
              value={search}
              onChange={handleSearchChange}
          />
          <select value={sort} onChange={handleSortChange}>
            <option value="">Trier par</option>
            <option value="-created">Date de création</option>
            <option value="title">Titre</option>
          </select>
        </div>
        <table>
          <thead>
          <tr>
            <th>Titre</th>
            <th>Description</th>
            <th>Prix de départ</th>
            <th>Status</th>
            <th>Utilisateur</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {auctions.map(auction => (
              <tr key={auction.id}>
                <td>{auction.title}</td>
                <td>{auction.description}</td>
                <td>{auction.startingPrice}</td>
                <td>{auction.status}</td>
                <td>
                  {users[auction.userId] ? (
                      <Link to={`/users/view/${auction.userId}`}>
                        {users[auction.userId].username}
                      </Link>
                  ) : (
                      'Utilisateur inconnu'
                  )}
                </td>
                <td className="actions">
                  <button onClick={() => handleEdit(auction.id)}>Modifier</button>
                  <button onClick={() => handleDelete(auction.id)}>Supprimer</button>
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

export default AuctionList;
