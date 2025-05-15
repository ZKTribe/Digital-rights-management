"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Mock transaction data
const transactions = [
  {
    id: "tx1",
    walletAddress: "0x3F5CE5FBFe3ddAB1Fa1f5Ef961a287d8Fb9f3c6",
    amount: "$450.25",
    date: "2023-11-15",
    status: "completed",
    type: "license_purchase",
    contentTitle: "Digital Art Collection Vol. 1",
  },
  {
    id: "tx2",
    walletAddress: "0x7A1BaDxF62aCe6A1Ca9f987D9c93d9dB3A2Bab2",
    amount: "$750.50",
    date: "2023-11-12",
    status: "completed",
    type: "license_purchase",
    contentTitle: "Music Production Course",
  },
  {
    id: "tx3",
    walletAddress: "0xfDx2Ebx2Ad4B2Db7Ef32Faf16a3B7A6Ea5b2Daa",
    amount: "$225.75",
    date: "2023-11-10",
    status: "completed",
    type: "license_purchase",
    contentTitle: "Stock Photo Bundle",
  },
  {
    id: "tx4",
    walletAddress: "0xC4aF6Fc4Ccc0E4Cc2F20Ccb9b2Bd18C1Db9Dd4",
    amount: "$1,200.00",
    date: "2023-11-08",
    status: "completed",
    type: "license_purchase",
    contentTitle: "Premium Video Templates",
  },
]

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
