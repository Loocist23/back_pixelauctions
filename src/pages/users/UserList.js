import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api'; // Utilisez api au lieu de pb directement
import '../../styles/users.css'; // Import the CSS file

const UserList = () => {
  document.title = "Gestion Des Utilisateurs";
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users/all'); // Utilisez la route API Express
        setUsers(data.items);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

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

  return (
      <div className="container">
        <h1>Liste des utilisateurs</h1>
        <Link to="/users/create">Créer un utilisateur</Link>
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
      </div>
  );
};

export default UserList;
