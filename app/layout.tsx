import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link'; // Importamos el componente Link
import { School } from 'lucide-react';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { auth0 } from '@/lib/auth0';
import { UserProvider } from '@/contexts/AuthProvider';
import { isAdmin } from '@/lib/user/isAdmin';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CAIBook - Gestión de Espacios',
  description: 'Plataforma para la reserva de salas y eventos de Ingeniería UC.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();
  const user = session?.user;
  const accessToken = session?.tokenSet?.accessToken ?? null;
  const hasAdminAccess = await isAdmin(accessToken);
  const isAuthenticated = Boolean(user);

  const accountAction = isAuthenticated ? (
    <Link
      href="/Profile"
      className="bg-slate-600 text-white font-bold py-2 px-6 rounded-full hover:bg-slate-800 transition-colors duration-300"
    >
      Mi cuenta
    </Link>
  ) : (
    <Link
      href="/auth/login?returnTo=/Callback-check"
      className="bg-slate-600 text-white font-bold py-2 px-6 rounded-full hover:bg-slate-800 transition-colors duration-300"
    >
      Iniciar Sesión
    </Link>
  );

  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="bg-brand-light text-brand-dark flex flex-col min-h-screen">
          {/* Barra de navegacion principal */}
          <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2">
                <School className="h-8 w-8 text-brand-primary" />
                <span className="text-2xl font-bold text-brand-dark">CAIBook</span>
              </Link>
              <div className="flex items-center gap-6 md:gap-8">
                <Link
                  href="/#features"
                  className="hidden md:block font-medium text-slate-600 hover:text-brand-primary transition-colors duration-300"
                >
                  Características
                </Link>
                <Link
                  href="/About"
                  className="hidden md:block font-medium text-slate-600 hover:text-brand-primary transition-colors duration-300"
                >
                  Sobre Nosotros
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/Student"
                    className="hidden md:block font-medium text-slate-600 hover:text-brand-primary transition-colors duration-300"
                  >
                    Dashboard
                  </Link>
                )}
                {accountAction}
                {hasAdminAccess && (
                  <Link
                    href="/Admin"
                    className="hidden md:block font-medium text-slate-600 hover:text-brand-primary transition-colors duration-300"
                  >
                    Admin
                  </Link>
                )}
              </div>
            </nav>
          </header>

          {/* Contenido dinamico por pagina */}
          <main className="flex-grow">{children}</main>

          {/* Footer global */}
          <footer className="bg-brand-dark text-white">
            <div className="container mx-auto px-6 py-8 text-center text-slate-400">
              <p>&copy; {new Date().getFullYear()} Mapocho Web Services. Un proyecto para IIC3143.</p>
              <p className="text-sm mt-2">
                Desarrollado para la comunidad de la Escuela de Ingeniería de la Pontificia Universidad Católica de Chile.
              </p>
            </div>
          </footer>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
