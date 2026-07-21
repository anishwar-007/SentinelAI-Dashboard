import type { SpanTreeNode, SpanView } from "@/types/trace";

/** Build a forest of spans preserving parent/child relationships. */
export function buildSpanForest(spans: SpanView[]): SpanTreeNode[] {
  const nodes = new Map<string, SpanTreeNode>();
  for (const span of spans) {
    nodes.set(span.span_id, { ...span, children: [], depth: 0 });
  }

  const roots: SpanTreeNode[] = [];
  for (const node of nodes.values()) {
    const parentId = node.parent_span_id;
    if (parentId && nodes.has(parentId) && parentId !== node.span_id) {
      nodes.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const assignDepth = (node: SpanTreeNode, depth: number) => {
    node.depth = depth;
    node.children.sort(byStart);
    for (const child of node.children) assignDepth(child, depth + 1);
  };
  roots.sort(byStart);
  for (const root of roots) assignDepth(root, 0);
  return roots;
}

export function flattenSpanForest(roots: SpanTreeNode[]): SpanTreeNode[] {
  const out: SpanTreeNode[] = [];
  const walk = (node: SpanTreeNode) => {
    out.push(node);
    for (const child of node.children) walk(child);
  };
  for (const root of roots) walk(root);
  return out;
}

function byStart(a: SpanView, b: SpanView): number {
  return new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
}

export function spanOffsetPercent(
  span: SpanView,
  traceStartMs: number,
  totalMs: number,
): { left: number; width: number } {
  if (totalMs <= 0) return { left: 0, width: 100 };
  const start = new Date(span.started_at).getTime();
  const end = span.ended_at
    ? new Date(span.ended_at).getTime()
    : start + (span.latency_ms ?? 0);
  const left = Math.max(0, ((start - traceStartMs) / totalMs) * 100);
  const width = Math.max(0.4, ((end - start) / totalMs) * 100);
  return { left: Math.min(left, 99), width: Math.min(width, 100 - left) };
}
