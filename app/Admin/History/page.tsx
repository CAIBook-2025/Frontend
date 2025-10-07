"use client"

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { TabNavigation } from "@/components/ui/tab-navigation";
import { FilterComponent } from "@/components/ui/admin/history/filter-search";
import { ReservationSection } from "@/components/ui/admin/history/reservation-section";
import { EventSection } from "@/components/ui/admin/history/events-section";

const pageHeader = {
  title: "Historial",
  subtitle: "Ver datos históricos",
};

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: "Salas", active: activeTab === 0 },
    { label: "Eventos", active: activeTab === 1 },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 md:py-12 space-y-10">
        <PageHeader title={pageHeader.title} subtitle={pageHeader.subtitle} />
        <TabNavigation tabs={tabs} onTabChange={setActiveTab} />

        <section>
          <FilterComponent />
        </section>

        <section>
          {activeTab === 0 ? <ReservationSection /> : <EventSection />}
        </section>
      </div>
    </main>
  );
}
