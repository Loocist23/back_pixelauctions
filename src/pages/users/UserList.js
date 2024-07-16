import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api'; // Utilisez api au lieu de pb directement pour les appels API
import '../../styles/users.css'; // Importer le fichier CSS pour les styles

const UserList = () => {
  // Mise à jour du titre du document
  document.title = "Gestion Des Utilisateurs";

  // Déclaration des états pour stocker les utilisateurs, la page actuelle, le nombre total de pages, la recherche, et le tri
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const navigate = useNavigate();

  // Utilisation du hook useEffect pour récupérer les utilisateurs à chaque changement de page, de recherche ou de tri
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Récupérer les utilisateurs paginés avec les paramètres de recherche et de tri
        const { data } = await api.get(`/users/paginated?page=${page}&search=${search}&sort=${sort}`);
        setUsers(data.items);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [page, search, sort]);

  // Fonction pour supprimer un utilisateur
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await api.delete(`/users/${id}`);
        // Mise à jour de l'état pour enlever l'utilisateur supprimé
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error.response ? error.response.data : 'No response');
      }
    }
  };

  // Fonction pour naviguer vers la page de modification d'un utilisateur
  const handleEdit = (id) => {
    navigate(`/users/edit/${id}`);
  };

  // Fonction pour générer 20 utilisateurs aléatoires
  const handleGenerateUsers = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir générer 20 utilisateurs aléatoires ?")) {
      try {
        await api.post('/users/generate-random-users');
        // Réinitialiser à la première page après génération
        setPage(1);
        const { data } = await api.get(`/users/paginated?page=1`);
        setUsers(data.items);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error generating users:", error);
      }
    }
  };

  // Fonction pour envoyer une notification à un utilisateur spécifique
  const handleSendNotification = async (playerId) => {
    const message = window.prompt("Entrez le message de la notification :", "Vous avez une nouvelle offre !");
    if (message) {
      try {
        const response = await api.post('/users/send-notification', { playerId, message });
        if (response.data.success) {
          alert('Notification envoyée avec succès');
        } else {
          alert(`Erreur lors de l'envoi de la notification : ${response.data.error}`);
        }
      } catch (error) {
        console.error("Error sending notification:", error);
        alert('Erreur lors de l\'envoi de la notification');
      }
    }
  };

  // Fonction pour aller à la page suivante
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  // Fonction pour aller à la page précédente
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Fonction pour gérer les changements dans le champ de recherche
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Fonction pour gérer les changements dans le champ de tri
  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  return (
      <div className="container">
        <h1>Liste des utilisateurs</h1>
        {/* Lien pour créer un nouvel utilisateur */}
        <Link to="/users/create">Créer un utilisateur</Link>
        {/* Bouton pour générer des utilisateurs aléatoires */}
        <button onClick={handleGenerateUsers}>Générer 20 utilisateurs aléatoires</button>
        <div>
          {/* Champ de recherche */}
          <input
              type="text"
              placeholder="Rechercher par nom ou email"
              value={search}
              onChange={handleSearchChange}
          />
          {/* Champ de tri */}
          <select value={sort} onChange={handleSortChange}>
            <option value="">Trier par</option>
            <option value="created">Date de création</option>
            <option value="username">Nom d'utilisateur</option>
            <option value="email">Email</option>
          </select>
        </div>
        {/* Tableau pour afficher la liste des utilisateurs */}
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
                <td>
                  <Link to={`/users/view/${user.id}`}>{user.username}</Link> {/* Lien vers la vue de l'utilisateur */}
                </td>
                <td>{user.role}</td>
                <td>{new Date(user.birthdate).toLocaleDateString()}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(user.id)}>Modifier</button>
                  <button onClick={() => handleDelete(user.id)}>Supprimer</button>
                  <button onClick={() => handleSendNotification(user.playerId)}>Envoyer Notification</button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>
        {/* Pagination */}
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
