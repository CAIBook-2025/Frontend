import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import { isAdmin } from '@/lib/user/isAdmin';

type AdminLayoutProps = {
  children: ReactNode;
};

const isMockMode = process.env.NEXT_PUBLIC_API_MODE === 'mock';

export default async function AdminLayout({ children }: AdminLayoutProps) {
  if (isMockMode) {
    return <>{children}</>;
  }

  const session = await auth0.getSession();

  if (!session) {
    redirect('/Student');
  }

  const accessToken = session.tokenSet?.accessToken ?? null;

  if (!accessToken) {
    redirect('/Student');
  }

  const hasAdminAccess = await isAdmin(accessToken);

  if (!hasAdminAccess) {
    redirect('/Student');
  }

  return <>{children}</>;
}
