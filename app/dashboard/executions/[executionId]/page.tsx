"use client";

import { use } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { ExecutionDetailView } from "@/components/executions/detail-view";

export default function ExecutionDetailPage({
  params,
}: {
  params: Promise<{ executionId: string }>;
}) {
  const { executionId } = use(params);

  return (
    <>
      <TopBar
        title="Execution detail"
        breadcrumb={`SentinelAI / Executions / ${executionId}`}
      />
      <main className="p-4 md:p-6">
        <ExecutionDetailView executionId={executionId} />
      </main>
    </>
  );
}
