'use client';

import Link from 'next/link';

export const GroupRequestCard = ({ title, subtitle, id }: { title: string; subtitle: string; id: string }) => (
  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
    <div>
      <h4 className="font-medium text-gray-800 text-sm">{title}</h4>
      <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
    </div>
    <Link
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      href={`/Admin/Groups?groupId=${id}`}
    >
      Revisar
    </Link>
  </div>
);
