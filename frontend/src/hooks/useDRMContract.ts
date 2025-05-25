import { useContract, useAccount, useContractWrite } from '@starknet-react/core';
import { CallData, shortString } from 'starknet';
import { DrmABI } from '@/common/abis/abi';
import { ContractAddress } from '@/common/abis/data';

export function useDRMContract() {
  const { address: userAddress, status: accountStatus, account } = useAccount();

  // Contract must be connected with the signer/account for write operations
  const { contract } = useContract({
    abi: DrmABI,
    address: ContractAddress,
    provider: account,
  });

  // Initialize useContractWrite without calls, we'll update dynamically on write
  const {
    writeAsync,
    data: txSubmitData,
    isPending: isSubmitting,
    error: submitError,
  } = useContractWrite({ calls: [] });

  const uploadContent = async (title: string, ipfsHash: string): Promise<string | undefined> => {
    // ✅ Enhanced error checking with specific messages
    if (accountStatus !== "connected") {
      throw new Error("Please connect your wallet first.");
    }
    
    if (!userAddress) {
      throw new Error("User address not available. Please reconnect your wallet.");
    }
    
    if (!contract) {
      throw new Error("Contract not initialized. Please try refreshing the page.");
    }
    
    if (!account) {
      throw new Error("Account not available for signing transactions.");
    }

    // ✅ Enhanced title encoding with better error handling
    let feltCompatibleTitle: string;
    try {
      if (!title || title.trim().length === 0) {
        feltCompatibleTitle = shortString.encodeShortString("Untitled");
      } else if (title.length > 31) {
        // Take first 31 characters and ensure it's valid
        const truncatedTitle = title.substring(0, 31);
        feltCompatibleTitle = shortString.encodeShortString(truncatedTitle);
      } else {
        feltCompatibleTitle = shortString.encodeShortString(title);
      }
    } catch (e: any) {
      console.error("Title encoding error:", e);
      // Fallback to a safe default
      feltCompatibleTitle = shortString.encodeShortString("Content");
    }

    // ✅ Better IPFS hash handling
    let feltCompatibleIpfsHash: string;
    try {
      if (ipfsHash && ipfsHash.length > 0) {
        // For now, use a truncated version or hash of the IPFS hash
        // In production, you might want to store full hash off-chain
        const hashToStore = ipfsHash.length > 31 ? ipfsHash.substring(0, 31) : ipfsHash;
        feltCompatibleIpfsHash = shortString.encodeShortString(hashToStore);
      } else {
        feltCompatibleIpfsHash = shortString.encodeShortString("NO_HASH");
      }
    } catch (e: any) {
      console.error("IPFS hash encoding error:", e);
      feltCompatibleIpfsHash = shortString.encodeShortString("HASH_ERROR");
    }

    // ✅ Proper calldata compilation
    const calldata = CallData.compile([feltCompatibleTitle, feltCompatibleIpfsHash]);

    console.log("Uploading to blockchain with:", {
      title: title,
      encodedTitle: feltCompatibleTitle,
      ipfsHash: ipfsHash,
      encodedIpfsHash: feltCompatibleIpfsHash,
      contractAddress: ContractAddress,
      userAddress: userAddress
    });

    try {
      const result = await writeAsync({
        calls: [
          {
            contractAddress: ContractAddress,
            entrypoint: 'upload_content',
            calldata,
          },
        ],
      });

      console.log("Transaction result:", result);

      if (!result || !result.transaction_hash) {
        throw new Error("Transaction submission failed - no transaction hash returned.");
      }

      return result.transaction_hash;
    } catch (error: any) {
      console.error("Blockchain upload error:", error);
      
      // ✅ Enhanced error handling with more specific messages
      if (error?.message?.toLowerCase().includes("user aborted") || 
          error?.message?.toLowerCase().includes("user rejected") ||
          error.code === 4001) {
        throw new Error("Transaction was rejected by user.");
      }
      
      if (error?.message?.toLowerCase().includes("insufficient funds")) {
        throw new Error("Insufficient funds to complete the transaction.");
      }
      
      if (error?.message?.toLowerCase().includes("network")) {
        throw new Error("Network error. Please check your connection and try again.");
      }
      
      if (error?.message?.toLowerCase().includes("contract")) {
        throw new Error("Contract interaction failed. The contract may be unavailable.");
      }

      // Generic error with original message
      throw new Error(error?.message || "Unknown error during blockchain transaction.");
    }
  };

  // ✅ Helper function to check if everything is ready for blockchain operations
  const checkReadiness = () => {
    const issues = [];
    
    if (accountStatus !== "connected") issues.push("Wallet not connected");
    if (!userAddress) issues.push("No user address");
    if (!contract) issues.push("Contract not initialized");
    if (!account) issues.push("Account not available");
    
    return {
      isReady: issues.length === 0,
      issues
    };
  };

  return {
    uploadContent,
    isReady: accountStatus === "connected" && !!userAddress && !!contract && !!account,
    isAccountConnected: accountStatus === "connected" && !!userAddress,
    accountStatus,
    isSubmitting,
    txSubmitData,
    submitError,
    checkReadiness, // ✅ Added helper function
    userAddress,
    contract,
  };
}