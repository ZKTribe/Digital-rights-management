"use client";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "@starknet-react/core";
import AddressBar from "../lib/AddressBar";
import ConnectButton from "../lib/Connect";
import Link from "next/link";
import MenuButton from "./MenuButton";
import { MobileSidebar } from "../sidebar";
import { Sheet, SheetContent } from "../ui/sheet";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { address } = useAccount();
  const lastYRef = useRef(0);

  useEffect(() => {
    const nav = document.getElementById("nav");
    const handleScroll = () => {
      const difference = window.scrollY - lastYRef.current;
      if (Math.abs(difference) > 50) {
        if (difference > 0) {
          nav?.setAttribute("data-header", "scroll-hide");
        } else {
          nav?.setAttribute("data-header", "scroll-show");
        }
        lastYRef.current = window.scrollY;
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-[#e6f7d9] via-[#f0f9ff] to-[#e6f7d9] py-8 md:py-12">
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-[#c8e6c9]/20 blur-3xl"></div>
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#bbdefb]/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#455a64]/10 blur-3xl"></div>
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 md:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <div>
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center overflow-hidden rounded-md bg-white/10 p-1 shadow-sm backdrop-blur-sm">
                <div className="flex">
                  <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text px-2 py-1 text-xl font-bold text-transparent">
                    D
                  </span>
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text px-2 py-1 text-xl font-bold text-transparent">
                    R
                  </span>
                  <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text px-2 py-1 text-xl font-bold text-transparent">
                    M
                  </span>
                </div>
              </div>
            </Link>
          </div>
          <div className="relative">
            {address ? (
              <div className="flex items-center gap-4">
                <AddressBar />
                <MenuButton />
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>
      <motion.div
        className="mx-auto mt-8 max-w-3xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-3xl font-bold leading-tight text-[#2A3B47] md:text-4xl lg:text-5xl">
          Unlock Your Creative Potential
          <br />
          with Advanced Digital Rights
          <br />
          Management
        </h1>
      </motion.div>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 border-l-0 border-r-0 p-0">
          <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
