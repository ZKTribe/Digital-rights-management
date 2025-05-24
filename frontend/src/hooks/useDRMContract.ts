// src/hooks/useDRMContract.ts
import { useContract, useAccount } from '@starknet-react/core';
import { DrmABI } from '@/common/abis/abi';
import { ContractAddress } from '@/common/abis/data';

export function useDRMContract() {
  const { contract } = useContract({
    abi: DrmABI,
    address: ContractAddress,
  });

  const { address } = useAccount();

  const uploadContent = async (title: string, ipfsHash: string) => {
    if (!contract || !address) throw new Error('Contract or wallet not ready');
    
    try {
      const tx = await contract.upload_content(title, ipfsHash);
      return tx.hash;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error('Failed to upload content');
    }
  };

//   const issueLicense = async (contentId: number, licenseType: LicenseType) => {
//     if (!contract || !address) throw new Error('Contract or wallet not ready');
    
//     try {
//       const tx = await contract.issue_license(contentId, licenseType);
//       return tx.hash;
//     } catch (error) {
//       console.error('License issuance failed:', error);
//       throw new Error('Failed to issue license');
//     }
//   };

  return { 
    uploadContent,
    // issueLicense,
    isReady: !!contract && !!address
  };
}