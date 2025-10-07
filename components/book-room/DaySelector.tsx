// components/book-room/DaySelector.tsx
'use client';

import { useMemo } from 'react';

interface DayOption {
  value: string; // Formato YYYY-MM-DD
  label: string; // "Hoy" o "Mar 17"
  dayName: string; // "Martes"
}

interface DaySelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

// Función para generar los próximos días hábiles
const getNextWeekdays = (): DayOption[] => {
  const weekdays: DayOption[] = [];
  const currentDate = new Date();

  while (weekdays.length < 7) {
    const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 6 = Sábado

    // Si no es Sábado ni Domingo
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const isToday = weekdays.length === 0;
      const isTomorrow = weekdays.length === 1 && new Date().getDate() + 1 === currentDate.getDate();

      const label = isToday ? "Hoy" : isTomorrow ? "Mañana" : new Intl.DateTimeFormat('es-ES', { month: 'short', day: 'numeric' }).format(currentDate);

      weekdays.push({
        value: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
        label: label.charAt(0).toUpperCase() + label.slice(1),
        dayName: new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(currentDate),
      });
    }
    // Pasamos al siguiente día
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return weekdays;
};


export const DaySelector = ({ selectedDate, onDateChange }: DaySelectorProps) => {
  // useMemo para que la función no se recalcule en cada render, solo una vez.
  const availableDays = useMemo(() => getNextWeekdays(), []);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Selecciona un día
      </label>
      <div className="flex flex-wrap gap-2">
        {availableDays.map((day) => (
          <button
            key={day.value}
            onClick={() => onDateChange(day.value)}
            className={`flex flex-col items-center justify-center rounded-lg border px-4 py-2 text-center transition-colors duration-200 ${
              selectedDate === day.value
                ? 'border-amber-700 bg-brand-primary text-blue shadow'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="font-bold">{day.label}</span>
            <span className="text-xs opacity-80">{day.dayName.charAt(0).toUpperCase() + day.dayName.slice(1)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};