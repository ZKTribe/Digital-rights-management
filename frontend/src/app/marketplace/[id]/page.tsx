"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, Download, ShoppingCart, Heart, Share2, FileText, ImageIcon, Music, Video } from "lucide-react"

// Mock marketplace items data
const marketplaceItems = [
  {
    id: "item1",
    title: "Premium Stock Photography Collection",
    description:
      "A curated collection of 50 high-resolution stock photographs perfect for websites, marketing materials, and social media. All images are professionally shot and edited to the highest standards.",
    type: "image",
    thumbnail: "/placeholder.svg?height=400&width=600",
    creator: "Visual Arts Studio",
    creatorAvatar: "/placeholder.svg?height=50&width=50",
    price: "$49.99",
    rating: 4.8,
    reviews: 124,
    sales: 1250,
    uploadDate: "2023-08-15",
    fileSize: "1.2 GB",
    resolution: "4K (3840x2160)",
    format: "JPG, PNG",
    licenseTypes: [
      { name: "Personal", price: "$49.99", features: ["Personal projects", "Non-commercial use", "Single user"] },
      {
        name: "Commercial",
        price: "$99.99",
        features: ["Commercial projects", "Multiple projects", "Single business"],
      },
      {
        name: "Extended",
        price: "$199.99",
        features: ["Unlimited commercial use", "Resale in products", "Multiple businesses"],
      },
    ],
    tags: ["photography", "stock photos", "high-resolution", "professional", "marketing"],
    samples: [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
    ],
  },
  {
    id: "item2",
    title: "Corporate Presentation Templates",
    description:
      "Professional presentation templates designed for corporate use. Includes 20 unique slide layouts, custom animations, and editable graphics. Perfect for business proposals, reports, and company presentations.",
    type: "document",
    thumbnail: "/placeholder.svg?height=400&width=600",
    creator: "Business Media Pro",
    creatorAvatar: "/placeholder.svg?height=50&width=50",
    price: "$29.99",
    rating: 4.5,
    reviews: 87,
    sales: 980,
    uploadDate: "2023-09-22",
    fileSize: "250 MB",
    format: "PPTX, KEY",
    licenseTypes: [
      { name: "Personal", price: "$29.99", features: ["Personal use", "Non-commercial", "Single user"] },
      { name: "Commercial", price: "$79.99", features: ["Commercial use", "Multiple presentations", "Single company"] },
      {
        name: "Extended",
        price: "$149.99",
        features: ["Unlimited commercial use", "Resale allowed", "Multiple companies"],
      },
    ],
    tags: ["presentation", "corporate", "business", "template", "professional"],
    samples: [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
    ],
  },
  {
    id: "item3",
    title: "Cinematic Sound Effects Pack",
    description:
      "A comprehensive collection of 200+ high-quality cinematic sound effects for film, video games, and multimedia projects. Includes impacts, whooshes, drones, and atmospheric sounds.",
    type: "audio",
    thumbnail: "/placeholder.svg?height=400&width=600",
    creator: "Audio Masters",
    creatorAvatar: "/placeholder.svg?height=50&width=50",
    price: "$39.99",
    rating: 4.9,
    reviews: 215,
    sales: 2450,
    uploadDate: "2023-07-10",
    fileSize: "3.5 GB",
    format: "WAV, MP3",
    licenseTypes: [
      { name: "Personal", price: "$39.99", features: ["Personal projects", "Non-commercial use", "Single user"] },
      {
        name: "Commercial",
        price: "$89.99",
        features: ["Commercial projects", "Multiple projects", "Single business"],
      },
      {
        name: "Extended",
        price: "$179.99",
        features: ["Unlimited commercial use", "Distribution in products", "Multiple businesses"],
      },
    ],
    tags: ["sound effects", "cinematic", "audio", "film", "game development"],
    samples: [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
    ],
  },
  {
    id: "item4",
    title: "4K Drone Footage Collection",
    description:
      "Stunning aerial footage captured with professional drones in 4K resolution. Includes 50 clips of various landscapes, cityscapes, and natural wonders from around the world.",
    type: "video",
    thumbnail: "/placeholder.svg?height=400&width=600",
    creator: "Aerial Visuals",
    creatorAvatar: "/placeholder.svg?height=50&width=50",
    price: "$79.99",
    rating: 4.7,
    reviews: 156,
    sales: 890,
    uploadDate: "2023-10-05",
    fileSize: "8.2 GB",
    resolution: "4K (3840x2160)",
    format: "MP4, MOV",
    licenseTypes: [
      { name: "Personal", price: "$79.99", features: ["Personal projects", "Non-commercial use", "Single user"] },
      {
        name: "Commercial",
        price: "$149.99",
        features: ["Commercial projects", "Multiple projects", "Single business"],
      },
      {
        name: "Extended",
        price: "$299.99",
        features: ["Unlimited commercial use", "Distribution in products", "Multiple businesses"],
      },
    ],
    tags: ["drone footage", "aerial", "4K", "video", "landscape"],
    samples: [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=200&width=300",
    ],
  },
]

