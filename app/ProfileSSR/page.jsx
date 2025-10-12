import { auth0 } from "@/lib/auth0";

export default async function UserInfo() {
    const session = await auth0.getSession();
    const user = session?.user;

    let userData = null;
    if (user) {
        try {
            console.log('Fetching user data with access token:', session.tokenSet.accessToken);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
                headers: {
                    Authorization: `Bearer ${session.tokenSet.accessToken}`
                }
            })
            userData = await res.json();
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    console.log('User data:', userData);

    return (
        <div>
            {user ? (
                <>
                    <p>Welcome, {userData.first_name} {userData.last_name}!</p>
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
    )
}