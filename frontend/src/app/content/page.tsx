"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  ImageIcon,
  Music,
  Video,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock content data
const mockContent = [
  {
    id: "content1",
    title: "Digital Art Collection Vol. 1",
    type: "image",
    thumbnail: "/placeholder.svg?height=200&width=300",
    uploadDate: "2023-11-15",
    views: 1250,
    downloads: 85,
    licenses: 12,
    revenue: "$1,450.00",
  },
  {
    id: "content2",
    title: "Music Production Course",
    type: "video",
    thumbnail: "/placeholder.svg?height=200&width=300",
    uploadDate: "2023-11-12",
    views: 3200,
    downloads: 320,
    licenses: 45,
    revenue: "$4,750.00",
  },
  {
    id: "content3",
    title: "Stock Photo Bundle",
    type: "image",
    thumbnail: "/placeholder.svg?height=200&width=300",
    uploadDate: "2023-11-10",
    views: 980,
    downloads: 210,
    licenses: 28,
    revenue: "$2,100.00",
  },
  {
    id: "content4",
    title: "Premium Video Templates",
    type: "video",
    thumbnail: "/placeholder.svg?height=200&width=300",
    uploadDate: "2023-11-08",
    views: 1800,
    downloads: 150,
    licenses: 32,
    revenue: "$3,200.00",
  },
  {
    id: "content5",
    title: "Ambient Music Pack",
    type: "audio",
    thumbnail: "/placeholder.svg?height=200&width=300",
    uploadDate: "2023-11-05",
    views: 750,
    downloads: 120,
    licenses: 18,
    revenue: "$1,800.00",
  },
  {
    id: "content6",
    title: "Business Proposal Template",
    type: "document",
    thumbnail: "/placeholder.svg?height=200&width=300",
    uploadDate: "2023-11-03",
    views: 450,
    downloads: 95,
    licenses: 8,
    revenue: "$800.00",
  },
]

const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
}

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [activeTab, setActiveTab] = useState("all")

  // Filter content based on search query and active tab
  const filteredContent = mockContent.filter((content) => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || content.type === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Content</h1>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Content
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search content..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Sort By</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Newest First</DropdownMenuItem>
              <DropdownMenuItem>Oldest First</DropdownMenuItem>
              <DropdownMenuItem>Most Viewed</DropdownMenuItem>
              <DropdownMenuItem>Most Revenue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </Button>

          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="image">Images</TabsTrigger>
          <TabsTrigger value="document">Documents</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No content found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((content) => (
            <Card key={content.id} className="overflow-hidden">
              <div className="relative h-40 bg-gray-100">
                <img
                  src={content.thumbnail || "/placeholder.svg"}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 left-2 flex items-center gap-1" variant="secondary">
                  {contentTypeIcons[content.type]}
                  {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white rounded-full h-8 w-8 p-1"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/content/${content.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/content/${content.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <Link href={`/content/${content.id}`} className="hover:underline">
                    {content.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Uploaded: {content.uploadDate}</span>
                  <span>{content.views} views</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{content.licenses}</span> licenses
                </div>
                <div className="text-green-600 font-medium">{content.revenue}</div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContent.map((content) => (
            <div key={content.id} className="flex border rounded-lg overflow-hidden">
              <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                <img
                  src={content.thumbnail || "/placeholder.svg"}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col flex-1 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      <Link href={`/content/${content.id}`} className="hover:underline">
                        {content.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {contentTypeIcons[content.type]}
                        {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">Uploaded: {content.uploadDate}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/content/${content.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/content/${content.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex gap-4 text-sm">
                    <span>{content.views} views</span>
                    <span>{content.downloads} downloads</span>
                    <span>{content.licenses} licenses</span>
                  </div>
                  <div className="text-green-600 font-medium">{content.revenue}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
