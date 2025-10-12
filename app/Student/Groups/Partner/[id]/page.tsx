// app/Student/Groups/Partner/[groupId]/page.tsx
'use client';

import { PartnerView } from '@/components/dashboard/PartnerView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PartnerPageProps {
  params: {
    groupId: string;
  };
}

export default function PartnerPage({ params }: PartnerPageProps) {
  const { groupId } = params;

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <section className="mb-6">
        <Link href="/Student" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </section>

      <PartnerView groupId={groupId} />
    </main>
  );
}
