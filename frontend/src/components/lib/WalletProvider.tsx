"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useConnect,
  useAccount,
  useDisconnect,
  Connector,
  ConnectVariables,
} from "@starknet-react/core";

interface WalletContextProps {
  account: string | null;
  connectors: Connector[]; // ← Exposed connectors
  connectWallet: (connector: Connector) => void; // ← Takes connector arg
  disconnectWallet: () => void;
  connectAsync: (args?: ConnectVariables) => Promise<void>;
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  isPending: boolean;
}

const WalletContext = createContext<WalletContextProps>({
  account: null,
  connectors: [], // ← Default empty
  connectWallet: () => {},
  disconnectWallet: () => {},
  connectAsync: () => Promise.resolve(),
  isWalletModalOpen: false,
  openWalletModal: () => {},
  closeWalletModal: () => {},
  isPending: false,
});

export const WalletProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { connect, connectors, connectAsync, isPending } = useConnect();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Accept a specific connector when connecting
  const connectWallet = useCallback(
    (connector: Connector) => {
      connect({ connector });
    },
    [connect],
  );

  const openWalletModal = useCallback(() => {
    setIsWalletModalOpen(true);
  }, []);

  const closeWalletModal = useCallback(() => {
    setIsWalletModalOpen(false);
  }, []);

  // Save wallet address to localStorage when connected
  useEffect(() => {
    if (address) {
      localStorage.setItem("walletAddress", address);
    } else {
      localStorage.removeItem("walletAddress");
    }
  }, [address]);

  return (
    <WalletContext.Provider
      value={{
        account: address ?? null,
        connectors, // ← Now available to consumers
        connectWallet, // ← Can specify which connector
        disconnectWallet: disconnect,
        connectAsync,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        isPending,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWalletContext must be inside WalletProvider");
  }
  return ctx;
};
