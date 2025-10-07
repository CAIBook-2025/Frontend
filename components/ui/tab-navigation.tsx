"use client"

interface TabNavigationProps {
  tabs: Array<{
    label: string
    count?: number
    active?: boolean
  }>
  onTabChange: (index: number) => void
}

export const TabNavigation = ({ tabs, onTabChange }: TabNavigationProps) => {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="inline-flex rounded-full bg-slate-100 p-1">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => onTabChange(index)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              tab.active ? "bg-white shadow text-blue-600" : "text-slate-600 hover:text-blue-600"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && ` (${tab.count})`}
          </button>
        ))}
      </div>
    </div>
  )
}

