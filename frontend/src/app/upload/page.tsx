"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, X, FileText, ImageIcon, Music, Video, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/internal/hooks/use-toast"

const contentTypes = [
  { id: "video", label: "Video", icon: Video },
  { id: "audio", label: "Audio", icon: Music },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "document", label: "Document", icon: FileText },
]

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contentType, setContentType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [useBlockchain, setUseBlockchain] = useState(true)
  const [activeTab, setActiveTab] = useState("single")
  const [batchFiles, setBatchFiles] = useState<File[]>([])
  const [batchProgress, setBatchProgress] = useState<Record<string, number>>({})

  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setBatchFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (activeTab === "single") {
        setFile(e.dataTransfer.files[0])
      } else {
        const newFiles = Array.from(e.dataTransfer.files)
        setBatchFiles((prev) => [...prev, ...newFiles])
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleRemoveFile = () => {
    setFile(null)
  }

  const handleRemoveBatchFile = (index: number) => {
    setBatchFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === "single") {
      if (!title || !contentType || !file) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields and upload a file.",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 200)

      // Simulate API call
      setTimeout(() => {
        clearInterval(interval)
        setUploadProgress(100)
        setIsUploading(false)

        toast({
          title: "Upload successful",
          description: "Your content has been uploaded successfully.",
        })

        router.push("/content")
      }, 3000)
    } else {
      // Batch upload
      if (batchFiles.length === 0) {
        toast({
          title: "No files selected",
          description: "Please select at least one file to upload.",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)

      // Initialize progress for each file
      const initialProgress: Record<string, number> = {}
      batchFiles.forEach((file) => {
        initialProgress[file.name] = 0
      })
      setBatchProgress(initialProgress)

      // Simulate batch upload with different progress for each file
      batchFiles.forEach((file, index) => {
        const interval = setInterval(() => {
          setBatchProgress((prev) => {
            const newProgress = { ...prev }
            if (newProgress[file.name] >= 95) {
              clearInterval(interval)
            } else {
              newProgress[file.name] = newProgress[file.name] + Math.random() * 10
            }
            return newProgress
          })
        }, 300)

        // Simulate completion of each file
        setTimeout(
          () => {
            clearInterval(interval)
            setBatchProgress((prev) => {
              const newProgress = { ...prev }
              newProgress[file.name] = 100
              return newProgress
            })

            // If all files are done, show success message
            if (index === batchFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false)
                toast({
                  title: "Batch upload successful",
                  description: `${batchFiles.length} files have been uploaded successfully.`,
                })
                router.push("/content")
              }, 1000)
            }
          },
          2000 + index * 1000,
        )
      })
    }
  }

  const ContentTypeIcon = contentTypes.find((type) => type.id === contentType)?.icon || FileText

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Content</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="single">Single Upload</TabsTrigger>
          <TabsTrigger value="batch">Batch Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Upload Single Content</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter content title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter content description"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger id="contentType">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>File</Label>
                  {!file ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <Upload className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Drag and drop a file here, or click to select a file</p>
                      <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ContentTypeIcon className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="blockchain" checked={useBlockchain} onCheckedChange={setUseBlockchain} />
                  <Label htmlFor="blockchain" className="text-sm font-normal">
                    Register content on Starknet blockchain for enhanced protection
                  </Label>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} disabled={isUploading} className="w-full">
                {isUploading ? "Uploading..." : "Upload Content"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Files</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById("batch-file-upload")?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Drag and drop files here, or click to select files</p>
                    <input
                      id="batch-file-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleBatchFileChange}
                    />
                  </div>
                </div>

                {batchFiles.length > 0 && (
                  <div className="space-y-4">
                    <Label>{batchFiles.length} files selected</Label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {batchFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-blue-500" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isUploading && (
                              <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${batchProgress[file.name] || 0}%` }}
                                ></div>
                              </div>
                            )}
                            {batchProgress[file.name] === 100 ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveBatchFile(index)}
                                disabled={isUploading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch id="batch-blockchain" checked={useBlockchain} onCheckedChange={setUseBlockchain} />
                  <Label htmlFor="batch-blockchain" className="text-sm font-normal">
                    Register all content on Starknet blockchain
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmit} disabled={isUploading || batchFiles.length === 0} className="w-full">
                {isUploading ? "Uploading..." : `Upload ${batchFiles.length} Files`}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
