// app/page.tsx

import { Zap, Eye, Users, CalendarCheck } from 'lucide-react';
import { InteractiveImageShowcase } from '@/components/InteractiveImageShowcase'; // <-- 1. IMPORTA EL NUEVO COMPONENTE
import Link from 'next/link'; // Importamos el componente Link

// --- Componente de Tarjeta de Característica ---
// Para no repetir código, creamos un pequeño componente para las características.
const FeatureCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-primary/10 mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-brand-dark mb-2">{title}</h3>
    <p className="text-slate-600">{children}</p>
  </div>
);

// --- Componente Principal de la Landing Page ---
export default function LandingPage() {
  return (
    <div className="bg-brand-light text-brand-dark">
      {/* 1. Barra de Navegación */}

      <main>
        {/* 2. Sección Hero: El primer impacto */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark leading-tight mb-4">
              La gestión de espacios de Ingeniería, <span className="text-brand-primary">simplificada</span>.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              CAIBook centraliza la reserva de salas de estudio, la coordinación de eventos y la gestión de grupos
              estudiantiles en una sola plataforma ágil y moderna.
            </p>
            <Link
              href="/dashboard" // TODO: Apuntar al dashboard si el usuario está logueado, o al login
              className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-colors duration-300 inline-block"
            >
              Acceder a la Plataforma
            </Link>
          </div>
        </section>

        <div className="container mx-auto px-6 -mt-16 mb-16 md:mb-0">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <InteractiveImageShowcase
              beforeImageSrc="/ProcesoManual.png"
              afterImageSrc="/LandingImage.png"
              beforeTitle="El Proceso Manual"
              beforeText="Viajes, filas y la incertidumbre de encontrar una sala disponible."
              afterTitle="La Solución Digital"
              afterText="Reserva desde donde estés, en segundos. Tu tiempo es valioso."
            />
          </div>
        </div>

        {/* 3. Sección de Características Clave (Beneficios) */}
        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Todo lo que necesitas para organizarte</h2>
              <p className="text-lg text-slate-600 mt-2">
                Transformamos un proceso manual en una experiencia digital eficiente.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard icon={<Zap className="h-6 w-6 text-brand-primary" />} title="Agilidad Inmediata">
                Olvida las filas y los correos. Reserva salas de estudio y espacios para eventos en segundos.
              </FeatureCard>
              <FeatureCard icon={<Eye className="h-6 w-6 text-brand-primary" />} title="Total Transparencia">
                Visualiza la disponibilidad en tiempo real, gestiona tus reservas y conoce el estado de tus solicitudes.
              </FeatureCard>
              <FeatureCard icon={<Users className="h-6 w-6 text-brand-primary" />} title="Comunidad Conectada">
                Crea y gestiona grupos estudiantiles, organiza actividades e inscríbete a eventos de tu interés.
              </FeatureCard>
              <FeatureCard icon={<CalendarCheck className="h-6 w-6 text-brand-primary" />} title="Eficiencia y Orden">
                Un calendario centralizado para todas las actividades. Optimiza el uso de los recursos de la facultad.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* 4. Sección "Cómo funciona" */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Fácil de empezar</h2>
              <p className="text-lg text-slate-600 mt-2">En solo tres pasos, estás listo para colaborar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-brand-primary text-white text-2xl font-bold h-16 w-16 rounded-full flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-2">Encuentra tu Espacio</h3>
                <p className="text-slate-600">
                  Navega por las salas y espacios disponibles, filtrando por capacidad, equipamiento y horario.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-brand-primary text-white text-2xl font-bold h-16 w-16 rounded-full flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-2">Reserva al Instante</h3>
                <p className="text-slate-600">
                  Selecciona tu bloque horario y confirma. Recibirás una notificación y un recordatorio.
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-brand-primary text-white text-2xl font-bold h-16 w-16 rounded-full flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-2">Colabora y Participa</h3>
                <p className="text-slate-600">
                  Haz check-in con un código QR al llegar y aprovecha al máximo los recursos de la comunidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Sección de Llamada a la Acción (CTA) Final */}
        <section className="bg-brand-secondary">
          <div className="container mx-auto px-6 py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">¿Listo para optimizar tu tiempo?</h2>
            <p className="text-lg text-slate-300 mt-2 mb-8 max-w-2xl mx-auto">
              Únete a la nueva era de gestión de espacios en Ingeniería UC.
            </p>
            <Link
              href="/login" // CORREGIDO: La ruta debe ser en minúsculas para coincidir con la carpeta
              className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-colors duration-300 inline-block"
            >
              Comenzar ahora
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
