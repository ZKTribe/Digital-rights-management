import Image from "next/image";
import { Connector } from "@starknet-react/core";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useState } from "react";
import { useWalletContext } from "./WalletProvider";
import AnimationWrapper from "@/motion/animattion-wrapper";

// Helper for loading images
const loader = ({ src }: { src: string }) => {
  return src;
};

const ConnectModal = () => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const { connectors, connectAsync, isWalletModalOpen, closeWalletModal } =
    useWalletContext();

  const handleSelect = (walletId: string) => {
    setSelectedWallet(walletId);
  };

  // ② On confirm, look up the connector object and call connectWallet
  const handleConfirm = async () => {
    if (!selectedWallet) return;

    const connector = connectors.find((c) => c.id === selectedWallet);
    if (!connector) {
      console.error("Connector not found:", selectedWallet);
      return;
    }

    try {
      await connectAsync({ connector }); // ■ await the wallet prompt
      closeWalletModal();
    } catch (err) {
      console.error("Wallet connection failed:", err); // ■ handle rejections
    }
  };

  // helper to get icon source
  function getIconSource(
    icon: string | { dark: string; light: string },
  ): string {
    if (typeof icon === "string") {
      return icon;
    } else {
      return icon.dark;
    }
  }

  // Check if the icon is an SVG string
  function isSvgString(str: string): boolean {
    return str.trim().startsWith("<svg");
  }

  return (
    <Dialog open={isWalletModalOpen} onOpenChange={closeWalletModal}>
      <AnimatePresence>
        {isWalletModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 backdrop-blur-[4px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <DialogContent className="border-2 border-slate-200 bg-white font-mono text-slate-900 sm:max-w-md dark:border-slate-800 dark:bg-slate-900 dark:text-white">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.2 },
                }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              >
                <DialogHeader>
                  <DialogTitle className="mb-6 text-center text-xl text-[#2A3B47] dark:text-[#3A4B57]">
                    Choose a wallet
                  </DialogTitle>
                </DialogHeader>

                <div className="mb-6 space-y-3">
                  {connectors.map((wallet, index) => (
                    <AnimationWrapper
                      key={wallet?.id}
                      variant="slideRight"
                      delay={index * 0.1}
                    >
                      <button
                        className={`flex w-full items-center gap-3 rounded-sm border-2 p-3 font-mono transition-all duration-300 ${
                          selectedWallet === wallet.id
                            ? "border-[#2A3B47] bg-[#2A3B47]/10 dark:border-[#3A4B57] dark:bg-[#3A4B57]/20"
                            : "border-slate-200 hover:border-[#2A3B47] hover:bg-[#2A3B47]/5 dark:border-slate-700 dark:hover:border-[#3A4B57] dark:hover:bg-[#3A4B57]/10"
                        }`}
                        onClick={() => handleSelect(wallet.id)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full">
                          {/* Render SVG string directly if it's an SVG */}
                          {isSvgString(getIconSource(wallet.icon)) ? (
                            <div
                              className="h-full w-full text-[#2A3B47] dark:text-[#3A4B57]"
                              dangerouslySetInnerHTML={{
                                __html: getIconSource(wallet.icon),
                              }}
                            />
                          ) : (
                            <Image
                              src={getIconSource(wallet.icon)}
                              alt={wallet.name}
                              width={30}
                              height={30}
                              className="object-contain"
                            />
                          )}
                        </div>
                        <span className="text-slate-900 dark:text-slate-200">
                          {wallet.name}
                        </span>
                      </button>
                    </AnimationWrapper>
                  ))}
                </div>

                {/* ③ Confirmation button */}
                <AnimationWrapper variant="slideUp" delay={0.3}>
                  <button
                    onClick={handleConfirm}
                    disabled={!selectedWallet}
                    className={`w-full rounded-sm border py-3 font-mono outline-none transition-all duration-300 ${
                      selectedWallet
                        ? "border-[#1A2B37] bg-[#2A3B47] text-white hover:bg-[#3A4B57] dark:bg-[#2A3B47] dark:hover:bg-[#3A4B57]"
                        : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600"
                    }`}
                  >
                    Connect
                  </button>
                </AnimationWrapper>
              </motion.div>
            </DialogContent>
          </>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

const ConnectButton = ({
  text = " Connect Wallet",
  className = "bg-[#2A3B47] hover:bg-[#3A4B57] text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors",
}: {
  text?: string;
  className?: string;
}) => {
  const { isPending, openWalletModal } = useWalletContext();

  return (
    <>
      <motion.button
        aria-haspopup="dialog"
        disabled={isPending}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={openWalletModal}
        className={className}
      >
        {text}
      </motion.button>
      <ConnectModal />
    </>
  );
};

export default ConnectButton;
