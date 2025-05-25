"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  FileText,
  ImageIcon,
  Music,
  Video,
  Check,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/internal/hooks/use-toast";
import { ContractAddress } from "@/common/abis/data";
import {
  useAccount,
  useContract,
  useWaitForTransaction,
} from "@starknet-react/core";
import { DrmABI } from "@/common/abis/abi";
import { uploadToIPFS } from "@/hooks/ipfsService";
import { useDRMContract } from "@/hooks/useDRMContract";

const contentTypes = [
  { id: "video", label: "Video", icon: Video },
  { id: "audio", label: "Audio", icon: Music },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "document", label: "Document", icon: FileText },
];

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [useBlockchain, setUseBlockchain] = useState(true);
  const [activeTab, setActiveTab] = useState("single");
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchProgress, setBatchProgress] = useState<Record<string, number>>(
    {},
  );
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined,
  );
  const [transactionTimeout, setTransactionTimeout] =
    useState<NodeJS.Timeout>();
  const [walletActionRequired, setWalletActionRequired] = useState(false);

  const { uploadContent, isReady, checkReadiness } = useDRMContract();
  const { toast } = useToast();
  const router = useRouter();
  const { address: user } = useAccount();
  const { contract } = useContract({
    abi: DrmABI,
    address: ContractAddress,
  });

  const {
    data: transactionData,
    isLoading: isTransactionLoading,
    error: transactionError,
  } = useWaitForTransaction({
    hash: transactionHash,
    watch: true,
    retry: true,
    refetchInterval: 3000,
  });

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (transactionTimeout) clearTimeout(transactionTimeout);
    };
  }, [transactionTimeout]);

  // Handle transaction completion
  useEffect(() => {
    if (transactionError) {
      toast({
        title: "Transaction failed",
        description: transactionError.message,
        variant: "destructive",
      });
      setIsUploading(false);
      setWalletActionRequired(false);
    }

    if (
      transactionHash &&
      transactionData &&
      "finality_status" in transactionData &&
      transactionData.finality_status === "ACCEPTED_ON_L2"
    ) {
      handleTransactionSuccess(transactionData);
    }
  }, [transactionData, transactionHash, transactionError]);

  const parseOnChainId = (txData: any): number => {
    try {
      return Number(txData.events[0].data[0]);
    } catch (error) {
      console.error("Error parsing on-chain ID:", error);
      return 0;
    }
  };

  const updateContentRecord = async (contentId: number, onChainId: number) => {
    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onChainId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update content record");
      }
    } catch (error) {
      console.error("Error updating content record:", error);
      toast({
        title: "Warning",
        description:
          "Content uploaded but failed to update blockchain reference",
        variant: "destructive",
      });
    }
  };

  const handleTransactionSuccess = async (txData: any) => {
    try {
      const onChainId = parseOnChainId(txData);
      console.log("Transaction successful, on-chain ID:", onChainId);

      setUploadProgress(100);
      toast({
        title: "Content uploaded and registered on blockchain successfully!",
      });
      router.push("/content");
    } catch (error) {
      console.error("Error handling transaction success:", error);
    } finally {
      setIsUploading(false);
      setWalletActionRequired(false);
    }
  };

  const encodeIpfsHash = (ipfsUrl: string): string => {
    const cleanUrl = ipfsUrl.startsWith("https://")
      ? ipfsUrl.slice(8)
      : ipfsUrl.startsWith("ipfs://")
        ? ipfsUrl.slice(7)
        : ipfsUrl;

    const hexString = Array.from(cleanUrl)
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");

    return `0x${hexString}`;
  };

  const decodeIpfsHash = (encoded: string): string => {
    const hex = encoded.startsWith("0x") ? encoded.slice(2) : encoded;
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  };

  const handleBlockchainUpload = async (title: string, ipfsHash: string) => {
    if (!isReady) {
      const readinessCheck = checkReadiness();
      console.error("Not ready for blockchain upload:", readinessCheck.issues);
      toast({
        title: "Wallet not ready",
        description: readinessCheck.issues.join(", "),
        variant: "destructive",
      });
      return null;
    }

    // Set 3-minute timeout
    const timeout = setTimeout(() => {
      toast({
        title: "Transaction timeout",
        description:
          "The transaction is taking longer than expected. Please check your wallet.",
        variant: "destructive",
      });
      setIsUploading(false);
      setWalletActionRequired(true);
    }, 180000);

    setTransactionTimeout(timeout);
    setWalletActionRequired(true);

    try {
      const encodedTitle = `0x${Buffer.from(title).toString("hex")}`;
      const encodedIpfsHash = encodeIpfsHash(ipfsHash);

      console.log("Full encoded IPFS hash:", encodedIpfsHash);
      console.log("Decoded:", decodeIpfsHash(encodedIpfsHash));

      const txHash = await uploadContent(title, encodedIpfsHash);
      console.log("Blockchain upload successful:", txHash);

      clearTimeout(timeout);
      setTransactionHash(txHash);
      setWalletActionRequired(false);
      return txHash;
    } catch (error) {
      console.error("Blockchain upload failed:", error);
      clearTimeout(timeout);
      setWalletActionRequired(false);
      toast({
        title: "Blockchain upload failed",
        description:
          error instanceof Error ? error.message : "Transaction failed",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setBatchFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (activeTab === "single") {
        setFile(e.dataTransfer.files[0]);
      } else {
        const newFiles = Array.from(e.dataTransfer.files);
        setBatchFiles((prev) => [...prev, ...newFiles]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleRemoveBatchFile = (index: number) => {
    setBatchFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSingleUpload = async () => {
    if (!title || !file || !user) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setTransactionHash(undefined);
    setUploadProgress(0);

    try {
      // 1. Upload to IPFS
      const ipfsHash = await uploadToIPFS(file);
      setUploadProgress(30);

      // 2. Store in database (off-chain)
      const dbResponse = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          ipfsHash,
          creatorAddress: user,
          contentType,
        }),
      });

      if (!dbResponse.ok) throw new Error("Database storage failed");
      const { contentId } = await dbResponse.json();
      setUploadProgress(60);

      // 3. Optional: Register on Starknet
      if (useBlockchain) {
        const txHash = await handleBlockchainUpload(title, ipfsHash);
        if (!txHash) {
          setIsUploading(false);
          return;
        }

        setUploadProgress(80);
        // Transaction completion is handled by useEffect
      } else {
        setUploadProgress(100);
        toast({ title: "Content uploaded successfully!" });
        router.push("/content");
        setIsUploading(false);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleBatchUpload = async () => {
    if (batchFiles.length === 0 || !user) {
      toast({ title: "No files selected", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setBatchProgress({});

    try {
      for (let i = 0; i < batchFiles.length; i++) {
        const file = batchFiles[i];
        const fileName = file.name;

        // Update progress for current file
        setBatchProgress((prev) => ({ ...prev, [fileName]: 20 }));

        // Upload to IPFS
        const ipfsHash = await uploadToIPFS(file);
        setBatchProgress((prev) => ({ ...prev, [fileName]: 50 }));

        // Store in database
        const dbResponse = await fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: fileName.split(".")[0], // Use filename as title
            description: `Batch uploaded file: ${fileName}`,
            ipfsHash,
            creatorAddress: user,
            contentType: "document", // Default for batch upload
          }),
        });

        if (!dbResponse.ok)
          throw new Error(`Database storage failed for ${fileName}`);
        setBatchProgress((prev) => ({ ...prev, [fileName]: 80 }));

        // Optional blockchain registration (simplified for batch)
        if (useBlockchain) {
          try {
            await handleBlockchainUpload(fileName.split(".")[0], ipfsHash);
          } catch (error) {
            console.error(`Blockchain upload failed for ${fileName}:`, error);
          }
        }

        setBatchProgress((prev) => ({ ...prev, [fileName]: 100 }));
      }

      toast({ title: `Successfully uploaded ${batchFiles.length} files!` });
      router.push("/content");
    } catch (error) {
      toast({
        title: "Batch upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "single") {
      await handleSingleUpload();
    } else {
      await handleBatchUpload();
    }
  };

  const ContentTypeIcon =
    contentTypes.find((type) => type.id === contentType)?.icon || FileText;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-3xl font-bold">Upload Content</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Upload</TabsTrigger>
          <TabsTrigger value="batch">Batch Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Upload Single Content</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
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
                      className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:bg-gray-50"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Drag and drop a file here, or click to select a file
                      </p>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <ContentTypeIcon className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="blockchain"
                    checked={useBlockchain}
                    onCheckedChange={setUseBlockchain}
                  />
                  <Label htmlFor="blockchain" className="text-sm font-normal">
                    Register content on Starknet blockchain for enhanced
                    protection
                  </Label>
                </div>

                {isUploading && (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>
                        {walletActionRequired ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Confirm in your wallet...
                          </span>
                        ) : isTransactionLoading ? (
                          "Processing blockchain transaction..."
                        ) : (
                          "Uploading..."
                        )}
                      </span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2.5 rounded-full bg-primary"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsUploading(false);
                        if (transactionTimeout)
                          clearTimeout(transactionTimeout);
                      }}
                      className="w-full"
                    >
                      Cancel Upload
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                disabled={isUploading}
                className="w-full"
              >
                {walletActionRequired ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirm in Wallet
                  </span>
                ) : isUploading ? (
                  "Processing..."
                ) : (
                  "Upload Content"
                )}
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
                    className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:bg-gray-50"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() =>
                      document.getElementById("batch-file-upload")?.click()
                    }
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Drag and drop files here, or click to select files
                    </p>
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
                    <div className="max-h-60 space-y-2 overflow-y-auto">
                      {batchFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-blue-500" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isUploading && (
                              <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{
                                    width: `${batchProgress[file.name] || 0}%`,
                                  }}
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
                  <Switch
                    id="batch-blockchain"
                    checked={useBlockchain}
                    onCheckedChange={setUseBlockchain}
                  />
                  <Label
                    htmlFor="batch-blockchain"
                    className="text-sm font-normal"
                  >
                    Register all content on Starknet blockchain
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                disabled={isUploading || batchFiles.length === 0}
                className="w-full"
              >
                {isUploading
                  ? "Uploading..."
                  : `Upload ${batchFiles.length} Files`}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
