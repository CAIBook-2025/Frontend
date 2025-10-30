'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { useEffect, useState } from 'react';
import { getAccessToken } from '@auth0/nextjs-auth0';

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const [userData, setUserData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    async function fetchAccessToken() {
      if (user) {
        try {
          const accessToken = await getAccessToken();
          setAccessToken(accessToken);
          console.log('Access Token:', accessToken);
        } catch (error) {
          console.error('Error fetching access token:', error);
        }
      }
    }

    fetchAccessToken();
  }, [user]);

  useEffect(() => {
    async function fetchUserData() {
      if (accessToken) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (res.ok) {
            const userData = await res.json();
            setUserData(userData);
            console.log('User Data:', userData);
          } else {
            console.error('Backend error:', res.status, res.statusText);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    }

    fetchUserData();
  }, [accessToken]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      {userData ? (
        <>
          <p>
            Welcome, {userData.first_name} {userData.last_name}!
          </p>
          <p>Your email: {userData.email}</p>
          <p>Your career: {userData.career}</p>
          <p>Your phone: {userData.phone}</p>
          <p>Your student number: {userData.student_number}</p>
          <p>Your role: {userData.role}</p>
          <p>Auth0 ID: {userData.auth0_id}</p>
          <a href="/auth/logout">Logout</a>
        </>
      ) : (
        <p>Logged out</p>
      )}
    </div>
  );
}
