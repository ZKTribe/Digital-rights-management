"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Edit, Share2, Eye, FileText, ImageIcon, Music, Video } from "lucide-react"

// Mock content data
const mockContent = [
  {
    id: "content1",
    title: "Digital Art Collection Vol. 1",
    description:
      "A collection of 10 high-resolution digital art pieces perfect for commercial and personal projects. Each piece is carefully crafted with attention to detail and modern design principles.",
    type: "image",
    thumbnail: "/placeholder.svg?height=400&width=600",
    uploadDate: "2023-11-15",
    views: 1250,
    downloads: 85,
    licenses: 12,
    revenue: "$1,450.00",
    creator: "Digital Artist Studio",
    fileSize: "245 MB",
    resolution: "4K (3840x2160)",
    format: "PNG, JPG, PSD",
    tags: ["digital art", "illustration", "design", "modern", "abstract"],
    protected: true,
  },
  {
    id: "content2",
    title: "Music Production Course",
    description:
      "Comprehensive music production course covering everything from basic theory to advanced mixing and mastering techniques. Includes project files, samples, and step-by-step tutorials.",
    type: "video",
    thumbnail: "/placeholder.svg?height=400&width=600",
    uploadDate: "2023-11-12",
    views: 3200,
    downloads: 320,
    licenses: 45,
    revenue: "$4,750.00",
    creator: "Audio Academy",
    fileSize: "4.2 GB",
    resolution: "1080p",
    format: "MP4, PDF, WAV",
    tags: ["music production", "tutorial", "mixing", "mastering", "audio"],
    protected: true,
  },
  {
    id: "content3",
    title: "Stock Photo Bundle",
    description:
      "A collection of 50 high-quality stock photos suitable for websites, marketing materials, and social media. All images are professionally shot and edited.",
    type: "image",
    thumbnail: "/placeholder.svg?height=400&width=600",
    uploadDate: "2023-11-10",
    views: 980,
    downloads: 210,
    licenses: 28,
    revenue: "$2,100.00",
    creator: "Visual Media Co.",
    fileSize: "1.8 GB",
    resolution: "4K (3840x2160)",
    format: "JPG, PNG",
    tags: ["stock photos", "photography", "marketing", "business", "website"],
    protected: true,
  },
  {
    id: "content4",
    title: "Premium Video Templates",
    description:
      "Collection of 20 premium video templates for intros, outros, and transitions. Perfect for YouTubers, content creators, and video editors.",
    type: "video",
    thumbnail: "/placeholder.svg?height=400&width=600",
    uploadDate: "2023-11-08",
    views: 1800,
    downloads: 150,
    licenses: 32,
    revenue: "$3,200.00",
    creator: "Motion Graphics Pro",
    fileSize: "3.5 GB",
    resolution: "4K (3840x2160)",
    format: "AEP, MOGRT, MP4",
    tags: ["video templates", "motion graphics", "intros", "youtube", "editing"],
    protected: true,
  },
  {
    id: "content5",
    title: "Ambient Music Pack",
    description:
      "Collection of 30 ambient music tracks perfect for videos, games, and multimedia projects. Royalty-free and ready to use in your projects.",
    type: "audio",
    thumbnail: "/placeholder.svg?height=400&width=600",
    uploadDate: "2023-11-05",
    views: 750,
    downloads: 120,
    licenses: 18,
    revenue: "$1,800.00",
    creator: "Ambient Sound Studio",
    fileSize: "1.2 GB",
    format: "WAV, MP3",
    tags: ["ambient", "music", "soundtrack", "background", "audio"],
    protected: true,
  },
  {
    id: "content6",
    title: "Business Proposal Template",
    description:
      "Professional business proposal template with 30 unique pages, custom infographics, and editable elements. Perfect for pitches, reports, and presentations.",
    type: "document",
    thumbnail: "/placeholder.svg?height=400&width=600",
    uploadDate: "2023-11-03",
    views: 450,
    downloads: 95,
    licenses: 8,
    revenue: "$800.00",
    creator: "Business Templates Inc.",
    fileSize: "25 MB",
    format: "DOCX, PDF, INDD",
    tags: ["business", "proposal", "template", "professional", "document"],
    protected: true,
  },
]

