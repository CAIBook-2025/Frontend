// components/dashboard/GroupsView.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, PlusCircle, ArrowRight, Loader2 } from 'lucide-react';

// --- Tipos y Simulación de API ---
interface Group {
  id: string;
  name: string;
  description: string;
  role: 'Admin' | 'Socio';
  memberCount: number;
}

const fakeApiFetchGroups = (): Promise<Group[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: '1', name: 'Club de Programación', description: 'Dedicado a enseñar y practicar algoritmos y desarrollo de software.', role: 'Admin', memberCount: 45 },
        { id: '2', name: 'Comité de Sustentabilidad', description: 'Promovemos prácticas sustentables en el campus y organizamos eventos verdes.', role: 'Socio', memberCount: 23 },
        { id: '3', name: 'Club de Ajedrez UC', description: 'Para todos los amantes del ajedrez, desde principiantes hasta expertos.', role: 'Socio', memberCount: 31 },
      ]);
    }, 1000); // Simula 1s de carga
  });
};

export const GroupsView = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      setIsLoading(true);
      const fetchedGroups = await fakeApiFetchGroups();
      setGroups(fetchedGroups);
      setIsLoading(false);
    };
    loadGroups();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mis Grupos</h2>
        <Link href="Student/Groups/Form" className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
          <PlusCircle size={16} /> Crear Grupo
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-200">
          {groups.map(group => (
            <li key={group.id}>
              <Link href={`/groups/${group.id}`} className="group block p-6 transition-colors hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">{group.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${group.role === 'Admin' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
                        {group.role}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 max-w-2xl">{group.description}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <Users size={14} />
                      <span>{group.memberCount} miembros</span>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};