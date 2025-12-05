// app/my-reservations/page.tsx
import { MyReservationsView } from "@/components/dashboard/MyReservationView";

export default function MyReservationsPage() {
  return (
    // Este `container mx-auto` es ahora la única fuente de verdad para el ancho
    <main className="container mx-auto px-6 py-8">
        

        {/* El componente ahora se adaptará perfectamente al contenedor */}
        <MyReservationsView />
    </main>
  );
}