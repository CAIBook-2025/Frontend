'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { use, useEffect, useState } from 'react';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';
import { useRouter } from 'next/navigation';
import { AlertTriangle, X } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading } = useUser();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // ✅ NUEVO: Estados para cambio de contraseña
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isSendingPasswordEmail, setIsSendingPasswordEmail] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    career: '',
    student_number: ''
  });

  // ✅ Detectar si puede cambiar contraseña (si su login es Auth0 Database)
  const canChangePassword = user?.sub?.startsWith("auth0|");

  useEffect(() => {
    async function fetchAccessToken() {
      if (user) {
        try {
          const accessToken = await getAccessToken();
          setAccessToken(accessToken);
        } catch (error) {
          console.error('Error fetching access token:', error);
        }
      }
    }

    fetchAccessToken();
  }, [user]);

  useEffect(() => {
    async function fetchUserData() {
      if (accessToken) {
        try {
          const profileResponse = await fetchUserProfile(accessToken);
          if (profileResponse?.user) {
            setUserData(profileResponse.user);
            setFormData({
              first_name: profileResponse.user.first_name || '',
              last_name: profileResponse.user.last_name || '',
              phone: profileResponse.user.phone || '',
              career: profileResponse.user.career || '',
              student_number: profileResponse.user.student_number || ''
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    }

    fetchUserData();
  }, [accessToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!accessToken || !userData) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      const updatedProfile = await response.json();
      setUserData(updatedProfile);
      setIsEditing(false);
      setSuccess('Perfil actualizado exitosamente');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !userData) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userData.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la cuenta');
      }

      router.push('/auth/logout');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Error al eliminar la cuenta');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        career: userData.career || '',
        student_number: userData.student_number || ''
      });
    }
    setIsEditing(false);
    setError(null);
  };

  // ✅ NUEVO: Enviar email de cambio de contraseña
  const handlePasswordReset = async () => {
    setIsSendingPasswordEmail(true);
    setPasswordMessage(null);
    console.log("Iniciando proceso de cambio de contraseña para:", user?.email, user?.id);

    try {
      console.log("Enviando solicitud de cambio de contraseña para:", user?.email, user?.id);
      await fetch(`${process.env.AUTH0_DOMAIN}/dbconnections/change_password`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          client_id: user?.id,
          email: user?.email,
          connection: "Username-Password-Authentication",
        }),
      });

      setPasswordMessage("Te hemos enviado un correo para cambiar tu contraseña.");
    } catch (err) {
      console.error(err);
      setPasswordMessage("Hubo un problema al solicitar el cambio de contraseña.");
    } finally {
      setIsSendingPasswordEmail(false);
    }
  };

  if (!userData) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Cargando...</div>
    </div>
  );

  return (
    <>
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-blue-600">
                {userData.first_name?.[0]}{userData.last_name?.[0]}
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {userData.first_name} {userData.last_name}
                </h1>
                <p className="text-blue-100">{userData.email}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.first_name || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.last_name || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrera
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="career"
                      value={formData.career}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.career || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de estudiante
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="student_number"
                      value={formData.student_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.student_number || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{userData.phone || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <p className="text-gray-900">{userData.role || 'No especificado'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar cambios'}
                    </button>

                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Editar perfil
                    </button>

                    <a
                      href="/auth/logout"
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-center"
                    >
                      Cerrar sesión
                    </a>
                  </div>
                )}
              </div>

              {/* ✅ CAMBIAR CONTRASEÑA (solo si es Auth0 Database) */}
              {canChangePassword && (
                <div className="pt-6 border-t border-gray-200">
                  {!showPasswordForm ? (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Cambiar contraseña
                    </button>
                  ) : (
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="text-blue-800 mb-3">
                        Te enviaremos un correo para cambiar tu contraseña.
                      </p>

                      <button
                        onClick={handlePasswordReset}
                        disabled={isSendingPasswordEmail}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSendingPasswordEmail ? "Enviando..." : "Enviar correo"}
                      </button>

                      {passwordMessage && (
                        <p className="text-blue-700 mt-3">{passwordMessage}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Danger Zone */}
              <div className="mt-8 rounded-lg border-2 border-red-300 bg-red-50/50">
                <div className="border-b border-red-200 bg-red-100/50 px-4 py-3">
                  <h3 className="text-sm font-semibold text-red-800">Zona de Peligro</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Eliminar esta cuenta</p>
                      <p className="text-sm text-gray-600">
                        Una vez eliminada, no podrás recuperar tu cuenta ni tus datos.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white hover:border-red-600 cursor-pointer"
                    >
                      Eliminar cuenta
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>

    {/* Modal de Confirmación para Eliminar Cuenta */}
    {showDeleteConfirm && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={() => setShowDeleteConfirm(false)}
      >
        <div
          className="relative w-full max-w-md m-4 rounded-xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold text-gray-800">⚠️ Eliminar Cuenta Permanentemente</h3>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Esta acción es irreversible</p>
                <p className="text-sm text-red-700 mt-1">
                  Una vez eliminada, no podrás recuperar tu cuenta ni ningún dato asociado.
                </p>
              </div>
            </div>
            
            <div className="text-slate-600">
              <p className="mb-2">Al eliminar tu cuenta perderás:</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-slate-500">
                <li>Todas tus reservas activas e históricas</li>
                <li>Tu membresía en grupos estudiantiles</li>
                <li>Todo tu historial de actividad en CAIBook</li>
              </ul>
            </div>

            <p className="text-sm font-medium text-slate-700">
              ¿Estás completamente seguro de que deseas eliminar tu cuenta?
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              Volver
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 cursor-pointer"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, Eliminar Mi Cuenta'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
