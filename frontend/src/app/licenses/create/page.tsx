"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileText, ImageIcon, Music, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAccount, useContractWrite, useWaitForTransaction } from "@starknet-react/core"

// Starknet contract address
const DRM_CONTRACT_ADDRESS = "0x04433755015768a1cca267bc3f4b6721772e42cefc9dbffff31ee758fb12022f"

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

// License types matching contract enum
const LICENSE_TYPES = [
  {
    id: "0", // OneMonth
    name: "1-Month License",
    defaultPrice: "0.01" // ETH
  },
  {
    id: "1", // SixMonths
    name: "6-Month License", 
    defaultPrice: "0.05" // ETH
  },
  {
    id: "2", // OneYear
    name: "1-Year License",
    defaultPrice: "0.1" // ETH
  }
]

export default function SetLicensePricesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const contentIdParam = searchParams.get("contentId")
  const { address } = useAccount()
  const { toast } = useToast()

  const [selectedContent, setSelectedContent] = useState<string>(contentIdParam || "")
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [isSettingPrices, setIsSettingPrices] = useState(false)
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Initialize prices with defaults
  useEffect(() => {
    const defaultPrices = LICENSE_TYPES.reduce((acc, type) => {
      acc[type.id] = type.defaultPrice
      return acc
    }, {} as Record<string, string>)
    setPrices(defaultPrices)
  }, [])

  // Fetch content owned by the connected wallet
  useEffect(() => {
    const fetchContent = async () => {
      if (!address) return
      
      setLoading(true)
      try {
        const response = await fetch(`/api/content?creatorAddress=${encodeURIComponent(address)}`)
        if (!response.ok) throw new Error('Failed to fetch content')
        setContent(await response.json())
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load content",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [address, toast])

  // Prepare contract calls
  const { writeAsync } = useContractWrite({
    calls: LICENSE_TYPES.map(type => ({
      contractAddress: DRM_CONTRACT_ADDRESS,
      entrypoint: 'set_license_price',
      calldata: [
        selectedContent, // content_id: u64
        type.id, // license_type: enum index
        Math.round(parseFloat(prices[type.id] || "0") * 100) // price: u32 (cents)
      ]
    }))
  })

  // Track transaction status
  const { data: txData } = useWaitForTransaction({ 
    hash: txHash as `0x${string}`,
    watch: true
  })

 useEffect(() => {
  if (txHash && txData) {
    if (
      'finality_status' in txData && 
      txData.finality_status === "ACCEPTED_ON_L2" &&
      'execution_status' in txData &&
      txData.execution_status === "SUCCEEDED"
    ) {
      toast({
        title: "Prices set successfully!",
        description: "License prices updated on-chain"
      });
      setTxHash(null);
      router.refresh(); // Optional: Refresh page data if needed
    }
    else if (
      'execution_status' in txData &&
      txData.execution_status === "REVERTED"
    ) {
      toast({
        title: "Transaction reverted",
        description: txData.revert_reason || "Failed to set license prices",
        variant: "destructive"
      });
      setTxHash(null);
    }
  }
}, [txData, txHash, toast, router]);

  const handleSetPrices = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedContent) {
      toast({
        title: "Content required",
        description: "Please select content",
        variant: "destructive"
      })
      return
    }

    // Validate prices
    for (const type of LICENSE_TYPES) {
      const price = parseFloat(prices[type.id] || "0")
      if (isNaN(price)) {
        toast({
          title: "Invalid price",
          description: `Please enter a valid number for ${type.name}`,
          variant: "destructive"
        })
        return
      }
      if (price < 0) {
        toast({
          title: "Invalid price",
          description: `Price cannot be negative for ${type.name}`,
          variant: "destructive"
        })
        return
      }
    }

    setIsSettingPrices(true)

    try {
      const tx = await writeAsync()
      setTxHash(tx.transaction_hash)
      
      toast({
        title: "Transaction sent",
        description: "Setting license prices..."
      })

    } catch (error) {
      console.error("Failed to set prices:", error)
      toast({
        title: "Error setting prices",
        description: error instanceof Error ? error.message : "Transaction failed",
        variant: "destructive"
      })
    } finally {
      setIsSettingPrices(false)
    }
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium">Wallet not connected</h3>
          <p className="text-gray-500">Please connect your wallet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/licenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Set License Prices</h1>
      </div>

      <form onSubmit={handleSetPrices} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Content</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <p>Loading content...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {content.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedContent === item.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedContent(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={`https://ipfs.io/ipfs/${item.ipfsHash}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          {contentTypeIcons[item.contentType]}
                          <span className="ml-1">{item.contentType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Set Prices for License Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {LICENSE_TYPES.map((type) => (
              <div key={type.id} className="space-y-2">
                <Label>{type.name}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={prices[type.id] || ""}
                    onChange={(e) => 
                      setPrices(prev => ({
                        ...prev,
                        [type.id]: e.target.value
                      }))
                    }
                    min="0"
                    step="0.001"
                    placeholder={type.defaultPrice}
                  />
                  <span className="whitespace-nowrap">ETH</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Will be stored as {Math.round(parseFloat(prices[type.id] || "0") * 100)} cents (u32)
                </p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSettingPrices || !selectedContent || txHash !== null}
            >
              {txHash ? "Processing..." : 
               isSettingPrices ? "Preparing transaction..." : 
               "Set All Prices"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}