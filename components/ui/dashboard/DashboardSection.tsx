"use client"

import React from 'react'
import Link from 'next/link'

export const DashboardSection = ({
  title,
  buttonText,
  href,
  children,
}: {
  title: string
  buttonText: string
  href: string
  children: React.ReactNode
}) => (
  <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm border-l-blue-400 border-l-4`}>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <Link
        className="text-blue-600 hover:text-blue-700 text-sm font-medium border border-blue-200 hover:border-blue-300 px-4 py-2 rounded-lg transition-colors"
        href={href}
      >
        {buttonText}
      </Link>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
)