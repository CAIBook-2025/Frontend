// app/Reservations/Check-in/[id]/page.tsx
import { Suspense } from 'react';
import CheckInClientPage from './CheckInClientPage';
import { Loader2 } from 'lucide-react';

// Un componente de carga simple para mostrar mientras el componente cliente se renderiza.
function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );
}

export default async function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  // En Next.js 15, params es una Promise y debe esperarse
  const { id } = await params;
  const reservationId = parseInt(id, 10);

  return (
    // Suspense es requerido por Next.js para poder usar useSearchParams en un componente hijo.
    <Suspense fallback={<LoadingSpinner />}>
      <CheckInClientPage reservationId={reservationId} />
    </Suspense>
  );
}
