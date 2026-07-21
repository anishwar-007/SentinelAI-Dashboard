"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { formatLatency, cn } from "@/lib/utils";
import { buildSpanForest, flattenSpanForest } from "@/lib/trace-tree";
import type { SpanView } from "@/types/trace";

function SpanNode({
  data,
}: {
  data: {
    label: string;
    status: string;
    latency: string;
    selected: boolean;
  };
}) {
  const errored = data.status === "error";
  return (
    <div
      className={cn(
        "min-w-[160px] rounded-md border bg-card px-3 py-2 shadow-sm",
        errored ? "border-red-500/60" : "border-border",
        data.selected && "ring-2 ring-sky-500/60",
      )}
    >
      <div className="font-mono text-xs font-medium text-foreground">
        {data.label}
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span className={errored ? "text-red-400" : ""}>{data.status}</span>
        <span>{data.latency}</span>
      </div>
    </div>
  );
}

const nodeTypes = { span: SpanNode };

export function TraceGraph({
  spans,
  selectedId,
  onSelect,
}: {
  spans: SpanView[];
  selectedId?: string | null;
  onSelect: (span: SpanView) => void;
}) {
  const { nodes, edges, byId } = useMemo(() => {
    const forest = buildSpanForest(spans);
    const flat = flattenSpanForest(forest);
    const map = new Map(spans.map((s) => [s.span_id, s]));
    const levelIndex = new Map<number, number>();

    const nodes: Node[] = flat.map((span) => {
      const col = levelIndex.get(span.depth) ?? 0;
      levelIndex.set(span.depth, col + 1);
      return {
        id: span.span_id,
        type: "span",
        position: { x: span.depth * 220, y: col * 90 },
        data: {
          label: span.name,
          status: span.status,
          latency: formatLatency(span.latency_ms),
          selected: selectedId === span.span_id,
        },
      };
    });

    const edges: Edge[] = flat
      .filter((s) => s.parent_span_id && map.has(s.parent_span_id))
      .map((s) => ({
        id: `${s.parent_span_id}-${s.span_id}`,
        source: s.parent_span_id!,
        target: s.span_id,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
        style: { stroke: "var(--border)" },
      }));

    return { nodes, edges, byId: map };
  }, [spans, selectedId]);

  if (spans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No spans in this trace.</p>
    );
  }

  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-border bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          const span = byId.get(node.id);
          if (span) onSelect(span);
        }}
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Background gap={16} size={1} color="var(--border)" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          className="!bg-card"
          maskColor="rgb(0 0 0 / 0.4)"
        />
      </ReactFlow>
    </div>
  );
}
