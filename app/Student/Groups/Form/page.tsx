'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, UploadCloud, Send } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// --- TIPOS Y DATOS DEL FORMULARIO ---
interface GroupFormData {
  name: string;
  description: string;
  objective: string;
  logo: File | null;
}

export default function CreateGroupPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    objective: '',
    logo: null,
  });
  const params = useSearchParams();
  const userId = Number(params.get('userId') ?? 0);

  useEffect(() => {
    // Esto sí debería aparecer siempre en la consola del navegador
    console.log('Form mounted. userId =', userId);
  }, [userId]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
  const handleNext = () => {
    // TODO: Añadir validación antes de pasar al siguiente paso
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData(prev => ({ ...prev, logo: file }));
    } else {
      setFormData(prev => ({ ...prev, logo: null }));
    }
  };

  // La función de envío ya no necesita el evento 'e'
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      if (!formData.name.trim() || !formData.description.trim() || !formData.objective.trim()) {
        setErrorMsg('Por favor completa todos los campos obligatorios.');
        setSubmitting(false);
        return;
      }

      let response: Response;

      if (formData.logo) {
        // Enviar multipart/form-data
        const fd = new FormData();
        fd.append('name', formData.name.trim());
        fd.append('goal', formData.objective.trim());
        fd.append('description', formData.description.trim());
        // fd.append('logo', formData.logo); // campo "logo" en el backend (multer)

        response = await fetch(`${API_BASE}/api/group-requests`, {
          method: 'POST',
          body: fd,
        });
      } else {
        // Enviar JSON
        console.log("ENTRANDO AQUÍ");
        console.log(formData.name.trim())
        response = await fetch(`${API_BASE}/api/group-requests`, {
          method: 'POST',
          body: JSON.stringify({
            user_id: userId,
            name: formData.name.trim(),
            goal: formData.objective.trim(),
            description: formData.description.trim(),
          }),
        });
      }

      if (!response.ok) {
        throw new Error('No se pudo crear la solicitud de grupo.');
      }

      const data = await response.json();
      // opcional: redirigir a detalle, limpiar form, etc.
      alert('¡Solicitud de grupo enviada con éxito!');
      // reset
      setFormData({ name: '', description: '', objective: '', logo: null });
      setStep(1);

    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al enviar la solicitud.');
    } finally {
      setSubmitting(false);
    }

    console.log("Enviando formulario:", formData);
    alert('¡Solicitud de grupo enviada! Revisa la consola.');
  };

  return (
    <main className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:block w-3/5 relative">
        <Image
          src="/PeopleForm.png"
          alt="Estudiantes colaborando en un grupo"
          fill
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
        <h1 className="text-4xl font-bold text-gray-800 mb-5 text-center">¡Felicidades! Estás dando el primer paso hacia tu comunidad</h1>

        <div className="max-w-3xl w-full">
          <div className="mb-8 flex items-center justify-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
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
                  />
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Descripción Corta</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={6}
                      placeholder="Una breve descripción que invite a los estudiantes a unirse."
                      value={formData.description}
                      onChange={handleInputChange}
                      className="resize-none block w-full rounded-md border-slate-300 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Detalles y Objetivos</h2>
                <div className="space-y-8">
                  <div>
                    <label htmlFor="objective" className="block text-sm font-medium text-slate-700 mb-1">Objetivo Principal</label>
                    <textarea
                      id="objective"
                      name="objective"
                      rows={10}
                      placeholder="¿Cuál es el propósito principal de este grupo? ¿Qué buscan lograr?"
                      value={formData.objective}
                      onChange={handleInputChange}
                      className="resize-none block w-full rounded-md border-slate-300 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Finalizar y Enviar</h2>
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-slate-700 mb-1">Logo del Grupo (Opcional)</label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-900/25 px-6 py-10">
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="mt-4 flex text-sm leading-6 text-slate-600">
                        <label
                          htmlFor="logo-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                        >
                          <span>Sube un archivo</span>
                          <input id="logo-upload" name="logo" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" />
                        </label>
                        <p className="pl-1">o arrástralo aquí</p>
                      </div>
                      <p className="text-xs leading-5 text-slate-500">PNG, JPG hasta 2MB</p>
                    </div>
                  </div>
                  {formData.logo && <p className="mt-2 text-sm text-green-600 text-center">Archivo seleccionado: {formData.logo.name}</p>}
                </div>
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
                  {submitting ? 'Enviando…' : <>Enviar Solicitud <Send size={16} /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}