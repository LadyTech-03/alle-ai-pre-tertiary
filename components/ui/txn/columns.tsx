"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gem, Users, RefreshCcw, Wallet, CreditCard, Download, ExternalLink, ReceiptText } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Transaction, Invoice } from "@/lib/types"

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'subscription':
      return <Gem className="h-4 w-4" />
    case 'referral':
      return <Users className="h-4 w-4" />
    case 'refund':
      return <RefreshCcw className="h-4 w-4" />
    default:
      return null
  }
}

const getModeIcon = (mode: string) => {
  switch (mode) {
    case 'platform':
      return <Wallet className="h-4 w-4 text-primary" />
    case 'card':
      return <CreditCard className="h-4 w-4 text-blue-500" />
    default:
      return null
  }
}

// Invoice columns for real invoice data
export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "created",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created"))
      return (
        <div className="flex flex-col">
          <span className="text-sm">{format(date, 'MMM d, yyyy')}</span>
          <span className="text-xs text-muted-foreground">
            {format(date, 'h:mm a')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "number",
    header: "Invoice #",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ReceiptText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-mono">{row.getValue("number")}</span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      const billingReason = row.original.billing_reason
      const displayText = description || billingReason || "Subscription payment"
      return (
        <span className="text-sm truncate block max-w-[200px]">
          {displayText}
        </span>
      )
    },
  },
  {
    accessorKey: "amount_due",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount_due") as number
      const currency = row.original.currency
      return (
        <span className="font-medium text-green-500">
          {currency} {amount.toFixed(2)}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="flex justify-center">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
              status === 'open' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
              status === 'void' ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' :
              'bg-red-500/10 text-red-500 border-red-500/20'
            )}
          >
            {status}
          </Badge>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const invoice = row.original
      return (
        <div className="flex items-center gap-2">
          {invoice.hosted_invoice_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          {invoice.invoice_pdf && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(invoice.invoice_pdf, '_blank')}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    },
  },
]

// Legacy transaction columns (keeping for backward compatibility)
export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as Date
      return (
        <div className="flex flex-col">
          <span className="text-sm">{format(date, 'MMM d, yyyy')}</span>
          <span className="text-xs text-muted-foreground">
            {format(date, 'h:mm a')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1 rounded-full",
            type === 'subscription' ? 'bg-primary/10' :
            type === 'referral' ? 'bg-green-500/10' :
            'bg-blue-500/10'
          )}>
            {getTypeIcon(type)}
          </div>
          <span className="capitalize text-sm">{type}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className=" text-sm truncate block max-w-[200px]">
        {row.getValue("description")}
      </span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.getValue("plan") as string
      return plan ? (
        <Badge variant="secondary" className="font-bold">
          {plan}
        </Badge>
      ) : null
    },
  },
  {
    accessorKey: "mode",
    header: "Payment Method",
    cell: ({ row }) => {
      const mode = row.getValue("mode") as string
      const transaction = row.original
      return (
        <div className="flex items-center gap-2">
          {getModeIcon(mode)}
          <span className="text-sm">
            {mode === 'platform' ? 'Referral' : 
             transaction.paymentMethod || 'Card'}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      return (
        <span className={cn(
          "font-medium",
          amount < 0 ? "text-red-500" : "text-green-500"
        )}>
          {amount < 0 ? "-" : "+"}£{Math.abs(amount).toFixed(2)}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="flex justify-center">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
              status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
              'bg-red-500/10 text-red-500 border-red-500/20'
            )}
          >
            {status}
          </Badge>
        </div>
      )
    },
  },
]