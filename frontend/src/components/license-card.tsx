"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { purchaseLicense } from "@/lib/blockchain"
import { useToast } from "@/hooks/use-toast"

type LicenseType = "personal" | "commercial" | "exclusive"

interface LicenseCardProps {
  type: LicenseType
  price: number
  features: string[]
  duration: string
  contentId: string
  userId: string
  onPurchase?: (licenseId: string) => void
  recommended?: boolean
}

export default function LicenseCard({
  type,
  price,
  features,
  duration,
  contentId,
  userId,
  onPurchase,
  recommended = false,
}: LicenseCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const { toast } = useToast()

  const licenseTypeMap: Record<LicenseType, { title: string; description: string; licenseTypeId: number }> = {
    personal: {
      title: "Personal License",
      description: "For individual, non-commercial use only",
      licenseTypeId: 0,
    },
    commercial: {
      title: "Commercial License",
      description: "For business and commercial applications",
      licenseTypeId: 1,
    },
    exclusive: {
      title: "Exclusive License",
      description: "Full rights with ability to sublicense",
      licenseTypeId: 2,
    },
  }

  const { title, description, licenseTypeId } = licenseTypeMap[type]

  const handlePurchase = async () => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please connect your wallet to purchase a license",
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)

    try {
      // First create the license in the database
      const response = await fetch("/api/licenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          buyerId: userId,
          licenseType: type,
          price,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create license")
      }

      const { licenseId } = await response.json()

      // Then register on blockchain
      const validityPeriod =
        type === "personal"
          ? 31536000
          : // 1 year
            type === "commercial"
            ? 63072000
            : // 2 years
              157680000 // 5 years for exclusive

      const blockchainResult = await purchaseLicense(licenseId, price.toString())

      toast({
        title: "License purchased successfully",
        description: `Transaction hash: ${blockchainResult.transactionHash.slice(0, 10)}...`,
      })

      // Process payment
      await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licenseId,
          paymentMethod: "wallet",
          paymentDetails: {
            transactionHash: blockchainResult.transactionHash,
          },
        }),
      })

      if (onPurchase) {
        onPurchase(licenseId)
      }
    } catch (error) {
      console.error("Purchase error:", error)
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <Card className={`w-full ${recommended ? "border-primary shadow-lg" : ""}`}>
      {recommended && <div className="bg-primary text-white text-center py-1 text-sm font-medium">Recommended</div>}
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          <Badge variant={type === "personal" ? "outline" : type === "commercial" ? "secondary" : "default"}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-500">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-gray-500 ml-1">{duration}</span>
        </div>

        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handlePurchase}
          disabled={isPurchasing}
          className="w-full"
          variant={recommended ? "default" : "outline"}
        >
          {isPurchasing ? "Processing..." : "Purchase License"}
        </Button>
      </CardFooter>
    </Card>
  )
}
