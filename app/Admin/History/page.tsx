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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader title={pageHeader.title} subtitle={pageHeader.subtitle} />
        <TabNavigation tabs={tabs} onTabChange={setActiveTab} />
        
        <FilterComponent />

        {activeTab === 0 ? <ReservationSection /> : <EventSection />}
      </div>
    </div>
  );
}
