import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/authService';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getProfile();
      setProfile(data);
    })();
  }, []);

  if (!profile) return <div>Loading...</div>;
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
    </div>
  );
}
