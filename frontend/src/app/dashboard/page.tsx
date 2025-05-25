import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, LineChart } from "@/components/charts"
import { Upload, CopyrightIcon, DollarSign, ShoppingCart } from "lucide-react"
import RecentTransactions from "@/components/recent-transactions"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Content
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-green-100 dark:bg-green-900/20 h-[150px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">12</span>
              <span className="text-sm text-muted-foreground">Total Uploads</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-100 dark:bg-yellow-900/20 h-[150px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Licenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">32</span>
              <span className="text-sm text-muted-foreground">Total Licenses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-100 dark:bg-blue-900/20 h-[150px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">$50,420</span>
              <span className="text-sm text-muted-foreground">Total Earnings</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Content
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/licenses">
                <CopyrightIcon className="mr-2 h-4 w-4" />
                Manage Licenses
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/earnings">
                <DollarSign className="mr-2 h-4 w-4" />
                View Earnings
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/marketplace">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Browse Marketplace
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactions />
        </CardContent>
      </Card>
    </div>
  )
}
