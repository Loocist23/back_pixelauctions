import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import pb from '../../pocketbase';

const UserView = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await pb.collection('users').getOne(id);
      setUser(user);
    };

    fetchUser();
  }, [id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>User Details</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
};

export default UserView;
