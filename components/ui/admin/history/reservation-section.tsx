'use client';

import { Building2, CheckCircle2, UserX, Gauge, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatCard } from '@/components/ui/dashboard/QuickStatCard';
import { ReservationHistoryTable } from '@/components/ui/admin/history/reservation-history-table';
import { ScheduleItem } from '@/types/schedule';
import { useEffect, useState } from 'react';
import { fetchSchedule } from '@/lib/schedule/fetchSchedule';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function ReservationSection() {
  const [data, setData] = useState<ScheduleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get('page')) || 1;
  const take = Number(searchParams.get('take')) || 20;

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const tokenResponse = await getAccessToken();
        const accessToken = resolveAccessToken(tokenResponse);

        if (!accessToken) {
          throw new Error('Access token not available');
        }

        const result = await fetchSchedule(accessToken, { page, take });

        if (result && result.items) {
          setData(result.items);
          setTotal(result.total);
        } else {
          setData([]);
          setTotal(0);
        }
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError('No se pudieron cargar las reservas.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [page, take]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / take);

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <>
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Building2 className="h-4 w-4" />}
            value={total}
            label="Reservas Totales"
            footer="En histórico"
            variant="blue"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            value={data.filter(i => i.attendanceStatus === 'PRESENT').length}
            label="Completadas"
            footer="En esta página"
            variant="yellow"
          />
          <StatCard
            icon={<UserX className="h-4 w-4" />}
            value={data.filter(i => i.attendanceStatus === 'ABSENT' || i.attendanceStatus === 'No Show').length}
            label="No Show"
            footer="En esta página"
            variant="red"
          />
          <StatCard
            icon={<Gauge className="h-4 w-4" />}
            value={0}
            label="Tasa de Uso"
            footer="No disponible"
            variant="yellow"
          />
        </div>
      </section>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando historial...</div>
        ) : (
          <ReservationHistoryTable reservations={data} />
        )}

        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{Math.min((page - 1) * take + 1, total)}</span> a <span className="font-medium">{Math.min(page * take, total)}</span> de <span className="font-medium">{total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                {/* Simple page info logic, can be improved to show page numbers */}
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                  Página {page} de {totalPages || 1}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
