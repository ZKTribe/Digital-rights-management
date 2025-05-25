"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  FileText,
  ImageIcon,
  Music,
  Video,
  Star,
  Loader2,
  MoreVertical,
  Download,
  Eye
} from "lucide-react"

interface ContentItem {
  id: string
  title: string
  description?: string
  ipfsHash: string
  creatorAddress: string
  contentType: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  licenseId: number
  price: number
  duration: string
  licenseIsActive: boolean
}

const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/license')
        if (!response.ok) throw new Error('Failed to fetch content')
        const data = await response.json()
        setContent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || item.contentType === activeTab
    let matchesPrice = true
    if (priceRange !== "all") {
      const price = item.price
      switch (priceRange) {
        case "under25": matchesPrice = price < 25; break
        case "25to50": matchesPrice = price >= 25 && price <= 50; break
        case "50to100": matchesPrice = price >= 50 && price <= 100; break
        case "over100": matchesPrice = price > 100; break
      }
    }
    return matchesSearch && matchesTab && matchesPrice
  })

  const formatDuration = (duration: string) => {
    switch (duration) {
      case 'DAILY': return '1 Day'
      case 'WEEKLY': return '1 Week'
      case 'MONTHLY': return '1 Month'
      case 'YEARLY': return '1 Year'
      case 'LIFETIME': return 'Lifetime'
      default: return duration
    }
  }

  const getThumbnailUrl = (ipfsHash: string) => `https://ipfs.io/ipfs/${ipfsHash}`

  const formatPrice = (price: number) => `$${price.toFixed(2)}`

  const truncateAddress = (address: string) => {
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-500">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600">Error loading content</h3>
          <p className="text-gray-500">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()} variant="outline">Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <div className="text-sm text-gray-500">{filteredContent.length} items available</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search marketplace..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="under25">Under $25</SelectItem>
              <SelectItem value="25to50">$25 to $50</SelectItem>
              <SelectItem value="50to100">$50 to $100</SelectItem>
              <SelectItem value="over100">Over $100</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
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
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No items found</h3>
          <p className="mt-1 text-gray-500">
            {content.length === 0
              ? "No licensed content available in the marketplace yet"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContent.map((item) => (
            <Card key={`${item.id}-${item.licenseId}`} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-40 bg-gray-100">
                <img
                  src={getThumbnailUrl(item.ipfsHash)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src =
                      "data:image/svg+xml,%3csvg%20width='100'%20height='100'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100'%20height='100'%20fill='%23f3f4f6'/%3e%3ctext%20x='50'%20y='50'%20font-family='Arial'%20font-size='14'%20fill='%236b7280'%20text-anchor='middle'%20dy='.3em'%3eNo Image%3c/text%3e%3c/svg%3e"
                  }}
                />
                <Badge className="absolute top-2 left-2 flex items-center gap-1" variant="secondary">
                  {contentTypeIcons[item.contentType] || <FileText className="h-5 w-5" />}
                  {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
                </Badge>
                <Badge className="absolute top-2 right-2" variant="outline">
                  {formatDuration(item.duration)}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-2 right-2 bg-black/20 hover:bg-black/40 text-white rounded-full h-8 w-8 p-1"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/marketplace/${item.id}?licenseId=${item.licenseId}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(getThumbnailUrl(item.ipfsHash), '_blank')}>
                      <Download className="mr-2 h-4 w-4" />
                      Open in IPFS
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader>
                <CardTitle className="text-sm truncate">{item.title}</CardTitle>
              </CardHeader>

              <CardContent className="text-xs text-gray-600 space-y-1">
                <div><strong>Price:</strong> {formatPrice(item.price)}</div>
                <div><strong>Creator:</strong> {truncateAddress(item.creatorAddress)}</div>
              </CardContent>

              <CardFooter className="justify-between text-xs text-muted-foreground">
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                <Link href={`/marketplace/${item.id}?licenseId=${item.licenseId}`} className="text-blue-500 hover:underline">Details</Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
