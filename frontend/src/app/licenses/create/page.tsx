"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, ImageIcon, Music, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Mock content data
const mockContent = [
  {
    id: "content1",
    title: "Digital Art Collection Vol. 1",
    type: "image",
    thumbnail: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "content2",
    title: "Music Production Course",
    type: "video",
    thumbnail: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "content3",
    title: "Stock Photo Bundle",
    type: "image",
    thumbnail: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "content4",
    title: "Premium Video Templates",
    type: "video",
    thumbnail: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "content5",
    title: "Ambient Music Pack",
    type: "audio",
    thumbnail: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "content6",
    title: "Business Proposal Template",
    type: "document",
    thumbnail: "/placeholder.svg?height=100&width=100",
  },
]

const contentTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
}

const licenseTypes = [
  {
    id: "personal",
    name: "Personal License",
    description: "For individual, non-commercial use only",
    price: "$49.99",
    duration: "1 year",
    rights: ["Personal projects", "Non-commercial use", "Single user"],
  },
  {
    id: "commercial",
    name: "Commercial License",
    description: "For business and commercial applications",
    price: "$199.99",
    duration: "2 years",
    rights: ["Commercial projects", "Multiple projects", "Single business"],
  },
  {
    id: "extended",
    name: "Extended License",
    description: "Full rights with ability to sublicense",
    price: "$299.99",
    duration: "5 years",
    rights: ["Unlimited commercial use", "Resale in products", "Multiple businesses"],
  },
]

export default function CreateLicensePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contentIdParam = searchParams.get("contentId")

  const [selectedContent, setSelectedContent] = useState<string>(contentIdParam || "")
  const [licenseType, setLicenseType] = useState<string>("personal")
  const [recipientWallet, setRecipientWallet] = useState<string>("")
  const [recipientName, setRecipientName] = useState<string>("")
  const [customPrice, setCustomPrice] = useState<string>("")
  const [customDuration, setCustomDuration] = useState<string>("1")
  const [isCreating, setIsCreating] = useState(false)

  const { toast } = useToast()

  const selectedLicenseType = licenseTypes.find((type) => type.id === licenseType)
  const selectedContentItem = mockContent.find((content) => content.id === selectedContent)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedContent) {
      toast({
        title: "Content required",
        description: "Please select content to license",
        variant: "destructive",
      })
      return
    }

    if (!recipientWallet) {
      toast({
        title: "Recipient required",
        description: "Please enter recipient wallet address",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    // Simulate API call
    setTimeout(() => {
      setIsCreating(false)

      toast({
        title: "License created",
        description: "The license has been created successfully",
      })

      router.push("/licenses")
    }, 2000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/licenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create New License</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {mockContent.map((content) => (
                <div
                  key={content.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedContent === content.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedContent(content.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={content.thumbnail || "/placeholder.svg"}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{content.title}</div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        {contentTypeIcons[content.type]}
                        <span className="ml-1">{content.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>License Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={licenseType} onValueChange={setLicenseType} className="space-y-4">
              {licenseTypes.map((type) => (
                <div
                  key={type.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    licenseType === type.id ? "border-primary bg-primary/5" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start">
                    <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                    <div className="ml-3 flex-1">
                      <Label htmlFor={type.id} className="text-base font-medium cursor-pointer">
                        {type.name} - {type.price}
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Includes:</p>
                        <ul className="mt-1 space-y-1">
                          {type.rights.map((right, index) => (
                            <li key={index} className="text-sm flex items-center">
                              <svg
                                className="h-4 w-4 text-green-500 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {right}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{type.price}</div>
                      <div className="text-sm text-gray-500">{type.duration}</div>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="customPrice">Custom Price (optional)</Label>
                <Input
                  id="customPrice"
                  type="text"
                  placeholder={selectedLicenseType?.price || ""}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-32 text-right"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="customDuration">License Duration (years)</Label>
                <Select value={customDuration} onValueChange={setCustomDuration}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="2">2 years</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="10">10 years</SelectItem>
                    <SelectItem value="perpetual">Perpetual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recipient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="recipientWallet">Recipient Wallet Address</Label>
              <Input
                id="recipientWallet"
                placeholder="0x..."
                value={recipientWallet}
                onChange={(e) => setRecipientWallet(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="recipientName">Recipient Name (optional)</Label>
              <Input
                id="recipientName"
                placeholder="Individual or organization name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/licenses">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating License..." : "Create License"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
