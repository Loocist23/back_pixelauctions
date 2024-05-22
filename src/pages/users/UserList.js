import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import pb from '../../pocketbase';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchUsers = async () => {
      try {
        const usersList = await pb.collection('users').getFullList({ $cancelToken: controller.signal });
        setUsers(usersList);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch cancelled');
        } else {
          console.error("Error fetching users:", error);
        }
      }
    };

    fetchUsers();

    return () => {
      controller.abort();
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await pb.collection('users').delete(id);
      setUsers(users.filter(user => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/users/edit/${id}`);
  };

  return (
    <div>
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
              <td>
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
