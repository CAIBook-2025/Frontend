// app/my-reservations/page.tsx
'use client'; // ¡IMPORTANTE! La página ahora necesita estado, por lo que debe ser un Componente de Cliente.

import { useState } from 'react';
import { Info } from 'lucide-react';

// 1. Importamos los componentes que vamos a usar
import { MyReservationsView } from "@/components/dashboard/MyReservationView"; // Vista de reservas activas
import { HistoricalReservationsView } from '@/components/dashboard/HistoricalReservationView';
import { ViewToggle } from '@/components/dashboard/ViewToggle'; // El selector de vista
import { InfoModal } from '@/components/common/InfoModal'; // El modal de información

export default function MyReservationsPage() {
  // 2. Estado para controlar qué vista está activa ('active' o 'historical')
  const [currentView, setCurrentView] = useState<'active' | 'historical'>('active');
  
  // 3. Estado para controlar el modal de "Cómo hacer Check-In", ya que el botón ahora vive aquí.
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  return (
    <>
      <main className="container mx-auto px-6 py-8">
        {/* 4. Encabezado principal de la página */}
        <div className="mb-8 border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
  <div className="flex items-center gap-3">
    <h1 className="text-4xl font-bold text-gray-900">Mis Reservas</h1>
    {/* Toggle al lado del título */}
    <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
  </div>
</div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-slate-600">
              {/* El texto descriptivo cambia según la vista seleccionada */}
              {currentView === 'active' 
                ? 'Aquí puedes gestionar todas tus próximas reservas.' 
                : 'Consulta el historial de todas tus reservas pasadas.'
              }
            </p>
            {/* El botón de Info solo se muestra en la vista de reservas activas */}
            {currentView === 'active' && (
              <button 
                onClick={() => setIsInfoModalOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Info size={16} />
                ¿Cómo hacer Check-In?
              </button>
            )}
          </div>
        </div>
        
        {/* 5. Renderizado condicional: mostramos un componente u otro basado en el estado */}
        {currentView === 'active' && <MyReservationsView />}
        {currentView === 'historical' && <HistoricalReservationsView />}
      </main>

      {/* 6. El InfoModal ahora es controlado directamente por esta página */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Pasos para hacer Check-In"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3"><div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">1</div><p>Dirígete a la sala que tienes reservada y busca el <strong>código QR</strong> que se encuentra en la entrada.</p></div>
          <div className="flex items-start gap-3"><div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">2</div><p>Escanea el código con tu celular. Serás redirigido a la página de check-in de la sala, donde se validará tu reserva activa.</p></div>
          <div className="flex items-start gap-3"><div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">3</div><p>Haz clic en el botón <strong>Confirmar Asistencia</strong> y ¡listo! Tu reserva quedará confirmada y podrás usar la sala.</p></div>
        </div>
      </InfoModal>
    </>
  );
}