const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
}

export default function MarketplaceItemPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedLicense, setSelectedLicense] = useState(0)

  // Find the item based on the ID from the URL params
  const item = marketplaceItems.find((item) => item.id === params.id) || marketplaceItems[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/marketplace">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{item.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg overflow-hidden border">
            <img src={item.thumbnail || "/placeholder.svg"} alt={item.title} className="w-full h-auto object-cover" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="samples">Samples</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Format</span>
                      <span className="font-medium">{item.format}</span>
                    </div>
                    {item.resolution && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Resolution</span>
                        <span className="font-medium">{item.resolution}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">File Size</span>
                      <span className="font-medium">{item.fileSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Upload Date</span>
                      <span className="font-medium">{item.uploadDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sales</span>
                      <span className="font-medium">{item.sales}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="samples" className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                {item.samples.map((sample, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <img
                      src={sample || "/placeholder.svg"}
                      alt={`Sample ${index + 1}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(item.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="font-bold">{item.rating}</span>
                <span className="text-gray-500">({item.reviews} reviews)</span>
              </div>

              <div className="space-y-4">
                {/* Mock reviews */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          <img src="/placeholder.svg?height=40&width=40" alt="User" />
                        </div>
                        <div>
                          <div className="font-medium">John Smith</div>
                          <div className="text-sm text-gray-500">2 months ago</div>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3">
                      Excellent quality content! Exactly what I needed for my project. The files are well organized and
                      easy to use.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          <img src="/placeholder.svg?height=40&width=40" alt="User" />
                        </div>
                        <div>
                          <div className="font-medium">Sarah Johnson</div>
                          <div className="text-sm text-gray-500">1 month ago</div>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3">
                      Great value for the price. Would definitely recommend to others looking for similar content.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{item.licenseTypes[selectedLicense].price}</div>
                <Badge className="flex items-center gap-1" variant="secondary">
                  {contentTypeIcons[item.type]}
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img src={item.creatorAvatar || "/placeholder.svg"} alt={item.creator} />
                </div>
                <div>
                  <div className="font-medium">{item.creator}</div>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span>{item.rating}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">License Type</h3>
                <div className="grid grid-cols-3 gap-2">
                  {item.licenseTypes.map((license, index) => (
                    <Button
                      key={index}
                      variant={selectedLicense === index ? "default" : "outline"}
                      onClick={() => setSelectedLicense(index)}
                      className="w-full"
                    >
                      {license.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">License Includes</h3>
                <ul className="space-y-2">
                  {item.licenseTypes[selectedLicense].features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Purchase License
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Similar Items</h3>
              <div className="space-y-3">
                {marketplaceItems
                  .filter((i) => i.id !== item.id && i.type === item.type)
                  .slice(0, 3)
                  .map((similarItem) => (
                    <Link
                      key={similarItem.id}
                      href={`/marketplace/${similarItem.id}`}
                      className="flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={similarItem.thumbnail || "/placeholder.svg"}
                          alt={similarItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{similarItem.title}</h4>
                        <div className="flex items-center text-sm">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                          <span>{similarItem.rating}</span>
                          <span className="mx-1">•</span>
                          <span>{similarItem.price}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
