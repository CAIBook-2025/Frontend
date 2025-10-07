// app/Student/Groups/Representative/[groupId]/page.tsx
'use client';

import { RepresentativeView } from '@/components/dashboard/RepresentativeView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface RepresentativePageProps {
  params: {
    groupId: string;
  };
}

export default function RepresentativePage({ params }: RepresentativePageProps) {
  const { groupId } = params;

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb/Navegación de regreso */}
      <section className="mb-6">
        <Link 
          href="/Student" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </section>

      {/* Componente Principal */}
      <RepresentativeView groupId={groupId} />
    </main>
  );
}