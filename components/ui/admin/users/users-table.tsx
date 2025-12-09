'use client';

import { UserProfile } from '@/types/userProfile';
import { Trash2, RotateCcw, ShieldPlus } from 'lucide-react';

interface UsersTableProps {
  users: UserProfile[];
  onDelete: (userId: number, userName: string) => void;
  onRestore: (userId: number, userName: string) => void;
  onPromote: (userId: number, userName: string) => void;
}

export const UsersTable = ({ users, onDelete, onRestore, onPromote }: UsersTableProps) => {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-CL');

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-800',
      STUDENT: 'bg-green-100 text-green-800',
    };

    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      STUDENT: 'Estudiante',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Usuario</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Rol</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Carrera / N° Alumno</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Contacto</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Fecha Registro</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Estado</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={`border-b border-gray-100 hover:bg-gray-50 ${user.is_deleted ? 'bg-red-50/30' : ''}`}
              >
                <td className="py-4 px-4">
                  <p className="font-medium text-gray-900 text-sm">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{user.email}</p>
                </td>

                <td className="py-4 px-4">{getRoleBadge(user.role)}</td>

                <td className="py-4 px-4">
                  <p className="text-gray-900 text-sm">{user.career || '—'}</p>
                  <p className="text-gray-500 text-xs">{user.student_number || '—'}</p>
                </td>

                <td className="py-4 px-4 text-sm text-gray-700">
                  <p>{user.phone || '—'}</p>
                </td>

                <td className="py-4 px-4 text-sm text-gray-700">{formatDate(user.createdAt)}</td>

                <td className="py-4 px-4">
                  {user.is_deleted ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Eliminado
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo
                    </span>
                  )}
                </td>

                <td className="py-4 px-4">
                  {!user.is_deleted ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onDelete(user.id, `${user.first_name} ${user.last_name}`)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {user.role === 'STUDENT' && (
                        <button
                          onClick={() => onPromote(user.id, `${user.first_name} ${user.last_name}`)}
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Promover a administrador"
                        >
                          <ShieldPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onRestore(user.id, `${user.first_name} ${user.last_name}`)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Restaurar usuario"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
