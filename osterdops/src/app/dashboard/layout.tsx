import React from "react";
import { DemoBanner } from "@/components/dashboard/DemoBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <DemoBanner />
      {children}
    </div>
  );
}
