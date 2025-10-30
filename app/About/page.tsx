// app/about/page.tsx

import Image from 'next/image';
import type { Metadata } from 'next';

// Metadata específica para esta página
export const metadata: Metadata = {
  title: 'Sobre Nosotros - CAIBook',
  description: 'Conoce al equipo de Mapocho Web Services detrás de CAIBook.',
};

export default function AboutPage() {
  return (
    <main>
      <section className="container mx-auto px-6 py-16 md:py-24">
        {/* Título de la sección */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-dark">Nuestro Equipo</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
            Somos <span className="font-bold text-brand-primary">Mapocho Web Services</span>, un grupo de estudiantes de
            Ingeniería UC apasionados por la tecnología y la eficiencia.
          </p>
        </div>

        {/* Contenedor Flex para el layout de dos columnas */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Columna de la imagen */}
          <div className="w-full md:w-1/2">
            <Image
              src="/Team.png" // TODO: Crea esta imagen en /public
              alt="Foto del equipo Mapocho Web Services"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl object-cover w-full"
            />
          </div>

          {/* Columna del texto */}
          <div className="w-full md:w-1/2 space-y-4 text-slate-700 text-lg">
            <h2 className="text-2xl font-bold text-brand-dark">Nuestra Misión</h2>
            <p className="text-justify">
              Como estudiantes, hemos vivido en carne propia los procesos tediosos y burocráticos que a menudo
              ralentizan la vida universitaria. La reserva de salas de estudio era uno de ellos: un sistema manual,
              lento y lleno de incertidumbre.
            </p>
            <p className="text-justify">
              Nos propusimos cambiar eso. <span className="font-semibold">CAIBook</span> nació de nuestro deseo de
              aplicar lo que aprendemos en las aulas para resolver problemas reales de nuestra comunidad. Creemos
              firmemente que la tecnología debe servir para simplificar, agilizar y mejorar la experiencia de todos.
            </p>
            <p className="text-justify">
              Este proyecto es más que una tarea académica; es nuestra contribución para optimizar un proceso que por
              mucho tiempo ha sido una lata, devolviéndole a los estudiantes algo invaluable: su tiempo.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
