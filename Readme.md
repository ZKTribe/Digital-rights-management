# 🎼 Decentralized Digital Rights Management (DRM) System on StarkNet

A secure, decentralized solution for managing digital content rights using StarkNet smart contracts. This project enables content creators to upload their content, define license terms, and earn revenue through verifiable on-chain licensing, while users can purchase access rights in a trustless, transparent way.

## 📦 Project Overview

This DRM platform empowers creators to upload digital content and control how it's licensed using smart contracts. Key features include:

- Content upload with license pricing, expiration, and max licenses.
- Secure, token-based license purchases.
- Transparent record of ownership and license status.
- Royalties paid directly to content creators via smart contracts.

## 🧠 How It Works

1. **Content Upload**: Creators specify a price, expiration time, and number of allowed licenses. The metadata is stored in a StarkNet smart contract, optionally with media hosted on IPFS.

2. **License Purchase**: Users interact with the smart contract to purchase access rights (licenses). Funds are transferred directly to the creator.

3. **License Verification**: Anyone can verify if a user owns a valid license for a given content ID.



## 🛠 Tech Stack

| Layer       | Technology             |
|-------------|------------------------|
| **Blockchain** | StarkNet (Layer 2)     |
| **Smart Contracts** | Cairo 1.0 (with StarkNet macros) |
| **Frontend** | React.js       |
| **Wallet Integration** | StarkNet.js + ArgentX/Braavos |
| **Dev Tools** | Scarb, StarkNet CLI|
| **Testing** | Cairo Lang Test|