const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
}

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  // Find the content based on the ID from the URL params
  const content = mockContent.find((item) => item.id === params.id) || mockContent[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/content">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{content.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg overflow-hidden border">
            <img
              src={content.thumbnail || "/placeholder.svg"}
              alt={content.title}
              className="w-full h-auto object-cover"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="licenses">Licenses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{content.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium">
                        {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Format</span>
                      <span className="font-medium">{content.format}</span>
                    </div>
                    {content.resolution && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Resolution</span>
                        <span className="font-medium">{content.resolution}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">File Size</span>
                      <span className="font-medium">{content.fileSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Upload Date</span>
                      <span className="font-medium">{content.uploadDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Blockchain Protected</span>
                      <span className="font-medium">{content.protected ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="licenses" className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Active Licenses</h3>
                  <Button asChild>
                    <Link href={`/licenses/create?contentId=${content.id}`}>Create New License</Link>
                  </Button>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Personal License</h4>
                          <p className="text-sm text-gray-500">Issued to: John Smith</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Issue Date</p>
                          <p className="font-medium">2023-10-15</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Expiry Date</p>
                          <p className="font-medium">2024-10-15</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price</p>
                          <p className="font-medium">$49.99</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Commercial License</h4>
                          <p className="text-sm text-gray-500">Issued to: Acme Corporation</p>
                        </div>
                        <Badge>Active</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Issue Date</p>
                          <p className="font-medium">2023-09-22</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Expiry Date</p>
                          <p className="font-medium">2025-09-22</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Price</p>
                          <p className="font-medium">$199.99</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="pt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">Total Views</p>
                        <p className="text-3xl font-bold">{content.views.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">Total Downloads</p>
                        <p className="text-3xl font-bold">{content.downloads.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{content.revenue}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Usage Over Time</h3>
                  <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Analytics chart will be displayed here</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
                  <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Geographic map will be displayed here</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{content.revenue}</div>
                <Badge className="flex items-center gap-1" variant="secondary">
                  {contentTypeIcons[content.type]}
                  {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Licenses</p>
                  <p className="font-medium">{content.licenses}</p>
                </div>
                <div>
                  <p className="text-gray-500">Downloads</p>
                  <p className="font-medium">{content.downloads}</p>
                </div>
                <div>
                  <p className="text-gray-500">Views</p>
                  <p className="font-medium">{content.views}</p>
                </div>
                <div>
                  <p className="text-gray-500">Upload Date</p>
                  <p className="font-medium">{content.uploadDate}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/content/${content.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/licenses/create?contentId=${content.id}`}>Create License</Link>
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>

              <div className="pt-2">
                <h3 className="font-semibold mb-2">Blockchain Protection</h3>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="font-medium">Protected on Starknet</span>
                  </div>
                  <p className="text-sm mt-1">This content is registered and protected on the Starknet blockchain.</p>
                  <Button variant="link" className="text-sm p-0 h-auto mt-1">
                    View on Blockchain Explorer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Similar Content</h3>
              <div className="space-y-3">
                {mockContent
                  .filter((item) => item.id !== content.id && item.type === content.type)
                  .slice(0, 3)
                  .map((similarContent) => (
                    <Link
                      key={similarContent.id}
                      href={`/content/${similarContent.id}`}
                      className="flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={similarContent.thumbnail || "/placeholder.svg"}
                          alt={similarContent.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{similarContent.title}</h4>
                        <div className="flex items-center text-sm">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{similarContent.views}</span>
                          <span className="mx-1">•</span>
                          <span>{similarContent.revenue}</span>
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
