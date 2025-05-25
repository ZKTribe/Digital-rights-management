"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Type definition for content from database
interface ContentItem {
  id: string
  title: string
  description?: string
  ipfsHash: string
  creatorAddress: string
  contentType: string
  createdAt: string
  updatedAt: string
}

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
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // You'll need to get the creator address from your auth system
  // This is a placeholder - replace with your actual auth logic
  const [creatorAddress, setCreatorAddress] = useState<string | null>(null)

  useEffect(() => {
    // Replace this with your actual method of getting the user's wallet address
    // For example, from a context, localStorage, or auth provider
    const getUserAddress = async () => {
      // Placeholder logic - implement based on your auth system
      const address = localStorage.getItem('walletAddress') // or from context/auth
      setCreatorAddress(address)
    }
    
    getUserAddress()
  }, [])

  useEffect(() => {
    const fetchContent = async () => {
      if (!creatorAddress) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/content?creatorAddress=${encodeURIComponent(creatorAddress)}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch content')
        }
        
        const data = await response.json()
        setContent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [creatorAddress])

  // Filter content based on search query and active tab
  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || item.contentType === activeTab
    return matchesSearch && matchesTab
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Generate thumbnail URL from IPFS hash (you may need to adjust this based on your IPFS setup)
  const getThumbnailUrl = (ipfsHash: string) => {
    return `https://ipfs.io/ipfs/${ipfsHash}` // or your preferred IPFS gateway
  }

  if (!creatorAddress) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium">Wallet not connected</h3>
          <p className="text-gray-500">Please connect your wallet to view your content</p>
        </div>
      </div>
    )
  }

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
              <DropdownMenuItem>Title A-Z</DropdownMenuItem>
              <DropdownMenuItem>Title Z-A</DropdownMenuItem>
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading your content...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-red-600">Error loading content</h3>
          <p className="mt-1 text-gray-500">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No content found</h3>
          <p className="mt-1 text-gray-500">
            {content.length === 0 
              ? "Upload your first piece of content to get started" 
              : "Try adjusting your search or filters"
            }
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-40 bg-gray-100">
                <img
                  src={getThumbnailUrl(item.ipfsHash)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if IPFS image fails to load
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <Badge className="absolute top-2 left-2 flex items-center gap-1" variant="secondary">
                  {contentTypeIcons[item.contentType] || <FileText className="h-5 w-5" />}
                  {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
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
                      <Link href={`/content/${item.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(getThumbnailUrl(item.ipfsHash), '_blank')}>
                      <Download className="mr-2 h-4 w-4" />
                      View on IPFS
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/content/${item.id}/edit`}>
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
                  <Link href={`/content/${item.id}`} className="hover:underline">
                    {item.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Uploaded: {formatDate(item.createdAt)}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {item.ipfsHash.substring(0, 10)}...
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContent.map((item) => (
            <div key={item.id} className="flex border rounded-lg overflow-hidden">
              <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                <img
                  src={getThumbnailUrl(item.ipfsHash)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
              <div className="flex flex-col flex-1 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">
                      <Link href={`/content/${item.id}`} className="hover:underline">
                        {item.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {contentTypeIcons[item.contentType] || <FileText className="h-4 w-4" />}
                        {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Uploaded: {formatDate(item.createdAt)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/content/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(getThumbnailUrl(item.ipfsHash), '_blank')}>
                        <Download className="mr-2 h-4 w-4" />
                        View on IPFS
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/content/${item.id}/edit`}>
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
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    IPFS: {item.ipfsHash.substring(0, 15)}...
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}