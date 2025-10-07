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


const userDummy = {
  auth0_id: '',
  email: 'dummy@uc.cl',
  hashed_password: '',
  first_name: 'nombre',
  last_name: 'apellido',
  role: 'STUDENT',
  is_representative: false,
  is_moderator: false,
  strikes: 0
};


// 1. ESQUEMA DE VALIDACIÓN CON ZOD
const registerSchema = z.object({
  firstName: z.string()
    .min(1, { message: "El nombre es requerido." })
    .max(50, { message: "El nombre no puede exceder los 50 caracteres." })
    .regex(/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/, { message: "El nombre solo puede contener letras y espacios." }),
  lastName: z.string()
    .min(1, { message: "El apellido es requerido." })
    .max(50, { message: "El apellido no puede exceder los 50 caracteres." })
    .regex(/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/, { message: "El apellido solo puede contener letras y espacios." }),
  major: z.string()
    .min(1, { message: "La carrera es requerida." })
    .max(60, { message: "La carrera no puede exceder los 60 caracteres." })
    .regex(/^[a-zA-Z\sñÑáéíóúÁÉÍÓÚüÜ]*$/, { message: "La carrera solo puede contener letras y espacios." }),
  phone: z.string()
    .regex(/^(\+)?\d*$/, { message: "El teléfono solo puede contener números y un '+' al inicio." })
    .optional()
    .or(z.literal('')),
  email: z.string()
    .min(1, { message: "El correo es requerido." })
    .email({ message: "Debe ser un formato de correo válido." })
    .refine((email) => email.endsWith('@uc.cl'), { message: "El correo debe ser institucional (@uc.cl)." }),
  confirmEmail: z.string()
    .min(1, { message: "Debes confirmar tu correo." }),
  password: z.string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
    .max(100, { message: "La contraseña no puede exceder los 100 caracteres." }),
  confirmPassword: z.string()
    .min(1, { message: "Debes confirmar tu contraseña." })
}).refine((data) => data.email === data.confirmEmail, {
  message: "Los correos electrónicos no coinciden.",
  path: ["confirmEmail"],
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    // resolver: zodResolver(registerSchema),
  });
  const { user, error, isLoading } = useUser();
  const [token, setToken] = useState<string | null>(null);
  
  const emailValue = watch('email');
  const confirmEmailValue = watch('confirmEmail');
  const emailsMatch = emailValue === confirmEmailValue && (confirmEmailValue?.length ?? 0) > 0;

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');
  const passwordsMatch = passwordValue === confirmPasswordValue && (confirmPasswordValue?.length ?? 0) > 0;

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    console.log("Formulario válido, enviando datos:", userDummy);
    try {
      userDummy.email = user?.email || '';
      userDummy.auth0_id = user?.sub || '';
      const response = await fetch('http://localhost:3003/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userDummy)
      });
      if (response.ok) {
        alert('¡Registro exitoso! Revisa la consola para ver los datos.');
        window.location.href = '/ProfileSSR';
      } else {
        console.error('Error en la respuesta del servidor:', response.statusText);
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
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
    if (e.key === '+' && target.value.length > 0) { e.preventDefault(); return; }
    if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End', '+'].includes(e.key)) return;
    if (!/\d/.test(e.key)) e.preventDefault();
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const accessToken = await getAccessToken();
        setToken(accessToken);
        console.log('Access Token obtenido:', accessToken);
      } catch (err) {
        console.error('Error obteniendo el token de acceso:', err);
      }
    }
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
          <h1 className="text-2xl font-bold text-brand-dark">Crea tu cuenta</h1>
          <p className="mt-2 text-slate-600">Únete a la comunidad y simplifica tu vida universitaria.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
            <div>
              <Input id="firstName" label="Nombre(s)" type="text" {...register('firstName')} onKeyDown={handleKeyDownLettersOnly} />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <Input id="lastName" label="Apellido(s)" type="text" {...register('lastName')} onKeyDown={handleKeyDownLettersOnly} />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <Input id="major" label="Carrera" type="text" placeholder="Ej: Ingeniería de Software" {...register('major')} onKeyDown={handleKeyDownLettersOnly} />
            {errors.major && <p className="mt-1 text-sm text-red-600">{errors.major.message}</p>}
          </div>
          <div>
            <Input id="phone" label="Número de Teléfono (Opcional)" type="tel" placeholder="+56 9 1234 5678" {...register('phone')} onKeyDown={handleKeyDownNumbersOnly} />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <hr className="!my-6 border-slate-200" />
          
          <div>
            <Input id="email" label="Correo Institucional (@uc.cl)" type="email" placeholder="tu.nombre@uc.cl" {...register('email')} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <Input 
              id="confirmEmail" 
              label="Confirmar Correo Institucional" 
              type="email" 
              placeholder="tu.nombre@uc.cl" 
              {...register('confirmEmail')}
              onCopy={preventCopyPaste}
              onPaste={preventCopyPaste}
              onCut={preventCopyPaste}
            />
            {errors.confirmEmail && <p className="mt-1 text-sm text-red-600">{errors.confirmEmail.message}</p>}
            {emailsMatch && !errors.confirmEmail && <p className="mt-1 text-sm text-green-600">Los correos coinciden.</p>}
          </div>
          
          <hr className="!my-6 border-slate-200" />

          <div>
            <Input id="password" label="Contraseña" type="password" {...register('password')} />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <Input 
              id="confirmPassword" 
              label="Confirmar Contraseña" 
              type="password" 
              {...register('confirmPassword')}
              onCopy={preventCopyPaste}
              onPaste={preventCopyPaste}
              onCut={preventCopyPaste}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            {passwordsMatch && !errors.confirmPassword && <p className="mt-1 text-sm text-green-600">Las contraseñas coinciden.</p>}
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

        <p className="mt-8 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/LogIn" className="font-medium text-brand-primary hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </main>
  );
}