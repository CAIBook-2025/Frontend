// app/Reservations/Check-out/[id]/page.tsx
import { Suspense } from 'react';
import CheckOutClientPage from './CheckOutClientPage';
import { Loader2 } from 'lucide-react';

function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  );
}

export default function CheckOutPage({ params }: { params: { id: string } }) {
  const reservationId = parseInt(params.id, 10);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckOutClientPage reservationId={reservationId} />
    </Suspense>
  );
}
