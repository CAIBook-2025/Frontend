"use client"

import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react"

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ")

interface TableCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function TableCard({ children, className, ...props }: TableCardProps) {
  return (
    <div
      className={cx("bg-white rounded-lg border border-gray-200 overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface TableScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function TableScrollArea({ children, className, ...props }: TableScrollAreaProps) {
  return (
    <div className={cx("overflow-x-auto", className)} {...props}>
      {children}
    </div>
  )
}

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cx("w-full", className)} {...props} />
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cx("bg-gray-50 border-b border-gray-200", className)} {...props} />
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cx("text-left py-3 px-4 font-medium text-gray-700 text-sm", className)}
      {...props}
    />
  )
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cx("border-b border-gray-100 hover:bg-gray-50", className)} {...props} />
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cx("py-4 px-4 text-sm text-gray-700", className)} {...props} />
}
