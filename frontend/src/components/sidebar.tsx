"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  CopyrightIcon,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  children?: { href: string; label: string }[];
  onClose?: () => void;
}

function NavItem({
  href,
  icon,
  label,
  active,
  children,
  onClose,
}: NavItemProps) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  const hasChildren = children && children.length > 0;

  // Check if any child route is active
  const isChildActive =
    hasChildren &&
    children.some(
      (child) =>
        pathname === child.href || pathname.startsWith(child.href + "/"),
    );

  // Automatically expand if a child is active
  useEffect(() => {
    if (isChildActive) {
      setExpanded(true);
    }
  }, [isChildActive]);

  return (
    <div className="mb-1">
      {hasChildren ? (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
            active || isChildActive
              ? "bg-slate-800 text-white"
              : "text-slate-200 hover:bg-slate-700/50"
          }`}
        >
          {icon}
          <span>{label}</span>
          <span className="ml-auto">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        </button>
      ) : (
        <Link
          href={href}
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
            active
              ? "bg-slate-800 text-white"
              : "text-slate-200 hover:bg-slate-700/50"
          }`}
          onClick={onClose}
        >
          {icon}
          <span>{label}</span>
        </Link>
      )}

      {hasChildren && expanded && (
        <div className="ml-9 mt-1 space-y-1">
          {children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`block rounded-md px-3 py-1 text-sm ${
                pathname === child.href || pathname.startsWith(child.href + "/")
                  ? "bg-slate-800/50 text-white"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
              onClick={onClose}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Shared sidebar content component
export function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      <NavItem
        href="/dashboard"
        icon={<LayoutDashboard size={18} />}
        label="Dashboard"
        active={pathname === "/dashboard" || pathname === "/"}
        onClose={onClose}
      />

      <NavItem
        href="/upload"
        icon={<Upload size={18} />}
        label="Upload Content"
        active={pathname === "/upload"}
        onClose={onClose}
      />

      <NavItem
        href="/content"
        icon={<CopyrightIcon size={18} />}
        label="My Content"
        active={pathname.startsWith("/content")}
        onClose={onClose}
        children={[
          { href: "/content", label: "All Content" },
          { href: "/content/videos", label: "Videos" },
          { href: "/content/audio", label: "Audio" },
          { href: "/content/images", label: "Images" },
          { href: "/content/documents", label: "Documents" },
        ]}
      />

      <NavItem
        href="/licenses"
        icon={<CopyrightIcon size={18} />}
        label="Licenses"
        active={pathname.startsWith("/licenses")}
        onClose={onClose}
        children={[
          { href: "/licenses", label: "My Licenses" },
          { href: "/licenses/issued", label: "Issued Licenses" },
          { href: "/licenses/purchased", label: "Purchased Licenses" },
        ]}
      />

      <NavItem
        href="/marketplace"
        icon={<ShoppingCart size={18} />}
        label="Marketplace"
        active={pathname.startsWith("/marketplace")}
        onClose={onClose}
      />

      <NavItem
        href="/earnings"
        icon={<DollarSign size={18} />}
        label="Earnings"
        active={pathname === "/earnings"}
        onClose={onClose}
      />

      {/* <NavItem
        href="/analytics"
        icon={<BarChart3 size={18} />}
        label="Analytics"
        active={pathname === "/analytics"}
        onClose={onClose}
      /> */}

      {/* <div className="mt-4 border-t border-slate-600 pt-4">
        <NavItem
          href="/settings"
          icon={<Settings size={18} />}
          label="Settings"
          active={pathname === "/settings"}
          onClose={onClose}
        />

        <NavItem
          href="/help"
          icon={<HelpCircle size={18} />}
          label="Help & Support"
          active={pathname === "/help"}
          onClose={onClose}
        />
      </div> */}
    </nav>
  );
}

// Desktop sidebar
export default function Sidebar() {
  return (
    <aside className="hidden w-64 bg-slate-700 text-white md:block">
      <div className="border-b border-slate-600 p-4">
        <h2 className="text-xl font-semibold">DRM Console</h2>
      </div>
      <SidebarContent />
    </aside>
  );
}

// Mobile sidebar
export function MobileSidebar({ onClose }: { onClose?: () => void }) {
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        onClose?.();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  return (
    <div className="flex h-full flex-col bg-slate-700 text-white">
      <div className="flex items-center justify-between border-b border-slate-600 p-4">
        <h2 className="text-xl font-semibold">DRM Console</h2>
      </div>
      <SidebarContent onClose={onClose} />
    </div>
  );
}
