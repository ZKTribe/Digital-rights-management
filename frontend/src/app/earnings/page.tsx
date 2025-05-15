"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EarningsPage() {
  const [timePeriod, setTimePeriod] = useState("month");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Earnings</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <Tabs value={timePeriod} onValueChange={setTimePeriod}>
        <TabsList>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="quarter">This Quarter</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,750.00</div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="flex items-center font-medium text-green-500">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +12.5%
              </span>
              <span className="ml-1">from previous period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">License Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="flex items-center font-medium text-green-500">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +8.3%
              </span>
              <span className="ml-1">from previous period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$148.44</div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="flex items-center font-medium text-green-500">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +3.7%
              </span>
              <span className="ml-1">from previous period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$850.00</div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="flex items-center font-medium text-red-500">
                <ArrowDownRight className="mr-1 h-3 w-3" />
                -2.1%
              </span>
              <span className="ml-1">from previous period</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex h-80 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <p className="text-gray-500">
              Earnings chart will be displayed here
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">By Content Type</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Video</span>
                  </div>
                  <span className="text-sm font-medium">$2,150.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Image</span>
                  </div>
                  <span className="text-sm font-medium">$1,450.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Audio</span>
                  </div>
                  <span className="text-sm font-medium">$850.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Document</span>
                  </div>
                  <span className="text-sm font-medium">$300.00</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">By License Type</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-indigo-500"></div>
                    <span className="text-sm">Personal</span>
                  </div>
                  <span className="text-sm font-medium">$950.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-pink-500"></div>
                    <span className="text-sm">Commercial</span>
                  </div>
                  <span className="text-sm font-medium">$2,200.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Extended</span>
                  </div>
                  <span className="text-sm font-medium">$1,600.00</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Top Content</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-40 truncate text-sm">
                    Music Production Course
                  </span>
                  <span className="text-sm font-medium">$1,850.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="w-40 truncate text-sm">
                    Digital Art Collection
                  </span>
                  <span className="text-sm font-medium">$1,200.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="w-40 truncate text-sm">
                    Stock Photo Bundle
                  </span>
                  <span className="text-sm font-medium">$950.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="w-40 truncate text-sm">
                    Premium Video Templates
                  </span>
                  <span className="text-sm font-medium">$750.00</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-medium">Payment Methods</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Wallet Payments</span>
                  <span className="text-sm font-medium">$3,250.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Credit Card</span>
                  <span className="text-sm font-medium">$1,200.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">PayPal</span>
                  <span className="text-sm font-medium">$300.00</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>License Type</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2023-11-15</TableCell>
                <TableCell>Digital Art Collection Vol. 1</TableCell>
                <TableCell>Personal</TableCell>
                <TableCell>0x3F5C...9f3c6</TableCell>
                <TableCell>$49.99</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-11-12</TableCell>
                <TableCell>Music Production Course</TableCell>
                <TableCell>Commercial</TableCell>
                <TableCell>0x7A1B...2Bab2</TableCell>
                <TableCell>$199.99</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-11-10</TableCell>
                <TableCell>Stock Photo Bundle</TableCell>
                <TableCell>Extended</TableCell>
                <TableCell>0xfDx2...b2Daa</TableCell>
                <TableCell>$299.99</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-11-08</TableCell>
                <TableCell>Premium Video Templates</TableCell>
                <TableCell>Personal</TableCell>
                <TableCell>0xC4aF...9Dd4</TableCell>
                <TableCell>$49.99</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    Pending
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-11-05</TableCell>
                <TableCell>Ambient Music Pack</TableCell>
                <TableCell>Commercial</TableCell>
                <TableCell>0x3F5C...9f3c6</TableCell>
                <TableCell>$149.99</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2023-11-01</TableCell>
                <TableCell>$3,250.00</TableCell>
                <TableCell>0x3F5C...9f3c6</TableCell>
                <TableCell>0x8a7c...2f4d9</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-10-01</TableCell>
                <TableCell>$2,780.00</TableCell>
                <TableCell>0x3F5C...9f3c6</TableCell>
                <TableCell>0x6b2d...9a1e7</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-09-01</TableCell>
                <TableCell>$1,950.00</TableCell>
                <TableCell>0x3F5C...9f3c6</TableCell>
                <TableCell>0x4e9f...7c3b2</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    Completed
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
