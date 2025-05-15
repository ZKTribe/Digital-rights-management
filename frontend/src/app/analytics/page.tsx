"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, Calendar, TrendingUp, Eye, DownloadIcon, CreditCard } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AnalyticsPage() {
  const [timePeriod, setTimePeriod] = useState("month")
  const [contentFilter, setContentFilter] = useState("all")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Tabs value={timePeriod} onValueChange={setTimePeriod}>
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="quarter">This Quarter</TabsTrigger>
            <TabsTrigger value="year">This Year</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={contentFilter} onValueChange={setContentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by content" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,249</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 font-medium">+12.5%</span>
              <span className="text-xs text-muted-foreground ml-1">vs. previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,024</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 font-medium">+8.3%</span>
              <span className="text-xs text-muted-foreground ml-1">vs. previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">License Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 font-medium">+15.2%</span>
              <span className="text-xs text-muted-foreground ml-1">vs. previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,750.00</div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 font-medium">+18.7%</span>
              <span className="text-xs text-muted-foreground ml-1">vs. previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Views & Downloads Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Time series chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Content Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Pie chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Content</th>
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      Views
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center">
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      Downloads
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">Licenses</th>
                  <th className="text-left py-3 px-4">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-1" />
                      Revenue
                    </div>
                  </th>
                  <th className="text-left py-3 px-4">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 mr-3">
                        <img src="/placeholder.svg?height=32&width=32" alt="" />
                      </div>
                      <span>Music Production Course</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">3,200</td>
                  <td className="py-3 px-4">320</td>
                  <td className="py-3 px-4">45</td>
                  <td className="py-3 px-4">$4,750.00</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="font-medium">14.1%</span>
                      <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 mr-3">
                        <img src="/placeholder.svg?height=32&width=32" alt="" />
                      </div>
                      <span>Digital Art Collection Vol. 1</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">1,250</td>
                  <td className="py-3 px-4">85</td>
                  <td className="py-3 px-4">12</td>
                  <td className="py-3 px-4">$1,450.00</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="font-medium">9.6%</span>
                      <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 mr-3">
                        <img src="/placeholder.svg?height=32&width=32" alt="" />
                      </div>
                      <span>Stock Photo Bundle</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">980</td>
                  <td className="py-3 px-4">210</td>
                  <td className="py-3 px-4">28</td>
                  <td className="py-3 px-4">$2,100.00</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="font-medium">13.3%</span>
                      <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 mr-3">
                        <img src="/placeholder.svg?height=32&width=32" alt="" />
                      </div>
                      <span>Premium Video Templates</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">1,800</td>
                  <td className="py-3 px-4">150</td>
                  <td className="py-3 px-4">32</td>
                  <td className="py-3 px-4">$3,200.00</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="font-medium">21.3%</span>
                      <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 mr-3">
                        <img src="/placeholder.svg?height=32&width=32" alt="" />
                      </div>
                      <span>Ambient Music Pack</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">750</td>
                  <td className="py-3 px-4">120</td>
                  <td className="py-3 px-4">18</td>
                  <td className="py-3 px-4">$1,800.00</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="font-medium">15.0%</span>
                      <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">World map will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Demographics chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
