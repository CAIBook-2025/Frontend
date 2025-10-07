import { auth0 } from "@/lib/auth0";

export default async function UserInfo() {
    const session = await auth0.getSession();
    const user = session?.user;

    let userData = null;
    if (user) {
        try {
            console.log('Fetching user data with access token:', session.tokenSet.accessToken);
            const res = await fetch('http://localhost:3003/users/profile', {
                headers: {
                    Authorization: `Bearer ${session.tokenSet.accessToken}`
                }
            })
            userData = await res.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    return (
        <div>
            {user ? (
                <>
                    <p>Welcome, {user.name}!</p>
                    <p>access token: {session.tokenSet.accessToken}</p>
                    <p>Id token: {session.tokenSet.idToken}</p>
                    <a href="/auth/logout">Logout</a>
                </>
            ) : (
                <p>Logged out</p>
            )}
        </div>
    )
}