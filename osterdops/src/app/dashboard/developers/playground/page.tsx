"use client";

import React from "react";
import { DeveloperPortalLayout } from "@/components/developers/DeveloperPortalLayout";
import { PlaygroundView } from "@/components/developers/PlaygroundView";

export default function DeveloperPlaygroundPage() {
  return (
    <DeveloperPortalLayout
      title="API Playground"
      subtitle="Test upstream LLM models, hyperparameters, streaming SSE responses, and token usage in real-time"
    >
      <PlaygroundView />
    </DeveloperPortalLayout>
  );
}
