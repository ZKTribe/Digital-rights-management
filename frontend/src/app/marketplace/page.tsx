"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, FileText, ImageIcon, Music, Video, Star } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock marketplace content data
const marketplaceItems = [
  {
    id: "item1",
    title: "Premium Stock Photography Collection",
    type: "image",
    thumbnail: "/placeholder.svg?height=200&width=300",
    creator: "Visual Arts Studio",
    price: "$49.99",
    rating: 4.8,
    reviews: 124,
    sales: 1250,
    licenseTypes: ["personal", "commercial"],
  },
  {
    id: "item2",
    title: "Corporate Presentation Templates",
    type: "document",
    thumbnail: "/placeholder.svg?height=200&width=300",
    creator: "Business Media Pro",
    price: "$29.99",
    rating: 4.5,
    reviews: 87,
    sales: 980,
    licenseTypes: ["personal", "commercial", "extended"],
  },
  {
    id: "item3",
    title: "Cinematic Sound Effects Pack",
    type: "audio",
    thumbnail: "/placeholder.svg?height=200&width=300",
    creator: "Audio Masters",
    price: "$39.99",
    rating: 4.9,
    reviews: 215,
    sales: 2450,
    licenseTypes: ["personal", "commercial", "extended"],
  },
  {
    id: "item4",
    title: "4K Drone Footage Collection",
    type: "video",
    thumbnail: "/placeholder.svg?height=200&width=300",
    creator: "Aerial Visuals",
    price: "$79.99",
    rating: 4.7,
    reviews: 156,
    sales: 890,
    licenseTypes: ["personal", "commercial", "extended"],
  },
  {
    id: "item5",
    title: "Abstract Digital Art Bundle",
    type: "image",
    thumbnail: "/placeholder.svg?height=200&width=300",
    creator: "Modern Art Collective",
    price: "$59.99",
    rating: 4.6,
    reviews: 92,
    sales: 750,
    licenseTypes: ["personal", "commercial"],
  },
  {
    id: "item6",
    title: "Business Proposal Templates",
    type: "document",
    thumbnail: "/placeholder.svg?height=200&width=300",
    creator: "Corporate Solutions",
    price: "$24.99",
    rating: 4.4,
    reviews: 68,
    sales: 1120,
    licenseTypes: ["personal", "commercial"],
  },
  {
    id: "item7",
    title: "Ambient Music Collection",
    type: "audio",
    thumbnail: "/placeholder.svg?height=200&width=300",
    creator: "Soundscape Studios",
    price: "$34.99",
    rating: 4.8,
    reviews: 105,
    sales: 1580,
    licenseTypes: ["personal", "commercial", "extended"],
  },
  {
    id: "item8",
    title: "Motion Graphics Pack",
    type: "video",
    thumbnail: "/placeholder.svg?height=200&width=300",
    creator: "Animation Experts",
    price: "$69.99",
    rating: 4.7,
    reviews: 134,
    sales: 920,
    licenseTypes: ["personal", "commercial", "extended"],
  },
]

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

  // Filter content based on search query, active tab, and price range
  const filteredContent = marketplaceItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || item.type === activeTab

    let matchesPrice = true
    if (priceRange === "under25") {
      matchesPrice = Number.parseFloat(item.price.replace("$", "")) < 25
    } else if (priceRange === "25to50") {
      const price = Number.parseFloat(item.price.replace("$", ""))
      matchesPrice = price >= 25 && price <= 50
    } else if (priceRange === "50to100") {
      const price = Number.parseFloat(item.price.replace("$", ""))
      matchesPrice = price > 50 && price <= 100
    } else if (priceRange === "over100") {
      matchesPrice = Number.parseFloat(item.price.replace("$", "")) > 100
    }

    return matchesSearch && matchesTab && matchesPrice
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketplace</h1>
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
        </TabsList>
      </Tabs>

      {filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No items found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContent.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative h-40 bg-gray-100">
                <img
                  src={item.thumbnail || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-2 left-2 flex items-center gap-1" variant="secondary">
                  {contentTypeIcons[item.type]}
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Badge>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  <Link href={`/marketplace/${item.id}`} className="hover:underline">
                    {item.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">By {item.creator}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1">{item.rating}</span>
                    <span className="text-gray-500 ml-1">({item.reviews})</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-500">{item.sales} sales</div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="text-lg font-bold">{item.price}</div>
                <Button asChild>
                  <Link href={`/marketplace/${item.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
