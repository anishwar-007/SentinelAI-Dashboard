import type { SpanView } from "@/types/trace";

export type SpanKind =
  | "llm"
  | "retrieval"
  | "tool"
  | "verification"
  | "analysis"
  | "planner"
  | "default";

/** Infer span kind from name + attributes for restrained semantic accents. */
export function inferSpanKind(span: Pick<SpanView, "name" | "attributes" | "model">): SpanKind {
  const name = span.name.toLowerCase();
  const attrs = span.attributes ?? {};
  const kindAttr = String(
    attrs.span_kind ?? attrs.kind ?? attrs.type ?? "",
  ).toLowerCase();

  if (
    kindAttr.includes("llm") ||
    name.includes("llm") ||
    name.includes("generate") ||
    name.includes("completion") ||
    name.includes("chat") ||
    Boolean(span.model)
  ) {
    return "llm";
  }
  if (
    kindAttr.includes("retriev") ||
    kindAttr.includes("rag") ||
    name.includes("retriev") ||
    name.includes("embed") ||
    name.includes("search")
  ) {
    return "retrieval";
  }
  if (
    kindAttr.includes("tool") ||
    name.includes("tool") ||
    name.includes("function")
  ) {
    return "tool";
  }
  if (
    kindAttr.includes("verif") ||
    name.includes("verif") ||
    name.includes("guard")
  ) {
    return "verification";
  }
  if (
    kindAttr.includes("analys") ||
    name.includes("root cause") ||
    name.includes("analysis") ||
    name.includes("rca")
  ) {
    return "analysis";
  }
  if (kindAttr.includes("plan") || name.includes("plan")) {
    return "planner";
  }
  return "default";
}

export function spanKindAccent(kind: SpanKind): {
  border: string;
  icon: string;
  bar: string;
  label: string;
} {
  switch (kind) {
    case "llm":
      return {
        border: "border-l-llm",
        icon: "text-llm",
        bar: "bg-llm/70",
        label: "LLM",
      };
    case "retrieval":
      return {
        border: "border-l-retrieval",
        icon: "text-retrieval",
        bar: "bg-retrieval/70",
        label: "Retrieval",
      };
    case "tool":
      return {
        border: "border-l-tool",
        icon: "text-tool",
        bar: "bg-tool/70",
        label: "Tool",
      };
    case "verification":
      return {
        border: "border-l-accent",
        icon: "text-accent",
        bar: "bg-accent/70",
        label: "Verify",
      };
    case "analysis":
      return {
        border: "border-l-info",
        icon: "text-info",
        bar: "bg-info/70",
        label: "Analysis",
      };
    case "planner":
      return {
        border: "border-l-accent",
        icon: "text-accent",
        bar: "bg-accent/60",
        label: "Planner",
      };
    default:
      return {
        border: "border-l-border",
        icon: "text-muted-foreground",
        bar: "bg-foreground/40",
        label: "Span",
      };
  }
}

export function extractTokenCount(
  tokens: Record<string, unknown> | null | undefined,
): number | null {
  if (!tokens) return null;
  const total =
    tokens.total ??
    tokens.total_tokens ??
    (typeof tokens.prompt === "number" || typeof tokens.completion === "number"
      ? Number(tokens.prompt ?? 0) + Number(tokens.completion ?? 0)
      : null) ??
    tokens.prompt_tokens ??
    null;
  if (typeof total === "number" && !Number.isNaN(total)) return total;
  if (typeof total === "string" && total.trim() !== "") {
    const n = Number(total);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function estimateCostUsd(
  tokens: Record<string, unknown> | null | undefined,
  model?: string | null,
): number | null {
  const count = extractTokenCount(tokens);
  if (count == null) return null;
  // Rough illustrative estimate when platform does not return cost.
  const per1k = model?.toLowerCase().includes("gpt-4") ? 0.03 : 0.002;
  return (count / 1000) * per1k;
}

export function formatCost(usd: number | null | undefined): string {
  if (usd == null || Number.isNaN(usd)) return "—";
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(3)}`;
}
