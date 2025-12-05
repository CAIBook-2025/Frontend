'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, UploadCloud, Send, AlertCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';

// --- TIPOS Y DATOS DEL FORMULARIO ---
interface GroupFormData {
  name: string;
  description: string;
  goal: string;
  logo: File | null;
}

export default function CreateGroupPage() {
  const params = useSearchParams();
  const router = useRouter();
  const userId = Number(params.get('userId') ?? 0);
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    goal: '',
    logo: null,
  });

  // Obtener access token
  useEffect(() => {
    async function fetchAccessToken() {
      if (user) {
        try {
          const token = await getAccessToken();
          setAccessToken(token || null);
        } catch (error) {
          console.error('Error fetching access token:', error);
        }
      }
    }

    fetchAccessToken();
  }, [user]);

  // Obtener perfil del usuario para verificar solicitudes pendientes
  useEffect(() => {
    async function loadUserProfile() {
      if (!accessToken) {
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      try {
        const profile = await fetchUserProfile(accessToken);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    if (accessToken) loadUserProfile();
  }, [accessToken]);

  // Verificar si el usuario tiene solicitudes pendientes
  const hasPendingRequests = (userProfile?.pendingGroupRequests ?? 0) >= 1;

  // Función para validar cada etapa
  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      // Validar Etapa 1: Información General
      if (!formData.name.trim()) {
        errors.name = 'El nombre del grupo es requerido';
      }
      if (!formData.description.trim()) {
        errors.description = 'La descripción es requerida';
      }
    } else if (currentStep === 2) {
      // Validar Etapa 2: Detalles y Objetivos
      if (!formData.goal.trim()) {
        errors.goal = 'El objetivo principal es requerido';
      }
    }
    // Etapa 3 no requiere validación (logo es opcional)

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    // Validar la etapa actual antes de avanzar
    if (!validateStep(step)) {
      setErrorMsg('Por favor completa todos los campos requeridos antes de continuar.');
      return;
    }

    // Limpiar errores si la validación es exitosa
    setErrorMsg(null);
    setValidationErrors({});

    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar el error del campo cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Limpiar el mensaje de error general si todos los campos están completos
    if (errorMsg) {
      setErrorMsg(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, logo: file }));
    } else {
      setFormData((prev) => ({ ...prev, logo: null }));
    }
  };

  // La función de envío ya no necesita el evento 'e'
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const { name, description, goal, logo } = formData;

      if (!name.trim() || !description.trim() || !goal.trim()) {
        setErrorMsg('Por favor completa todos los campos obligatorios.');
        setSubmitting(false);
        return;
      }

      if (!userId) {
        setErrorMsg('No se detectó el usuario. Reintenta desde el Dashboard.');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add token authorization
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          user_id: userId,
          name: name.trim(),
          goal: goal.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'No se pudo crear la solicitud de grupo.');
      }

      const data = await res.json();

      // Redirigir al dashboard con parámetro de éxito
      router.push(`/Student?view=groups&success=true`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al enviar la solicitud.');
      setSubmitting(false);
    }
  };

  // Si está cargando el perfil, mostrar loading
  if (isLoadingProfile) {
    return (
      <main className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Verificando tu estado...</p>
        </div>
      </main>
    );
  }

  // Si tiene solicitudes pendientes, mostrar mensaje y bloquear formulario
  if (hasPendingRequests) {
    return (
      <main className="flex min-h-screen bg-slate-50">
        <div className="hidden lg:block w-3/5 relative">
          <Image
            src="/PeopleForm.png"
            alt="Estudiantes colaborando en un grupo"
            width={500}
            height={500}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/40" />
          <div className="absolute bottom-10 left-10 text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            <h1 className="text-4xl font-bold">Crea tu Comunidad</h1>
            <p className="mt-2 text-lg max-w-md text-white/90">
              Reúne a personas con tus mismos intereses y empieza a organizar eventos increíbles.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-3/5 flex flex-col items-center justify-center h-full p-8">
          <div className="max-w-2xl w-full">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-amber-100 p-3">
                    <Clock className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-amber-800 mb-3">
                    Solicitud de grupo pendiente
                  </h2>
                  <p className="text-amber-700 mb-6">
                    Ya tienes {userProfile?.pendingGroupRequests} solicitud{userProfile?.pendingGroupRequests !== 1 ? 'es' : ''} de grupo pendiente{userProfile?.pendingGroupRequests !== 1 ? 's' : ''}. 
                    Por favor espera a que se resuelva{userProfile?.pendingGroupRequests !== 1 ? 'n' : ''} antes de crear una nueva solicitud.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Link
                      href="/Student?view=groups"
                      className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                    >
                      <ArrowLeft size={16} /> Volver a Grupos
                    </Link>
                    <a
                      className="inline-flex items-center gap-2 rounded-full bg-white border-2 border-amber-600 px-6 py-3 text-sm font-semibold text-amber-600 transition-colors hover:bg-amber-50"
                    >
                      <AlertCircle size={16} /> Ver Mis Solicitudes
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:block w-3/5 relative">
        <Image
          src="/PeopleForm.png"
          alt="Estudiantes colaborando en un grupo"
          width={500}
          height={500}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/40" />
        <div className="absolute bottom-10 left-10 text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
          <h1 className="text-4xl font-bold">Crea tu Comunidad</h1>
          <p className="mt-2 text-lg max-w-md text-white/90">
            Reúne a personas con tus mismos intereses y empieza a organizar eventos increíbles.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-3/5  flex flex-col items-center h-full p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-5 text-center">
          ¡Felicidades! Estás dando el primer paso hacia tu comunidad
        </h1>

        <div className="max-w-3xl w-full">
          <div className="mb-8 flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {s}
                </div>
                <p className={`mt-2 text-xs font-semibold ${step >= s ? 'text-blue-600' : 'text-slate-500'}`}>
                  {s === 1 && 'Info General'}
                  {s === 2 && 'Detalles'}
                  {s === 3 && 'Finalizar'}
                </p>
              </div>
            ))}
          </div>

          {/* El contenedor principal ahora es un <div> en lugar de <form> */}
          <div className="bg-white px-8 py-12 rounded-2xl shadow-lg">
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Información General</h2>
                <div className="space-y-8">
                  <Input
                    id="name"
                    name="name"
                    label="Nombre del Grupo"
                    placeholder="Ej: Club de Programación"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    error={validationErrors.name}
                  />
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                      Descripción Corta
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={6}
                      placeholder="Una breve descripción que invite a los estudiantes a unirse."
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`resize-none block w-full rounded-md border shadow-sm placeholder:text-slate-400 focus:ring-blue-600 ${
                        validationErrors.description
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-600'
                      }`}
                      required
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Detalles y Objetivos</h2>
                <div className="space-y-8">
                  <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-slate-700 mb-1">
                      Objetivo Principal
                    </label>
                    <textarea
                      id="goal"
                      name="goal"
                      rows={10}
                      placeholder="¿Cuál es el propósito principal de este grupo? ¿Qué buscan lograr?"
                      value={formData.goal}
                      onChange={handleInputChange}
                      className={`resize-none block w-full rounded-md border shadow-sm placeholder:text-slate-400 focus:ring-blue-600 ${
                        validationErrors.goal
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-600'
                      }`}
                      required
                    />
                    {validationErrors.goal && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.goal}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Finalizar y Enviar</h2>
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-slate-700 mb-1">
                    Logo del Grupo (Opcional)
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-900/25 px-6 py-10">
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="mt-4 flex text-sm leading-6 text-slate-600">
                        <label
                          htmlFor="logo-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                        >
                          <span>Sube un archivo</span>
                          <input
                            id="logo-upload"
                            name="logo"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg"
                          />
                        </label>
                        <p className="pl-1">o arrástralo aquí</p>
                      </div>
                      <p className="text-xs leading-5 text-slate-500">PNG, JPG hasta 2MB</p>
                    </div>
                  </div>
                  {formData.logo && (
                    <p className="mt-2 text-sm text-green-600 text-center">
                      Archivo seleccionado: {formData.logo.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {/* Navegación del Carrusel */}
            <div className="mt-10 pt-8 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-opacity duration-300 ${step === 1 ? 'opacity-0 cursor-default' : 'text-slate-600 hover:bg-slate-100'}`}
                disabled={step === 1}
              >
                <ArrowLeft size={16} /> Volver
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Siguiente <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button" // Cambiado de 'submit' a 'button'
                  onClick={handleSubmit} // El onClick ahora llama directamente a handleSubmit
                  disabled={submitting}
                  className={`flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors ${
                    submitting ? 'bg-green-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {submitting ? (
                    'Enviando…'
                  ) : (
                    <>
                      Enviar Solicitud <Send size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
