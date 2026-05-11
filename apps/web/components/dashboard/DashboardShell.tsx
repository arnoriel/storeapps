"use client";

import { useOrderWS } from "@/hooks/useOrderWS";
import ConnectionIndicator from "./ConnectionIndicator";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  useOrderWS(); // aktifkan WS connection
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-gray-900">Dashboard</h1>
            <ConnectionIndicator />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.username}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}