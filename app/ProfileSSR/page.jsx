import { auth0 } from '@/lib/auth0';
import { fetchUserProfile } from '@/lib/user/fetchUserProfile';

export default async function UserInfo() {
  const session = await auth0.getSession();
  const user = session?.user;
  const accessToken = session?.tokenSet?.accessToken;

  const userData = accessToken ? await fetchUserProfile(accessToken) : null;

  return (
    <div>
      {user ? (
        userData ? (
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
          <p>Unable to load profile</p>
        )
      ) : (
        <p>Logged out</p>
      )}
    </div>
  );
}
