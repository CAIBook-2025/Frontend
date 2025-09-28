'use client'

import { useUser } from '@auth0/nextjs-auth0';

export default function ProfilePage() {
    const { user, error, isLoading } = useUser();

    if (isLoading) return <div>Loading...</div>;
    // if (error) return <div>{error.message}</div>;

    return (
        <div>
            {user ? (
                <>
                    <p>Welcome, {user.name}!</p>
                    <p>Email: {user.email}</p>
                    <a href="/auth/logout">Logout</a>
                </>
            ) : (
                <p>Logged out</p>
            )}
        </div>
    )
}