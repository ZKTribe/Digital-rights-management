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
          
            </TableBody>
          </Table>
        </CardContent>
      </Card>

  
    </div>
  );
}
