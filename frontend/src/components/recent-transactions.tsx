"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Transaction type definition
interface Transaction {
  id: string;
  walletAddress: string;
  contentTitle: string;
  amount: number | string;
  date: string;
  status: string;
}

// Mock transaction data
const transactions: Transaction[] = [];

export default function RecentTransactions() {
  const [page, setPage] = useState(1)
  const pageSize = 4
  const totalPages = Math.ceil(transactions.length / pageSize)

  const paginatedTransactions = transactions.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Wallet Address</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedTransactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-mono text-sm">
                {tx.walletAddress.substring(0, 6)}...{tx.walletAddress.substring(tx.walletAddress.length - 4)}
              </TableCell>
              <TableCell>{tx.contentTitle}</TableCell>
              <TableCell>{tx.amount}</TableCell>
              <TableCell>{tx.date}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {tx.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="text-sm">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      )}
    </div>
  )
}
