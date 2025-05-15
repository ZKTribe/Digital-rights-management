"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, FileText, ImageIcon, Music, Video, MoreVertical, Download, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock licenses data
const licenses = [
  {
    id: "license1",
    contentId: "content1",
    contentTitle: "Digital Art Collection Vol. 1",
    contentType: "image",
    thumbnail: "/placeholder.svg?height=60&width=60",
    licenseType: "Personal",
    issuedTo: "John Smith",
    issuedToWallet: "0x3F5CE5FBFe3ddAB1Fa1f5Ef961a287d8Fb9f3c6",
    issueDate: "2023-10-15",
    expiryDate: "2024-10-15",
    status: "active",
    price: "$49.99",
    rights: ["Personal use", "Non-commercial", "Single user"],
  },
  {
    id: "license2",
    contentId: "content2",
    contentTitle: "Music Production Course",
    contentType: "video",
    thumbnail: "/placeholder.svg?height=60&width=60",
    licenseType: "Commercial",
    issuedTo: "Acme Corporation",
    issuedToWallet: "0x7A1BaDxF62aCe6A1Ca9f987D9c93d9dB3A2Bab2",
    issueDate: "2023-09-22",
    expiryDate: "2025-09-22",
    status: "active",
    price: "$199.99",
    rights: ["Commercial use", "Multiple projects", "Single business"],
  },
  {
    id: "license3",
    contentId: "content3",
    contentTitle: "Stock Photo Bundle",
    contentType: "image",
    thumbnail: "/placeholder.svg?height=60&width=60",
    licenseType: "Extended",
    issuedTo: "Creative Agency LLC",
    issuedToWallet: "0xfDx2Ebx2Ad4B2Db7Ef32Faf16a3B7A6Ea5b2Daa",
    issueDate: "2023-08-10",
    expiryDate: "2028-08-10",
    status: "active",
    price: "$299.99",
    rights: ["Commercial use", "Unlimited projects", "Resale rights"],
  },
  {
    id: "license4",
    contentId: "content4",
    contentTitle: "Premium Video Templates",
    contentType: "video",
    thumbnail: "/placeholder.svg?height=60&width=60",
    licenseType: "Personal",
    issuedTo: "Jane Doe",
    issuedToWallet: "0xC4aF6Fc4Ccc0E4Cc2F20Ccb9b2Bd18C1Db9Dd4",
    issueDate: "2023-07-05",
    expiryDate: "2024-07-05",
    status: "active",
    price: "$39.99",
    rights: ["Personal use", "Non-commercial", "Single user"],
  },
  {
    id: "license5",
    contentId: "content5",
    contentTitle: "Ambient Music Pack",
    contentType: "audio",
    thumbnail: "/placeholder.svg?height=60&width=60",
    licenseType: "Commercial",
    issuedTo: "Indie Game Studio",
    issuedToWallet: "0x3F5CE5FBFe3ddAB1Fa1f5Ef961a287d8Fb9f3c6",
    issueDate: "2023-06-18",
    expiryDate: "2025-06-18",
    status: "active",
    price: "$149.99",
    rights: ["Commercial use", "Multiple projects", "Single business"],
  },
  {
    id: "license6",
    contentId: "content6",
    contentTitle: "Business Proposal Template",
    contentType: "document",
    thumbnail: "/placeholder.svg?height=60&width=60",
    licenseType: "Personal",
    issuedTo: "Startup Founder",
    issuedToWallet: "0x7A1BaDxF62aCe6A1Ca9f987D9c93d9dB3A2Bab2",
    issueDate: "2023-05-30",
    expiryDate: "2024-05-30",
    status: "expired",
    price: "$29.99",
    rights: ["Personal use", "Non-commercial", "Single user"],
  },
]

const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
}

export default function LicensesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter licenses based on search query and active tab
  const filteredLicenses = licenses.filter((license) => {
    const matchesSearch =
      license.contentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.issuedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.licenseType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && license.status === "active") ||
      (activeTab === "expired" && license.status === "expired")

    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Licenses</h1>
        <Button asChild>
          <Link href="/licenses/create">Create New License</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search licenses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Licenses</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredLicenses.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No licenses found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>License Type</TableHead>
                  <TableHead>Issued To</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => (
                  <TableRow key={license.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={license.thumbnail || "/placeholder.svg"}
                            alt={license.contentTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">
                            <Link href={`/content/${license.contentId}`} className="hover:underline">
                              {license.contentTitle}
                            </Link>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1 mt-1">
                            {contentTypeIcons[license.contentType]}
                            <span className="text-xs">{license.contentType}</span>
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{license.licenseType}</TableCell>
                    <TableCell>
                      <div>
                        <div>{license.issuedTo}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {license.issuedToWallet.substring(0, 6)}...
                          {license.issuedToWallet.substring(license.issuedToWallet.length - 4)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{license.issueDate}</TableCell>
                    <TableCell>{license.expiryDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={license.status === "active" ? "default" : "secondary"}
                        className={
                          license.status === "expired"
                            ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            : ""
                        }
                      >
                        {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{license.price}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/licenses/${license.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Certificate
                          </DropdownMenuItem>
                          {license.status === "active" && <DropdownMenuItem>Renew License</DropdownMenuItem>}
                          {license.status === "expired" && <DropdownMenuItem>Reactivate</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
