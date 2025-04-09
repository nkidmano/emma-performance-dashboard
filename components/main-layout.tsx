"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Navigation Links */}
              <div className="flex items-center space-x-4">
                <Link
                  href="/public"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Metrics
                </Link>
                <Link
                  href="/pagespeed"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === "/pagespeed"
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Page Speed
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
