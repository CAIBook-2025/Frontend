// app/Student/Groups/Representative/[groupId]/Events/Create/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Send,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Users,
  Target,
  FileText,
  Info,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { fetchPublicSpaces } from '@/lib/events/fetchPublicSpaces';
import { fetchEventRequests } from '@/lib/events/fetchEventRequests';
import { createEventRequest } from '@/lib/events/createEventRequest';
import { PublicSpace, MODULE_TIMES, CreateEventRequest } from '@/types/eventRequest';

interface CreateEventPageProps {
  params: Promise<{ groupId: string }>;
}

interface FormData {
  name: string;
  goal: string;
  description: string;
  public_space_id: number | null;
  day: string;
  module: number | null;
}

export default function CreateEventPage({ params }: CreateEventPageProps) {
  const { groupId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();

  const [step, setStep] = useState(1);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Datos
  const [publicSpaces, setPublicSpaces] = useState<PublicSpace[]>([]);
  const [pendingEventsCount, setPendingEventsCount] = useState(0);
  const [groupName, setGroupName] = useState('');

  // Formulario
  const [formData, setFormData] = useState<FormData>({
    name: '',
    goal: '',
    description: '',
    public_space_id: null,
    day: '',
    module: null,
  });

  // Obtener access token
  useEffect(() => {
    async function fetchToken() {
      if (user) {
        try {
          const token = await getAccessToken();
          setAccessToken(token);
        } catch (error) {
          console.error('Error fetching access token:', error);
          setError('Error al autenticar');
        }
      }
    }
    fetchToken();
  }, [user]);

  // Cargar datos iniciales
  useEffect(() => {
    async function loadData() {
      if (!accessToken) return;

      setIsLoading(true);
      try {
        // Cargar espacios públicos
        const spaces = await fetchPublicSpaces(accessToken);
        setPublicSpaces(spaces);

        // Cargar info del grupo
        const groupResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (groupResponse.ok) {
          const groupData = await groupResponse.json();
          setGroupName(groupData.groupRequest?.name || 'Grupo');
        }

        // Contar solicitudes pendientes del grupo
        const pendingEvents = await fetchEventRequests(accessToken, {
          status: 'PENDING',
          group_id: parseInt(groupId),
        });
        setPendingEventsCount(pendingEvents?.length || 0);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    }

    if (accessToken) loadData();
  }, [accessToken, groupId]);

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Validación por paso
  const validateStep = (currentStep: number): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        errors.name = 'El nombre del evento es requerido';
      }
      if (!formData.goal.trim()) {
        errors.goal = 'El objetivo es requerido';
      }
      if (!formData.description.trim()) {
        errors.description = 'La descripción es requerida';
      }
    } else if (currentStep === 2) {
      if (!formData.public_space_id) {
        errors.public_space_id = 'Debes seleccionar un espacio';
      }
    } else if (currentStep === 3) {
      if (!formData.day) {
        errors.day = 'La fecha es requerida';
      } else {
        const selectedDate = new Date(formData.day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          errors.day = 'La fecha debe ser hoy o futura';
        }
      }
      if (!formData.module) {
        errors.module = 'El módulo horario es requerido';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      return;
    }
    setValidationErrors({});
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSpaceSelect = (spaceId: number) => {
    setFormData((prev) => ({ ...prev, public_space_id: spaceId }));
    if (validationErrors.public_space_id) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.public_space_id;
        return newErrors;
      });
    }
  };

  const handleModuleSelect = (module: number) => {
    setFormData((prev) => ({ ...prev, module }));
    if (validationErrors.module) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.module;
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    if (!accessToken) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const eventData: CreateEventRequest = {
        group_id: parseInt(groupId),
        public_space_id: formData.public_space_id!,
        name: formData.name.trim(),
        goal: formData.goal.trim(),
        description: formData.description.trim(),
        day: formData.day,
        module: formData.module!,
      };

      const result = await createEventRequest(accessToken, eventData);

      if (result.success) {
        router.push(`/Student/Groups/Representative/${groupId}/Events?success=true`);
      } else {
        setError(result.error || 'Error al crear el evento');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error submitting event:', err);
      setError('Error al enviar la solicitud');
      setIsSubmitting(false);
    }
  };

  const selectedSpace = publicSpaces.find((s) => s.id === formData.public_space_id);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-slate-600">Cargando...</p>
        </div>
      </main>
    );
  }

  // Límite de solicitudes pendientes
  if (pendingEventsCount >= 3) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-amber-100 p-3 flex-shrink-0">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-amber-800 mb-3">Límite de solicitudes alcanzado</h2>
                <p className="text-amber-700 mb-6">
                  Ya tienes {pendingEventsCount} solicitudes de evento pendientes. El límite máximo es de 3 solicitudes
                  simultáneas. Por favor espera a que se resuelvan algunas antes de crear una nueva.
                </p>
                <Link
                  href={`/Student/Groups/Representative/${groupId}/Events`}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                >
                  <ArrowLeft size={16} /> Ver Mis Solicitudes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Navegación */}
        <section className="mb-6">
          <Link
            href={`/Student/Groups/Representative/${groupId}/Events`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a eventos
          </Link>
        </section>

        {/* Header */}
        <section className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Solicitar Nuevo Evento</h1>
          <p className="text-slate-600">{groupName} • Completa el formulario para solicitar un espacio</p>
        </section>

        {/* Progress Steps */}
        <section className="mb-10">
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Información', icon: FileText },
              { num: 2, label: 'Espacio', icon: MapPin },
              { num: 3, label: 'Fecha y Hora', icon: Calendar },
              { num: 4, label: 'Confirmar', icon: CheckCircle2 },
            ].map(({ num, label, icon: Icon }) => (
              <div key={num} className="flex-1 text-center">
                <div
                  className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${
                    step >= num ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p
                  className={`mt-2 text-xs font-semibold hidden sm:block ${
                    step >= num ? 'text-blue-600' : 'text-slate-500'
                  }`}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Form Container */}
        <section className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Step 1: Información del evento */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  Información del Evento
                </h2>
                <div className="space-y-6">
                  <Input
                    id="name"
                    name="name"
                    label="Nombre del Evento"
                    placeholder="Ej: Taller de React, Hackathon de IA, etc."
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    error={validationErrors.name}
                  />
                  <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-slate-700 mb-1">
                      Objetivo del Evento <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="goal"
                      name="goal"
                      rows={3}
                      placeholder="¿Cuál es el propósito principal del evento?"
                      value={formData.goal}
                      onChange={handleInputChange}
                      className={`resize-none block w-full rounded-lg border shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 p-3 ${
                        validationErrors.goal
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-600'
                      }`}
                    />
                    {validationErrors.goal && <p className="mt-1 text-sm text-red-600">{validationErrors.goal}</p>}
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      placeholder="Describe las actividades que se realizarán, público objetivo, etc."
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`resize-none block w-full rounded-lg border shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 p-3 ${
                        validationErrors.description
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-600'
                      }`}
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Selección de espacio */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  Selecciona el Espacio
                </h2>

                {validationErrors.public_space_id && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {validationErrors.public_space_id}
                  </div>
                )}

                {publicSpaces.length === 0 ? (
                  <div className="text-center py-10">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No hay espacios disponibles en este momento</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publicSpaces.map((space) => (
                      <button
                        key={space.id}
                        type="button"
                        onClick={() => handleSpaceSelect(space.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.public_space_id === space.id
                            ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-800 mb-1">{space.name}</h3>
                        <p className="text-sm text-slate-600 mb-2">{space.location}</p>
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Users className="h-4 w-4" />
                          <span>Capacidad: {space.capacity} personas</span>
                        </div>
                        {formData.public_space_id === space.id && (
                          <div className="mt-2 flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Seleccionado
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Fecha y módulo */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Fecha y Horario
                </h2>

                <div className="space-y-6">
                  {/* Selector de fecha */}
                  <div>
                    <label htmlFor="day" className="block text-sm font-medium text-slate-700 mb-1">
                      Fecha del Evento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="day"
                      name="day"
                      value={formData.day}
                      onChange={handleInputChange}
                      min={getMinDate()}
                      className={`block w-full rounded-lg border shadow-sm p-3 ${
                        validationErrors.day
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-600'
                      } focus:ring-2 focus:ring-blue-600`}
                    />
                    {validationErrors.day && <p className="mt-1 text-sm text-red-600">{validationErrors.day}</p>}
                  </div>

                  {/* Selector de módulo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Módulo Horario <span className="text-red-500">*</span>
                    </label>

                    {validationErrors.module && <p className="mb-2 text-sm text-red-600">{validationErrors.module}</p>}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(MODULE_TIMES).map(([moduleNum, times]) => {
                        const num = parseInt(moduleNum);
                        const isSelected = formData.module === num;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleModuleSelect(num)}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-semibold text-gray-800">Módulo {num}</div>
                            <div className="text-xs text-slate-600 mt-1">{times.label}</div>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 mx-auto mt-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Importante</p>
                        <p>
                          No puede haber dos eventos en el mismo espacio, día y módulo. Si hay conflicto, el sistema te
                          notificará.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmación */}
            {step === 4 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Confirmar Solicitud
                </h2>

                <div className="space-y-6">
                  {/* Resumen */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h3 className="font-semibold text-gray-800">Resumen del Evento</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <span className="text-sm text-slate-500">Nombre</span>
                        <p className="font-semibold text-gray-800">{formData.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Objetivo</span>
                        <p className="text-gray-700">{formData.goal}</p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">Descripción</span>
                        <p className="text-gray-700 text-sm">{formData.description}</p>
                      </div>
                      <hr />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-slate-500">Espacio</span>
                          <p className="font-medium text-gray-800">{selectedSpace?.name}</p>
                          <p className="text-sm text-slate-600">{selectedSpace?.location}</p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-500">Capacidad</span>
                          <p className="font-medium text-gray-800">{selectedSpace?.capacity} personas</p>
                        </div>
                      </div>
                      <hr />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-slate-500">Fecha</span>
                          <p className="font-medium text-gray-800">
                            {new Date(formData.day).toLocaleDateString('es-CL', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-slate-500">Horario</span>
                          <p className="font-medium text-gray-800">
                            Módulo {formData.module} ({MODULE_TIMES[formData.module!]?.label})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nota */}
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-1">Antes de enviar</p>
                        <p>
                          Tu solicitud quedará en estado <strong>Pendiente</strong> hasta que un administrador la revise
                          y confirme. Recibirás una notificación cuando cambie el estado.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={handleBack}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-opacity ${
                  step === 1 ? 'opacity-0 cursor-default' : 'text-slate-600 hover:bg-slate-100'
                }`}
                disabled={step === 1}
              >
                <ArrowLeft size={16} /> Volver
              </button>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Siguiente <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold text-white transition-colors ${
                    isSubmitting ? 'bg-green-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Enviar Solicitud
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
