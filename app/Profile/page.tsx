'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { use, useEffect, useState } from 'react';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfile } from '@/lib/user/fetchUserProfile';
import { useRouter } from 'next/navigation';

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
    student_number: '',
  });

  // ✅ Detectar si puede cambiar contraseña (si su login es Auth0 Database)
  const canChangePassword = user?.sub?.startsWith('auth0|');

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
            const profile = profileResponse.user;
            setUserData(profile);
            setFormData({
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
              phone: profile.phone || '',
              career: profile.career || '',
              student_number: profile.student_number || '',
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!accessToken || !userData) return;

    setError(null);
    setSuccess(null);

    // ✅ VALIDACIÓN: Campos obligatorios
    if (!formData.first_name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    if (!formData.last_name.trim()) {
      setError('El apellido es obligatorio');
      return;
    }

    if (!formData.career.trim()) {
      setError('La carrera es obligatoria');
      return;
    }

    if (!formData.student_number.trim()) {
      setError('El número de estudiante es obligatorio');
      return;
    }

    // ✅ VALIDACIÓN: Formato de nombre (solo letras y espacios)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(formData.first_name.trim())) {
      setError('El nombre solo puede contener letras y espacios');
      return;
    }

    if (!nameRegex.test(formData.last_name.trim())) {
      setError('El apellido solo puede contener letras y espacios');
      return;
    }

    // ✅ VALIDACIÓN: Carrera (solo letras, números, espacios y guiones)
    const careerRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-]+$/;
    if (!careerRegex.test(formData.career.trim())) {
      setError('La carrera contiene caracteres inválidos');
      return;
    }

    // ✅ VALIDACIÓN: Número de estudiante (solo números, guiones y espacios)
    const studentNumberRegex = /^[0-9\-\s]+$/;
    if (!studentNumberRegex.test(formData.student_number.trim())) {
      setError('El número de estudiante solo puede contener números, guiones y espacios');
      return;
    }

    if (formData.student_number.replace(/\D/g, '').length < 4) {
      setError('El número de estudiante debe tener al menos 4 dígitos');
      return;
    }

    // ✅ VALIDACIÓN: Teléfono (si se proporciona)
    if (formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone.trim()) || formData.phone.replace(/\D/g, '').length < 7) {
        setError('El teléfono no es válido (mínimo 7 dígitos)');
        return;
      }
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
          Authorization: `Bearer ${accessToken}`,
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
        student_number: userData.student_number || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  // ✅ NUEVO: Enviar email de cambio de contraseña
  const handlePasswordReset = async () => {
    setIsSendingPasswordEmail(true);
    setPasswordMessage(null);

    try {
      await fetch(`${process.env.AUTH0_DOMAIN}/dbconnections/change_password`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          client_id: user?.id,
          email: user?.email,
          connection: 'Username-Password-Authentication',
        }),
      });

      setPasswordMessage('Te hemos enviado un correo para cambiar tu contraseña.');
    } catch (err) {
      console.error(err);
      setPasswordMessage('Hubo un problema al solicitar el cambio de contraseña.');
    } finally {
      setIsSendingPasswordEmail(false);
    }
  };

  if (!userData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-blue-600">
                {userData.first_name?.[0]}
                {userData.last_name?.[0]}
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
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tu nombre"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tu apellido"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carrera <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="career"
                    value={formData.career}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tu carrera"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tu teléfono"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Estudiante <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="student_number"
                    value={formData.student_number}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Tu número de estudiante"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Editar Perfil
                  </button>
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
                      <p className="text-blue-800 mb-3">Te enviaremos un correo para cambiar tu contraseña.</p>

                      <button
                        onClick={handlePasswordReset}
                        disabled={isSendingPasswordEmail}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSendingPasswordEmail ? 'Enviando...' : 'Enviar correo'}
                      </button>

                      {passwordMessage && <p className="text-blue-700 mt-3">{passwordMessage}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Delete Account */}
              <div className="pt-6 border-t border-gray-200">
                {showDeleteConfirm ? (
                  <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-red-800 font-medium mb-3">
                      ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                      >
                        {isDeleting ? 'Eliminando...' : 'Sí, eliminar cuenta'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Eliminar cuenta
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
