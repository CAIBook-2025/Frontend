// components/dashboard/PartnerView.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  Star, 
  Loader2,
  LogOut,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Shield
} from 'lucide-react';

// --- Tipos ---
interface GroupDetails {
  id: string;
  name: string;
  description: string;
  reputation: number;
  memberCount: number;
  moderatorCount: number;
  createdAt: string;
  representative: {
    name: string;
    email: string;
  };
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Miembro' | 'Moderador' | 'Representante';
  joinedAt: string;
  reputation: number;
}

interface GroupEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  status: 'Próximo' | 'En Curso' | 'Finalizado';
}

// --- Simulación de API ---
const fakeApiFetchGroupDetails = (groupId: string): Promise<GroupDetails> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: groupId,
        name: 'Club de Programación',
        description: 'Dedicado a enseñar y practicar algoritmos y desarrollo de software. Organizamos talleres semanales, hackathons y sesiones de programación colaborativa para todos los niveles.',
        reputation: 4.7,
        memberCount: 45,
        moderatorCount: 3,
        createdAt: '2024-01-15',
        representative: {
          name: 'Pedro Martínez',
          email: 'pedro.martinez@uc.cl'
        }
      });
    }, 800);
  });
};

const fakeApiFetchMembers = (groupId: string): Promise<Member[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: '0', name: 'Pedro Martínez', email: 'pedro.martinez@uc.cl', role: 'Representante', joinedAt: '2024-01-15', reputation: 5.0 },
        { id: '1', name: 'Ana García', email: 'ana.garcia@uc.cl', role: 'Moderador', joinedAt: '2024-01-20', reputation: 4.8 },
        { id: '2', name: 'Carlos López', email: 'carlos.lopez@uc.cl', role: 'Moderador', joinedAt: '2024-02-10', reputation: 4.6 },
        { id: '3', name: 'María Silva', email: 'maria.silva@uc.cl', role: 'Moderador', joinedAt: '2024-02-15', reputation: 4.9 },
        { id: '4', name: 'Diego Ramírez', email: 'diego.ramirez@uc.cl', role: 'Miembro', joinedAt: '2024-03-01', reputation: 4.2 },
        { id: '5', name: 'Sofía Torres', email: 'sofia.torres@uc.cl', role: 'Miembro', joinedAt: '2024-03-10', reputation: 4.5 },
        { id: '6', name: 'Luis González', email: 'luis.gonzalez@uc.cl', role: 'Miembro', joinedAt: '2024-03-15', reputation: 4.1 },
      ]);
    }, 600);
  });
};

const fakeApiFetchGroupEvents = (groupId: string): Promise<GroupEvent[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          title: 'Taller de Python Avanzado',
          description: 'Aprende conceptos avanzados de Python incluyendo decoradores, generadores y programación asíncrona.',
          date: '2024-09-22T14:00:00',
          location: 'Sala A1 - Biblioteca',
          attendees: 18,
          maxAttendees: 25,
          status: 'Próximo'
        },
        {
          id: '2',
          title: 'Hackathon de Fin de Semana',
          description: 'Evento de 48 horas para desarrollar proyectos innovadores en equipos.',
          date: '2024-09-28T09:00:00',
          location: 'Laboratorio de Computación',
          attendees: 32,
          maxAttendees: 40,
          status: 'Próximo'
        },
        {
          id: '3',
          title: 'Charla: Inteligencia Artificial',
          description: 'Conferencia sobre las últimas tendencias en IA y Machine Learning.',
          date: '2024-09-15T16:00:00',
          location: 'Auditorio Principal',
          attendees: 45,
          maxAttendees: 50,
          status: 'Finalizado'
        }
      ]);
    }, 700);
  });
};

// --- Componente para Estadísticas del Grupo ---
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

// --- Componente para Eventos ---
const EventCard = ({ event }: { event: GroupEvent }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Próximo': return 'bg-blue-100 text-blue-800';
      case 'En Curso': return 'bg-green-100 text-green-800';
      case 'Finalizado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-800">{event.title}</h4>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(event.status)}`}>
          {event.status}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{event.description}</p>
      <div className="space-y-2 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{new Date(event.date).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{event.attendees}/{event.maxAttendees} asistentes</span>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---
interface PartnerViewProps {
  groupId: string;
}

export const PartnerView = ({ groupId }: PartnerViewProps) => {
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingGroup(true);
      setIsLoadingMembers(true);
      setIsLoadingEvents(true);
      
      const [groupData, membersData, eventsData] = await Promise.all([
        fakeApiFetchGroupDetails(groupId),
        fakeApiFetchMembers(groupId),
        fakeApiFetchGroupEvents(groupId)
      ]);
      
      setGroupDetails(groupData);
      setMembers(membersData);
      setEvents(eventsData);
      setIsLoadingGroup(false);
      setIsLoadingMembers(false);
      setIsLoadingEvents(false);
    };
    
    loadData();
  }, [groupId]);

  const handleLeaveGroup = () => {
    // Aquí iría la lógica para abandonar el grupo
    console.log('Abandonando grupo:', groupId);
    setShowLeaveConfirm(false);
    // Redirigir al dashboard después de abandonar
  };

  if (isLoadingGroup) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!groupDetails) {
    return <div>Error al cargar los detalles del grupo</div>;
  }

  return (
    <>
      {/* 1. Header con información del grupo */}
      <section className="mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{groupDetails.name}</h1>
              <p className="text-slate-600 mb-4 max-w-3xl">{groupDetails.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{groupDetails.reputation}/5.0</span>
                </div>
                <span>•</span>
                <span>Creado el {new Date(groupDetails.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">
                  Representante: <span className="font-medium">{groupDetails.representative.name}</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                Miembro
              </span>
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
              >
                <LogOut className="h-4 w-4" />
                Abandonar Grupo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Estadísticas del Grupo */}
      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Users size={20} />} value={groupDetails.memberCount} label="Miembros Totales" />
        <StatCard icon={<Shield size={20} />} value={groupDetails.moderatorCount} label="Moderadores" />
        <StatCard icon={<Star size={20} />} value={groupDetails.reputation} label="Reputación" />
      </section>

      {/* 3. Eventos del Grupo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Eventos del Grupo</h2>
        {isLoadingEvents ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No hay eventos programados por el momento.</p>
          </div>
        )}
      </section>

      {/* 4. Miembros del Grupo */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Miembros del Grupo</h2>
        
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoadingMembers ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {members.map(member => (
                <li key={member.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-slate-600">{member.reputation}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Desde {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        member.role === 'Representante' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : member.role === 'Moderador' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Modal de Confirmación para Abandonar Grupo */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">Confirmar Salida</h3>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas abandonar el grupo &quot;{groupDetails.name}&quot;? 
              Perderás acceso a todos los eventos y contenido del grupo.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleLeaveGroup}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Abandonar Grupo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};