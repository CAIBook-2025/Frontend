// app/register/page.tsx
'use client';

import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { School } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0';
import { getAccessToken } from '@auth0/nextjs-auth0';
import React, { useEffect, useState } from 'react';

// 1. ESQUEMA DE VALIDACIÓN CON ZOD
const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: 'El nombre es requerido.' })
    .max(50, { message: 'El nombre no puede exceder los 50 caracteres.' })
    .regex(/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/, { message: 'El nombre solo puede contener letras y espacios.' }),
  lastName: z
    .string()
    .min(1, { message: 'El apellido es requerido.' })
    .max(50, { message: 'El apellido no puede exceder los 50 caracteres.' })
    .regex(/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/, { message: 'El apellido solo puede contener letras y espacios.' }),
  career: z
    .string()
    .min(1, { message: 'La carrera es requerida.' })
    .max(60, { message: 'La carrera no puede exceder los 60 caracteres.' })
    .regex(/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/, { message: 'La carrera solo puede contener letras y espacios.' }),
  phone: z
    .string()
    .min(1, { message: 'El número de teléfono es requerido.' })
    .regex(/^(\+)?\d*$/, { message: "El teléfono solo puede contener números y un '+' al inicio." }),
  studentNumber: z.string().min(1, { message: 'El número de estudiante es requerido.' }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const { user, error, isLoading } = useUser();
  const [token, setToken] = useState<string | null>(null);

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    try {
      const userData = {
        auth0_id: user?.sub || '',
        email: user?.email || '',
        hashed_password: '',
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || null,
        career: data.career,
        student_number: data.studentNumber || null,
      };

      const response = await fetch('http://localhost:3003/api/users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        alert('¡Registro exitoso!');
        window.location.href = '/ProfileSSR';
      } else {
        console.error('Error en la respuesta del servidor:', response.statusText);
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
    }
  };

  const preventCopyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const handleKeyDownLettersOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End', ' '].includes(e.key)) return;
    if (/\d/.test(e.key)) e.preventDefault();
  };

  const handleKeyDownNumbersOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (e.key === '+' && target.value.length > 0) {
      e.preventDefault();
      return;
    }
    if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End', '+'].includes(e.key)) return;
    if (!/\d/.test(e.key)) e.preventDefault();
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getAccessToken();
        setToken(accessToken);
      } catch (err) {
        console.error('Error obteniendo el token de acceso:', err);
      }
    };
    fetchToken();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-light p-4 py-12">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <School className="h-10 w-10 text-brand-primary" />
            <span className="text-3xl font-bold text-brand-dark">CAIBook</span>
          </Link>
          <h1 className="text-2xl font-bold text-brand-dark">Completa tu perfil</h1>
          <p className="mt-2 text-slate-600">Proporciona la información necesaria para tu cuenta.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            <div>
              <Input
                id="firstName"
                label="Nombre(s)"
                type="text"
                {...register('firstName')}
                onKeyDown={handleKeyDownLettersOnly}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <Input
                id="lastName"
                label="Apellido(s)"
                type="text"
                {...register('lastName')}
                onKeyDown={handleKeyDownLettersOnly}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <Input
              id="career"
              label="Carrera"
              type="text"
              placeholder="Ej: Ingeniería de Software"
              {...register('career')}
              onKeyDown={handleKeyDownLettersOnly}
            />
            {errors.career && <p className="mt-1 text-sm text-red-600">{errors.career.message}</p>}
          </div>
          <div>
            <Input
              id="phone"
              label="Número de Teléfono"
              type="tel"
              placeholder="+56 9 1234 5678"
              {...register('phone')}
              onKeyDown={handleKeyDownNumbersOnly}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>
          <div>
            <Input
              id="studentNumber"
              label="Número de Alumno"
              type="text"
              placeholder="Ej: 12345678"
              {...register('studentNumber')}
              onKeyDown={handleKeyDownNumbersOnly}
            />
            {errors.studentNumber && <p className="mt-1 text-sm text-red-600">{errors.studentNumber.message}</p>}
          </div>

          <div className="!mt-8">
            <button
              type="submit"
              className="w-full flex justify-center rounded-md bg-slate-600 px-4 py-3 font-semibold text-white shadow-sm transition-colors duration-300 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
