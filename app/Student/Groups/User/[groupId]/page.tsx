// app/Student/Groups/Partner/[groupId]/page.tsx
'use client';

import { UserView } from '@/components/dashboard/UserView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

export default function UserPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <section className="mb-6">
        <Link href="/Student" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </section>

      <UserView groupId={groupId} />
    </main>
  );
}
