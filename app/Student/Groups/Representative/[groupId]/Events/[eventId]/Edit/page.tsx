// app/Student/Groups/Representative/[groupId]/Events/[eventId]/Edit/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0';
import { ArrowLeft, Save, Loader2, AlertCircle, Target, FileText, Info } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { fetchEventById } from '@/lib/events/fetchEventById';
import { updateEventRequest } from '@/lib/events/updateEventRequest';
import { EventRequestDetail, UpdateEventRequest } from '@/types/eventRequest';

interface EditEventPageProps {
  params: Promise<{ groupId: string; eventId: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const { groupId, eventId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();

  const [event, setEvent] = useState<EventRequestDetail | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Formulario
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    description: '',
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

  // Cargar evento
  useEffect(() => {
    async function loadEvent() {
      if (!accessToken) return;

      setIsLoading(true);
      setError(null);

      try {
        const eventData = await fetchEventById(accessToken, parseInt(eventId));
        if (eventData) {
          // Verificar que esté en estado PENDING
          if (eventData.status !== 'PENDING') {
            setError('Solo se pueden editar eventos con estado pendiente');
            return;
          }

          setEvent(eventData);
          setFormData({
            name: eventData.name,
            goal: eventData.goal,
            description: eventData.description || '',
          });
        } else {
          setError('Evento no encontrado');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Error al cargar el evento');
      } finally {
        setIsLoading(false);
      }
    }

    if (accessToken) loadEvent();
  }, [accessToken, eventId]);

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }
    if (!formData.goal.trim()) {
      errors.goal = 'El objetivo es requerido';
    }
    if (!formData.description.trim()) {
      errors.description = 'La descripción es requerida';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !accessToken || !event) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const updates: UpdateEventRequest = {
        name: formData.name.trim(),
        goal: formData.goal.trim(),
        description: formData.description.trim(),
      };

      const result = await updateEventRequest(accessToken, event.id, updates);

      if (result) {
        router.push(`/Student/Groups/Representative/${groupId}/Events/${eventId}?updated=true`);
      } else {
        setSaveError('Error al actualizar el evento');
        setIsSaving(false);
      }
    } catch (err) {
      console.error('Error updating event:', err);
      setSaveError('Error al guardar los cambios');
      setIsSaving(false);
    }
  };

  // Loading
  if (authLoading || isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </main>
    );
  }

  // Error
  if (error || !event) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <section className="mb-6">
          <Link
            href={`/Student/Groups/Representative/${groupId}/Events/${eventId}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al evento
          </Link>
        </section>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-800 font-semibold text-lg">{error || 'Evento no encontrado'}</p>
        </div>
      </main>
    );
  }

  // Verificar si hay cambios
  const hasChanges =
    formData.name !== event.name || formData.goal !== event.goal || formData.description !== (event.description || '');

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* Navegación */}
      <section className="mb-6">
        <Link
          href={`/Student/Groups/Representative/${groupId}/Events/${eventId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al evento
        </Link>
      </section>

      {/* Header */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Editar Evento</h1>
        <p className="text-slate-600">Modifica la información de tu solicitud de evento</p>
      </section>

      {/* Formulario */}
      <section className="max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Info box */}
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Campos editables</p>
                <p>
                  Como representante puedes modificar el nombre, objetivo y descripción del evento. La fecha, horario y
                  espacio no pueden ser modificados una vez creada la solicitud.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                Nombre del Evento
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Nombre del evento"
                value={formData.name}
                onChange={handleInputChange}
                error={validationErrors.name}
              />
            </div>

            {/* Objetivo */}
            <div>
              <label htmlFor="goal" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                Objetivo
              </label>
              <textarea
                id="goal"
                name="goal"
                rows={3}
                value={formData.goal}
                onChange={handleInputChange}
                placeholder="¿Cuál es el propósito principal del evento?"
                className={`resize-none block w-full rounded-lg border shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 p-3 ${
                  validationErrors.goal
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-slate-300 focus:border-blue-600'
                }`}
              />
              {validationErrors.goal && <p className="mt-1 text-sm text-red-600">{validationErrors.goal}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe las actividades del evento..."
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

          {/* Error de guardado */}
          {saveError && (
            <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {saveError}
            </div>
          )}

          {/* Acciones */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
            <Link
              href={`/Student/Groups/Representative/${groupId}/Events/${eventId}`}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-center"
            >
              Cancelar
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSaving || !hasChanges}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 font-medium transition-colors ${
                isSaving || !hasChanges
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>

          {!hasChanges && <p className="mt-3 text-center text-sm text-slate-500">No hay cambios para guardar</p>}
        </div>
      </section>
    </main>
  );
}
