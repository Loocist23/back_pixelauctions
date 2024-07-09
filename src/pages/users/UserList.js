import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api'; // Utilisez api au lieu de pb directement
import '../../styles/users.css'; // Import the CSS file

const UserList = () => {
  document.title = "Gestion Des Utilisateurs";
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get(`/users/paginated?page=${page}`); // Utilisez la route API paginée
        setUsers(data.items);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [page]);

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error.response ? error.response.data : 'No response');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/users/edit/${id}`);
  };

  const handleGenerateUsers = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir générer 20 utilisateurs aléatoires ?")) {
      try {
        await api.post('/users/generate-random-users');
        setPage(1); // Réinitialiser à la première page
        const { data } = await api.get(`/users/paginated?page=1`);
        setUsers(data.items);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error generating users:", error);
      }
    }
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
        <h1>Liste des utilisateurs</h1>
        <Link to="/users/create">Créer un utilisateur</Link>
        <button onClick={handleGenerateUsers}>Générer 20 utilisateurs aléatoires</button>
        <table>
          <thead>
          <tr>
            <th>Email</th>
            <th>Nom d'utilisateur</th>
            <th>Rôle</th>
            <th>Date de naissance</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{new Date(user.birthdate).toLocaleDateString()}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(user.id)}>Modifier</button>
                  <button onClick={() => handleDelete(user.id)}>Supprimer</button>
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

export default UserList;
