"use client"

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { TabNavigation } from "@/components/ui/tab-navigation";
import { FilterComponent } from "@/components/ui/admin/history/filter-search";

const pageHeader = {
    title: "Historial",
    subtitle: "Ver datos históricos",
};

export default function HistoryPage() {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = [
        { label: "Salas", active: activeTab === 0 },
        { label: "Eventos", active: activeTab === 1 }
    ];
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <PageHeader title={pageHeader.title} subtitle={pageHeader.subtitle} />
                <TabNavigation tabs={tabs} onTabChange={setActiveTab} />

                <FilterComponent />
            </div>
        </div>
    );
}
