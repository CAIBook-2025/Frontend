'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { School, Loader2 } from 'lucide-react'; // Importamos un ícono de carga

// Aunque es un componente de cliente, podemos exportar metadata estática
// (Esta es una característica más avanzada, pero es bueno saberla)
// Para que funcione correctamente, necesitarías ponerla en un archivo layout.tsx dentro de /login
// Por ahora, la dejamos comentada como referencia.
/*
export const metadata: Metadata = {
  title: "Iniciar Sesión - CAIBook",
  description: "Accede a tu cuenta de CAIBook.",
};
*/

// 1. ESQUEMA DE VALIDACIÓN PARA EL LOGIN (más simple)
const loginSchema = z.object({
  email: z.string()
    .min(1, { message: "El correo es requerido." })
    .email({ message: "Debe ser un formato de correo válido." })
    .refine((email) => email.endsWith('@uc.cl'), { message: "El correo debe ser institucional (@uc.cl)." }),
  password: z.string()
    .min(1, { message: "La contraseña es requerida." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

// 2. FUNCIÓN DE SIMULACIÓN DE API
// Esta función simula una llamada a tu backend.
const fakeApiLogin = (data: LoginFormData): Promise<{ token: string; role: string }> => {
  return new Promise((resolve, reject) => {
    // Simulamos un retraso de red de 1.5 segundos
    setTimeout(() => {
      // Simulamos un 70% de probabilidad de éxito
      if (Math.random() < 0.7) {
        // Éxito: devolvemos un token falso y un rol
        resolve({
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikp1YW4gUGVyZXoiLCJpYXQiOjE1MTYyMzkwMjJ9.fake_jwt_signature",
          role: "student", // Podría ser 'student' o 'admin'
        });
      } else {
        // Fracaso: rechazamos la promesa con un mensaje de error
        reject(new Error("Credenciales inválidas"));
      }
    }, 1500);
  });
};




export default function LoginPage() {

  const router = useRouter();
  // 3. ESTADOS PARA MANEJAR LA UI
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 4. LÓGICA DE ENVÍO ACTUALIZADA
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true); // Ponemos el botón en estado de carga
    setApiError(null);  // Reseteamos cualquier error anterior

    try {
      // Llamamos a nuestra función de simulación
      const response = await fakeApiLogin(data);
      
      console.log("Login exitoso:", response);
      // Aquí guardarías el token (ej. en cookies o en el estado global)
      
      // Redirigimos al Dashboard
      router.push('/Student');

    } catch (error) {
      // Si la promesa fue rechazada (login fallido)
      console.error("Error en el login:", error);
      setApiError("El correo o la contraseña son incorrectos. Por favor, intenta de nuevo.");
    
    } finally {
      // Esto se ejecuta siempre, tanto en éxito como en fracaso
      setIsLoading(false); // Quitamos el estado de carga del botón
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-light p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        {/* Encabezado del Formulario */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <School className="h-10 w-10 text-brand-primary" />
            <span className="text-3xl font-bold text-brand-dark">CAIBook</span>
          </Link>
          <h1 className="text-2xl font-bold text-brand-dark">
            Bienvenido de vuelta
          </h1>
          <p className="mt-2 text-slate-600">
            Ingresa tus credenciales para acceder a la plataforma.
          </p>
        </div>

        {/* Mensaje de error de la API */}
        {apiError && (
          <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-800">
            {apiError}
          </div>
        )}


        {/* Formulario de Login */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div>
            <Input 
              id="email" 
              label="Correo Institucional (@uc.cl)" 
              type="email" 
              autoComplete="email"
              {...register('email')} 
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <Input 
              id="password" 
              label="Contraseña" 
              type="password" 
              autoComplete="current-password"
              {...register('password')} 
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          {/* Opcional: Enlace para recuperar contraseña */}
          <div className="text-right text-sm">
            <Link href="/forgot-password" className="font-medium text-brand-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div>
            {/* 5. BOTÓN INTELIGENTE */}
            <button
              type="submit"
              disabled={isLoading} // Deshabilitamos el botón mientras carga
              className="w-full flex justify-center rounded-md bg-slate-600 px-4 py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" /> // Mostramos el ícono girando
              ) : (
                'Iniciar Sesión' // Mostramos el texto normal
              )}
            </button>
          </div>
        </form>

        {/* Enlace a Registro */}
        <p className="mt-8 text-center text-sm text-slate-600">
          ¿No tienes una cuenta?{' '}
          <Link href="/Register" className="font-medium text-brand-primary hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}