import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage(response.data);
      } catch (error) {
        setMessage('Error fetching profile');
      }
    };
    fetchData();
  }, []);

  return <div>{message}</div>;
};

export default Profile;
