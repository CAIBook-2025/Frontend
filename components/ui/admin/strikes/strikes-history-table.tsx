"use client";

import {
  Table,
  TableCard,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableScrollArea,
} from "@/components/ui/shared/table";
import { STRIKE_TYPE_METADATA } from "@/components/ui/admin/strikes/constants";
import type { Strike } from "@/types/strikes";

interface StrikeHistoryTableProps {
  strikes: Strike[];
}

export function StrikeHistoryTable({ strikes }: StrikeHistoryTableProps) {
  return (
    <TableCard>
      <TableScrollArea>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Usuario</TableHeaderCell>
              <TableHeaderCell>Tipo</TableHeaderCell>
              <TableHeaderCell>Razón</TableHeaderCell>
              <TableHeaderCell>Aplicado por</TableHeaderCell>
              <TableHeaderCell>Fecha</TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {strikes.map((strike) => (
              <TableRow key={strike.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{strike.userName}</p>
                    <p className="text-xs text-gray-500 mt-1">{strike.userEmail}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      STRIKE_TYPE_METADATA[strike.type].badgeClass
                    }`}
                  >
                    {STRIKE_TYPE_METADATA[strike.type].label}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{strike.reason}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{strike.appliedBy}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{strike.date}</div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableScrollArea>
    </TableCard>
  );
}
