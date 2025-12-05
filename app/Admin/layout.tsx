import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { isAdmin } from '@/lib/user/isAdmin';

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/');
  }

  const accessToken = session.tokenSet?.accessToken ?? null;

  if (!accessToken) {
    redirect('/');
  }

  const hasAdminAccess = await isAdmin(accessToken);

  if (!hasAdminAccess) {
    redirect('/');
  }

  return <>{children}</>;
}
