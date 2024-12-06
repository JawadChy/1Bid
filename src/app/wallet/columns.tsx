"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"

export type Transaction = {
  id: string
  type: 'PURCHASE' | 'SALE' | 'DEPOSIT' | 'WITHDRAWAL' | 'BID_WIN' | 'OFFER_ACCEPTED'
  // pos includes sale, and dep only.
  description: string
  amount: number
  created_at: string
}

const isPositiveTransaction = (type: string): boolean => {
  return ['DEPOSIT', 'SALE'].includes(type);
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "type",
    header: "Transaction",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      
      return (
        <div className="flex items-center gap-2">
          {isPositiveTransaction(type) ? (
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="capitalize">{type.toLowerCase().replace('_', ' ')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      const amount = row.getValue("amount") as number
      const isPositive = isPositiveTransaction(type)
      
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
      
      return (
        <div className={isPositive ? "text-green-600" : "text-red-600"}>
          {isPositive ? '+' : '-'}{formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
]