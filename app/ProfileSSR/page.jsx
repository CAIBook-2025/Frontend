import { auth0 } from "@/lib/auth0";

export default async function UserInfo() {
    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <div>
            {user ? (
                <>
                    <p>Welcome, {user.name}!</p>
                    <a href="/auth/logout">Logout</a>
                </>
            ) : (
                <p>Logged out</p>
            )}
        </div>
    )
}