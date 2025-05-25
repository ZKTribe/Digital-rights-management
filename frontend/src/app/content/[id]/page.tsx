"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Share2, 
  Eye, 
  FileText, 
  ImageIcon, 
  Music, 
  Video, 
  Loader2,
  ExternalLink,
  AlertTriangle 
} from "lucide-react"

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

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [content, setContent] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similarContent, setSimilarContent] = useState<ContentItem[]>([])
  
  // Debug states
  const [debugInfo, setDebugInfo] = useState({
    contentId: params.id,
    apiUrl: '',
    responseStatus: 0,
    responseText: '',
    fetchAttempted: false
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Generate content URL from IPFS hash
  const getContentUrl = (ipfsHash: string) => {
    return `https://ipfs.io/ipfs/${ipfsHash}` // or your preferred IPFS gateway
  }

  // Fetch specific content by ID
  // Update the fetchContent function in your useEffect hook
useEffect(() => {
  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    
    const apiUrl = `/api/content/${params.id}`;
    
    setDebugInfo(prev => ({
      ...prev,
      apiUrl,
      fetchAttempted: true
    }));
    
    try {
      console.log('Fetching content with ID:', params.id);
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Important for dynamic data
      });
      
      setDebugInfo(prev => ({
        ...prev,
        responseStatus: response.status
      }));
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetched data:', data);
      
      // Validate the response structure
      if (!data.id || !data.title || !data.ipfsHash) {
        throw new Error('Invalid content data received from server');
      }
      
      setContent(data);
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (params.id) {
    fetchContent();
  } else {
    setError('No content ID provided');
    setLoading(false);
  }
}, [params.id]);

  // Fetch similar content (same type, different ID)
  useEffect(() => {
    const fetchSimilarContent = async () => {
      if (!content) return
      
      try {
        // You might want to create a separate API endpoint for this
        // For now, we'll fetch all content from the same creator and filter
        const response = await fetch(`/api/content?creatorAddress=${encodeURIComponent(content.creatorAddress)}`)
        
        if (response.ok) {
          const allContent = await response.json()
          const similar = allContent
            .filter((item: ContentItem) => 
              item.id !== content.id && 
              item.contentType === content.contentType
            )
            .slice(0, 3)
          setSimilarContent(similar)
        }
      } catch (err) {
        console.error('Error fetching similar content:', err)
      }
    }

    fetchSimilarContent()
  }, [content])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading content...</span>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-red-600">Content not found</h3>
          <p className="mt-1 text-gray-500">{error || 'The requested content could not be found'}</p>
          
          {/* Debug Information */}
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-w-2xl mx-auto">
            <h4 className="font-semibold mb-2">Debug Information:</h4>
            <div className="space-y-2 text-sm font-mono">
              <div><strong>Content ID:</strong> {debugInfo.contentId}</div>
              <div><strong>API URL:</strong> {debugInfo.apiUrl}</div>
              <div><strong>Fetch Attempted:</strong> {debugInfo.fetchAttempted ? 'Yes' : 'No'}</div>
              <div><strong>Response Status:</strong> {debugInfo.responseStatus || 'No response'}</div>
              {debugInfo.responseText && (
                <div>
                  <strong>Response Text (first 500 chars):</strong>
                  <pre className="mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-auto">
                    {debugInfo.responseText}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
          <Button className="mt-4" asChild variant="outline">
            <Link href="/content">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Content
            </Link>
          </Button>
        </div>
      </div>
    )
  }

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
              src={getContentUrl(content.ipfsHash)}
              alt={content.title}
              className="w-full h-auto object-cover"
              onError={(e) => {
                // Fallback to placeholder if IPFS image fails to load
                e.currentTarget.src = "/placeholder.svg"
              }}
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
                <p className="text-gray-700 dark:text-gray-300">
                  {content.description || "No description available for this content."}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Content Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium">
                        {content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Upload Date</span>
                      <span className="font-medium">{formatDate(content.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Updated</span>
                      <span className="font-medium">{formatDate(content.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">IPFS Hash</span>
                      <span className="font-medium text-xs bg-gray-100 px-2 py-1 rounded">
                        {content.ipfsHash.substring(0, 10)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Creator</span>
                      <span className="font-medium text-xs bg-gray-100 px-2 py-1 rounded">
                        {content.creatorAddress.substring(0, 6)}...{content.creatorAddress.substring(content.creatorAddress.length - 4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Blockchain Protected</span>
                      <span className="font-medium">Yes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">IPFS Information</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Content Hash</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {content.ipfsHash}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(content.ipfsHash)}
                    >
                      Copy Hash
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(getContentUrl(content.ipfsHash), '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on IPFS
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="licenses" className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manage Licenses</h3>
                  <Button asChild>
                    <Link href={`/licenses/create?contentId=${content.id}`}>Create New License</Link>
                  </Button>
                </div>

                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No licenses yet</h3>
                  <p className="mt-1 text-gray-500">Create your first license to start monetizing this content</p>
                  <Button className="mt-4" asChild>
                    <Link href={`/licenses/create?contentId=${content.id}`}>Create License</Link>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="pt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">Total Views</p>
                        <p className="text-3xl font-bold">0</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">Total Downloads</p>
                        <p className="text-3xl font-bold">0</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">$0.00</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Usage Over Time</h3>
                  <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Analytics will be available once you start receiving views</p>
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
                <div className="text-2xl font-bold">$0.00</div>
                <Badge className="flex items-center gap-1" variant="secondary">
                  {contentTypeIcons[content.contentType] || <FileText className="h-5 w-5" />}
                  {content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total Licenses</p>
                  <p className="font-medium">0</p>
                </div>
                <div>
                  <p className="text-gray-500">Downloads</p>
                  <p className="font-medium">0</p>
                </div>
                <div>
                  <p className="text-gray-500">Views</p>
                  <p className="font-medium">0</p>
                </div>
                <div>
                  <p className="text-gray-500">Upload Date</p>
                  <p className="font-medium">{formatDate(content.createdAt)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => window.open(getContentUrl(content.ipfsHash), '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  View Content
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
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    const url = `${window.location.origin}/content/${content.id}`
                    navigator.clipboard.writeText(url)
                    // You might want to show a toast notification here
                  }}
                >
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

          {similarContent.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Your Similar Content</h3>
                <div className="space-y-3">
                  {similarContent.map((similarItem) => (
                    <Link
                      key={similarItem.id}
                      href={`/content/${similarItem.id}`}
                      className="flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={getContentUrl(similarItem.ipfsHash)}
                          alt={similarItem.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{similarItem.title}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{formatDate(similarItem.createdAt)}</span>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{similarItem.contentType}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}