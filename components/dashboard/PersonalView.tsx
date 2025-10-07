// components/dashboard/PersonalView.tsx
'use client';

import Link from 'next/link';
import { BookMarked, CalendarDays, ArrowRight, CalendarClock, PartyPopper, ShieldAlert } from 'lucide-react';

// --- Componente para Tarjetas de Acción Principal ---
const ActionCard = ({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) => (
  <Link href={href} className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:border-blue-500 hover:shadow-lg">
    <div className="flex items-start justify-between">
      <div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="mt-1 text-slate-600">{description}</p>
      </div>
      <ArrowRight className="mt-1 h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-500" />
    </div>
  </Link>
);

// --- Componente para Estadísticas Rápidas ---
const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) => (
  <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  </div>
);

export const PersonalView = () => {
  return (
    <>
      {/* 2. Resumen Rápido (Stats) */}
      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<CalendarClock size={20} />} value="2" label="Reservas Activas" />
        <StatCard icon={<PartyPopper size={20} />} value="1" label="Evento Próximo" />
        <StatCard icon={<ShieldAlert size={20} />} value="0" label="Strikes" />
      </section>

      {/* 3. Acciones Principales */}
      <section className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <ActionCard
          href="Student/StudyRoomBooker"
          icon={<BookMarked className="h-6 w-6 text-blue-500" />}
          title="Reservar una Sala"
          description="Busca y asegura un espacio de estudio para ti o tu grupo."
        />
        <ActionCard
          href="/events"
          icon={<CalendarDays className="h-6 w-6 text-blue-500" />}
          title="Explorar Eventos"
          description="Descubre talleres, charlas y actividades organizadas por la comunidad."
        />
      </section>

      {/* 4. Próximos Compromisos */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Próximamente</h2>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <ul className="space-y-4">
            <li className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="font-semibold text-gray-800">Sala de Estudio A1</p>
                <p className="text-sm text-slate-500">Hoy, 16:00 - 17:00</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Confirmada</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="font-semibold text-gray-800">Taller de Python - Club de Programación</p>
                <p className="text-sm text-slate-500">Mañana, 14:00</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">Inscrito</span>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Sala Grupal C1</p>
                <p className="text-sm text-slate-500">Viernes, 10:00 - 12:00</p>
              </div>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">Pendiente</span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
};