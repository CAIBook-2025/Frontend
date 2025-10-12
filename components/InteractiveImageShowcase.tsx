// components/InteractiveImageShowcase.tsx
'use client'; // Necesitamos esto para usar estado y manejar eventos del cliente

import Image from 'next/image';

interface ImageShowcaseProps {
  beforeImageSrc: string;
  afterImageSrc: string;
  beforeTitle: string;
  beforeText: string;
  afterTitle: string;
  afterText: string;
}

export const InteractiveImageShowcase = ({
  beforeImageSrc,
  afterImageSrc,
  beforeTitle,
  beforeText,
  afterTitle,
  afterText,
}: ImageShowcaseProps) => {
  return (
    // 'group' es la clave de Tailwind. Permite a los elementos hijos reaccionar
    // al estado de hover de este contenedor padre.
    <div className="relative group aspect-video w-full cursor-pointer overflow-hidden rounded-xl shadow-2xl ring-1 ring-slate-200">
      {/* IMAGEN "ANTES" (por defecto) */}
      <Image
        src={beforeImageSrc}
        alt="Estudiante frustrado por el proceso manual de reserva"
        fill={true}
        className="object-cover transition-opacity duration-700 ease-in-out group-hover:opacity-0"
      />

      <Image
        src={afterImageSrc}
        alt="Estudiante feliz reservando una sala desde su computador"
        fill={true}
        className="object-cover opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
      />

      {/* OVERLAY DE TEXTO */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6 md:p-8 flex flex-col justify-end">
        {/* TEXTO "ANTES" (por defecto) */}
        <div className="text-white transition-opacity duration-700 ease-in-out group-hover:opacity-0">
          <h3 className="text-xl md:text-2xl font-bold">{beforeTitle}</h3>
          <p className="mt-1 text-sm md:text-base opacity-90">{beforeText}</p>
        </div>
        {/* TEXTO "DESPUÉS" (aparece al hacer hover) */}
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 pr-6 md:pr-8 text-white opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100">
          <h3 className="text-xl md:text-2xl font-bold">{afterTitle}</h3>
          <p className="mt-1 text-sm md:text-base opacity-90">{afterText}</p>
        </div>
      </div>
    </div>
  );
};