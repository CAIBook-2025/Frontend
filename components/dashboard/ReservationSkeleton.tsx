// app/components/skeletons/ReservationSkeleton.tsx

export const ReservationSkeleton = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex animate-pulse justify-between items-start">
        <div>
          {/* Skeleton para el título */}
          <div className="h-6 w-48 bg-slate-200 rounded"></div>
          {/* Skeleton para la ubicación */}
          <div className="h-4 w-32 bg-slate-200 rounded mt-2"></div>
        </div>
        {/* Skeleton para el status badge */}
        <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4 space-y-3 animate-pulse">
        {/* Skeleton para la fecha */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-slate-200 rounded"></div>
          <div className="h-4 w-40 bg-slate-200 rounded"></div>
        </div>
        {/* Skeleton para la hora */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-slate-200 rounded"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
      
      <div className="mt-4 text-right animate-pulse">
        {/* Skeleton para el botón de cancelar */}
        <div className="h-5 w-28 bg-slate-200 rounded ml-auto"></div>
      </div>
    </div>
  );
};