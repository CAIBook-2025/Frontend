// app/dashboard/Check-in/[id]/page.tsx
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

export default function CheckInPage({ params }: { params: { id: string } }) {
  // Parseamos el ID de la reserva desde los parámetros de la ruta
  const reservationId = parseInt(params.id, 10);

  return (
    // Suspense es requerido por Next.js para poder usar useSearchParams en un componente hijo.
    <Suspense fallback={<LoadingSpinner />}>
      <CheckInClientPage reservationId={reservationId} />
    </Suspense>
  );
}
