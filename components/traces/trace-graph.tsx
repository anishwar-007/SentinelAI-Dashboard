"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Bot,
  Database,
  GitBranch,
  Search,
  ShieldCheck,
  Wrench,
  CircleDot,
} from "lucide-react";
import { formatLatency, cn } from "@/lib/utils";
import { buildSpanForest, flattenSpanForest } from "@/lib/trace-tree";
import { GRAPH_NODE_SIZE, layoutSpanForest } from "@/lib/graph-layout";
import {
  inferSpanKind,
  spanKindAccent,
  type SpanKind,
} from "@/lib/span-style";
import type { SpanView } from "@/types/trace";

type SpanNodeData = {
  label: string;
  status: string;
  latency: string;
  selected: boolean;
  onPath: boolean;
  kind: SpanKind;
};

function KindIcon({ kind, className }: { kind: SpanKind; className?: string }) {
  const props = { className: cn("h-3 w-3 shrink-0", className) };
  switch (kind) {
    case "llm":
      return <Bot {...props} />;
    case "retrieval":
      return <Database {...props} />;
    case "tool":
      return <Wrench {...props} />;
    case "verification":
      return <ShieldCheck {...props} />;
    case "analysis":
      return <Search {...props} />;
    case "planner":
      return <GitBranch {...props} />;
    default:
      return <CircleDot {...props} />;
  }
}

function SpanNode({ data }: NodeProps<Node<SpanNodeData>>) {
  const errored = data.status === "error";
  const accent = spanKindAccent(data.kind);

  return (
    <div
      className={cn(
        "w-[188px] rounded-md border border-border border-l-[3px] bg-card px-2.5 py-2 transition-[border-color,box-shadow,background-color] duration-200",
        accent.border,
        errored && "border-error/50",
        data.selected && "border-accent shadow-[0_0_0_1px_var(--accent)]",
        data.onPath && !data.selected && "border-accent/40 bg-accent-muted/40",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-border !bg-muted-foreground"
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <KindIcon kind={data.kind} className={accent.icon} />
          <span className="truncate font-mono text-[11px] font-medium text-foreground">
            {data.label}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 font-mono text-[10px] uppercase tracking-wide",
            errored ? "text-error" : "text-success",
          )}
        >
          {data.status === "ok" ? "OK" : data.status}
        </span>
      </div>
      <div className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
        {data.latency}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !border-border !bg-muted-foreground"
      />
    </div>
  );
}

const nodeTypes = { span: SpanNode };

const MINIMAP_THRESHOLD = 8;

function pathIdsForSelection(
  spans: SpanView[],
  selectedId: string | null | undefined,
): Set<string> {
  const set = new Set<string>();
  if (!selectedId) return set;
  const byId = new Map(spans.map((s) => [s.span_id, s]));
  let cur: string | null | undefined = selectedId;
  while (cur && byId.has(cur)) {
    set.add(cur);
    cur = byId.get(cur)!.parent_span_id;
  }
  for (const span of spans) {
    if (span.parent_span_id === selectedId) set.add(span.span_id);
  }
  return set;
}

function FitViewOnData({ spanCount }: { spanCount: number }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const t = window.setTimeout(() => {
      fitView({ padding: 0.18, duration: 200 });
    }, 40);
    return () => window.clearTimeout(t);
  }, [spanCount, fitView]);
  return null;
}

export function TraceGraph({
  spans,
  selectedId,
  onSelect,
  className,
  heightClass = "h-[480px]",
}: {
  spans: SpanView[];
  selectedId?: string | null;
  onSelect: (span: SpanView) => void;
  className?: string;
  heightClass?: string;
}) {
  const pathIds = useMemo(
    () => pathIdsForSelection(spans, selectedId),
    [spans, selectedId],
  );

  const { nodes, edges, byId } = useMemo(() => {
    const forest = buildSpanForest(spans);
    const flat = flattenSpanForest(forest);
    const map = new Map(spans.map((s) => [s.span_id, s]));
    const laidOut = layoutSpanForest(forest);

    const nodes: Node[] = flat.map((span) => {
      const pos = laidOut.get(span.span_id);
      const kind = inferSpanKind(span);
      return {
        id: span.span_id,
        type: "span",
        position: { x: pos?.x ?? 0, y: pos?.y ?? 0 },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        data: {
          label: span.name,
          status: span.status,
          latency: formatLatency(span.latency_ms),
          selected: selectedId === span.span_id,
          onPath: pathIds.has(span.span_id),
          kind,
        } satisfies SpanNodeData,
        style: {
          width: GRAPH_NODE_SIZE.width,
          height: GRAPH_NODE_SIZE.height,
        },
      };
    });

    const edges: Edge[] = flat
      .filter((s) => s.parent_span_id && map.has(s.parent_span_id))
      .map((s) => {
        const onPath =
          pathIds.has(s.span_id) && pathIds.has(s.parent_span_id!);
        return {
          id: `${s.parent_span_id}-${s.span_id}`,
          source: s.parent_span_id!,
          target: s.span_id,
          type: "smoothstep",
          animated: onPath,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color: onPath ? "var(--accent)" : "var(--border)",
          },
          style: {
            stroke: onPath ? "var(--accent)" : "var(--border)",
            strokeWidth: onPath ? 1.75 : 1.15,
            transition: "stroke 200ms, stroke-width 200ms",
          },
        };
      });

    return { nodes, edges, byId: map };
  }, [spans, selectedId, pathIds]);

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const span = byId.get(node.id);
      if (span) onSelect(span);
    },
    [byId, onSelect],
  );

  if (spans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No spans in this trace.</p>
    );
  }

  const showMinimap = spans.length >= MINIMAP_THRESHOLD;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-background",
        heightClass,
        className,
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        proOptions={{ hideAttribution: true }}
        onNodeClick={onNodeClick}
        onPaneClick={() => {}}
        minZoom={0.25}
        maxZoom={1.6}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnScroll
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <FitViewOnData spanCount={spans.length} />
        <Background gap={18} size={1} color="var(--border)" />
        <Controls showInteractive={false} position="bottom-left" />
        {showMinimap ? (
          <MiniMap
            pannable
            zoomable
            className="!bg-card"
            maskColor="rgb(28 25 23 / 0.12)"
            nodeColor={() => "var(--muted)"}
          />
        ) : null}
      </ReactFlow>
    </div>
  );
}
