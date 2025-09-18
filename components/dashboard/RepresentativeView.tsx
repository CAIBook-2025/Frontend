// components/dashboard/RepresentativeView.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Users, 
  Crown, 
  Shield, 
  CalendarPlus, 
  Trash2, 
  ArrowRight, 
  Star, 
  Loader2,
  Edit3,
  UserCheck,
  AlertTriangle
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
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Miembro' | 'Moderador';
  joinedAt: string;
  reputation: number;
}

// --- Simulación de API ---
const fakeApiFetchGroupDetails = (groupId: string): Promise<GroupDetails> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: groupId,
        name: 'Club de Programación',
        description: 'Dedicado a enseñar y practicar algoritmos y desarrollo de software.',
        reputation: 4.7,
        memberCount: 45,
        moderatorCount: 3,
        createdAt: '2024-01-15'
      });
    }, 800);
  });
};

const fakeApiFetchMembers = (groupId: string): Promise<Member[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: '1', name: 'Ana García', email: 'ana.garcia@uc.cl', role: 'Moderador', joinedAt: '2024-01-20', reputation: 4.8 },
        { id: '2', name: 'Carlos López', email: 'carlos.lopez@uc.cl', role: 'Moderador', joinedAt: '2024-02-10', reputation: 4.6 },
        { id: '3', name: 'María Silva', email: 'maria.silva@uc.cl', role: 'Moderador', joinedAt: '2024-02-15', reputation: 4.9 },
        { id: '4', name: 'Diego Ramírez', email: 'diego.ramirez@uc.cl', role: 'Miembro', joinedAt: '2024-03-01', reputation: 4.2 },
        { id: '5', name: 'Sofía Torres', email: 'sofia.torres@uc.cl', role: 'Miembro', joinedAt: '2024-03-10', reputation: 4.5 },
      ]);
    }, 600);
  });
};

// --- Componente para Tarjetas de Acción Principal ---
const ActionCard = ({ 
  href, 
  icon, 
  title, 
  description, 
  variant = 'default',
  onClick 
}: { 
  href?: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  variant?: 'default' | 'danger';
  onClick?: () => void;
}) => {
  const baseClasses = "group block rounded-xl border p-6 shadow-md transition-all duration-300";
  const variantClasses = variant === 'danger' 
    ? "border-red-200 bg-red-50 hover:border-red-500 hover:shadow-lg"
    : "border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg";
  
  const content = (
    <div className="flex items-start justify-between">
      <div>
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
          variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="mt-1 text-slate-600">{description}</p>
      </div>
      <ArrowRight className={`mt-1 h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 ${
        variant === 'danger' ? 'group-hover:text-red-500' : 'group-hover:text-blue-500'
      }`} />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${variantClasses}`}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses} w-full text-left`}>
      {content}
    </button>
  );
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

// --- Componente Principal ---
interface RepresentativeViewProps {
  groupId: string;
}

export const RepresentativeView = ({ groupId }: RepresentativeViewProps) => {
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingGroup(true);
      setIsLoadingMembers(true);
      
      const [groupData, membersData] = await Promise.all([
        fakeApiFetchGroupDetails(groupId),
        fakeApiFetchMembers(groupId)
      ]);
      
      setGroupDetails(groupData);
      setMembers(membersData);
      setIsLoadingGroup(false);
      setIsLoadingMembers(false);
    };
    
    loadData();
  }, [groupId]);

  const handleDeleteGroup = () => {
    // Aquí iría la lógica para eliminar el grupo
    console.log('Eliminando grupo:', groupId);
    setShowDeleteConfirm(false);
  };

  const handlePromoteToModerator = (memberId: string) => {
    // Lógica para hacer moderador
    console.log('Promoviendo a moderador:', memberId);
  };

  const handleTransferRepresentative = (moderatorId: string) => {
    // Lógica para ceder representatividad
    console.log('Transfiriendo representatividad a:', moderatorId);
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
              <p className="text-slate-600 mb-4 max-w-2xl">{groupDetails.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{groupDetails.reputation}/5.0</span>
                </div>
                <span>•</span>
                <span>Creado el {new Date(groupDetails.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                Representante
              </span>
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

      {/* 3. Acciones de Gestión */}
      <section className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          href={`/Student/Groups/Representative/${groupId}/edit`}
          icon={<Settings className="h-6 w-6 text-blue-500" />}
          title="Editar Grupo"
          description="Modifica la información, descripción y configuración del grupo."
        />
        <ActionCard
          href={`/Student/Groups/Representative/${groupId}/members`}
          icon={<UserCheck className="h-6 w-6 text-blue-500" />}
          title="Gestionar Miembros"
          description="Administra roles, permisos y membresías del grupo."
        />
        <ActionCard
          href={`/events/create?groupId=${groupId}`}
          icon={<CalendarPlus className="h-6 w-6 text-blue-500" />}
          title="Crear Evento"
          description="Organiza y reserva espacios para eventos del grupo."
        />
        <ActionCard
          href={`/Student/Groups/Representative/${groupId}/transfer`}
          icon={<Crown className="h-6 w-6 text-blue-500" />}
          title="Transferir Liderazgo"
          description="Cede la posición de representante a un moderador."
        />
        <ActionCard
          variant="danger"
          icon={<Trash2 className="h-6 w-6 text-red-500" />}
          title="Eliminar Grupo"
          description="Elimina permanentemente el grupo y todos sus datos."
          onClick={() => setShowDeleteConfirm(true)}
        />
      </section>

      {/* 4. Vista Previa de Miembros */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Miembros del Grupo</h2>
          <Link 
            href={`/Student/Groups/Representative/${groupId}/members`}
            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
          >
            Ver todos →
          </Link>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoadingMembers ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {members.slice(0, 5).map(member => (
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
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        member.role === 'Moderador' 
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

      {/* Modal de Confirmación para Eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">Confirmar Eliminación</h3>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar el grupo &quot;{groupDetails.name}&quot;? 
              Esta acción no se puede deshacer y se perderán todos los datos del grupo.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteGroup}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar Grupo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};