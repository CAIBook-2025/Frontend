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

export default async function CheckOutPage({ params }: { params: Promise<{ id: string }> }) {
  // En Next.js 15, params es una Promise y debe esperarse
  const { id } = await params;
  const reservationId = parseInt(id, 10);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CheckOutClientPage reservationId={reservationId} />
    </Suspense>
  );
}
