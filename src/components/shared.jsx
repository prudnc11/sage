import {
  Circle,
  CircleDashed,
  CircleCheck,
} from "lucide-react";

/* ── Status Icons ── */
export function IssueStatusIcon({ variant, size = 16, color }) {
  const c = color || null;
  switch (variant) {
    case "done":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" fill={c || "#4caf50"} />
          <path d="M5 8L7 10.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "inProgress":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke={c || "#f59e0b"} strokeWidth="1.5" />
          <path d="M8 1.5A6.5 6.5 0 0 1 14.5 8 6.5 6.5 0 0 1 8 14.5" fill={c || "#f59e0b"} stroke={c || "#f59e0b"} strokeWidth="0.5" />
        </svg>
      );
    case "inReviewFilled":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke={c || "#5e6ad2"} strokeWidth="1.5" />
          <circle cx="8" cy="8" r="4" fill={c || "#5e6ad2"} />
        </svg>
      );
    case "cancelled":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke={c || "#9a9a9a"} strokeWidth="1.5" />
          <line x1="5" y1="8" x2="11" y2="8" stroke={c || "#9a9a9a"} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "todo":
      return <Circle size={size} strokeWidth={1.5} style={c ? { color: c } : undefined} className={c ? "" : "text-text-tertiary"} />;
    case "backlog":
      return <CircleDashed size={size} strokeWidth={1.5} style={c ? { color: c } : undefined} className={c ? "" : "text-text-tertiary"} />;
    default:
      return <Circle size={size} strokeWidth={1.5} style={c ? { color: c } : undefined} className={c ? "" : "text-text-tertiary"} />;
  }
}

/* ── Avatar ── */
export function Avatar({ initials, bg, size = 24, border = false }) {
  return (
    <div
      className={`rounded-[8px] ${bg} flex items-center justify-center shrink-0 ${border ? "ring-2 ring-ring" : ""}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={initials}
    >
      <span className="font-semibold text-white leading-none" style={{ fontSize: size * 0.42 }}>{initials}</span>
    </div>
  );
}

/* ── Status group styles ── */
export const GROUP_STYLES = {
  inReview: { label: "In review", pillBg: "bg-[#9DCBFF]", pillText: "text-black" },
  inReviewFilled: { label: "In review", pillBg: "bg-[#9DCBFF]", pillText: "text-black" },
  inProgress: { label: "In progress", pillBg: "bg-[#FBC364]", pillText: "text-black" },
  backlog: { label: "Backlog", pillBg: "bg-[#D0C985]", pillText: "text-black" },
  done: { label: "Done", pillBg: "bg-[#ABD3A1]", pillText: "text-black" },
  todo: { label: "Todo", pillBg: "bg-surface-pill", pillText: "text-text-secondary" },
  cancelled: { label: "Cancelled", pillBg: "bg-surface-pill", pillText: "text-text-tertiary" },
};

/* ── Priority badge ── */
export function PriorityBadge({ priority }) {
  const styles = {
    urgent: "bg-[#fce4ec] text-[#c62828] dark:bg-[#4a1c1c] dark:text-[#ef9a9a]",
    high: "bg-[#fff3e0] text-[#e65100] dark:bg-[#3e2a10] dark:text-[#ffcc80]",
    medium: "bg-[#fff8e1] text-[#f57f17] dark:bg-[#3e3510] dark:text-[#fff176]",
    low: "bg-surface-pill text-text-secondary",
  };
  return (
    <span className={`inline-flex items-center rounded-[4px] px-[6px] py-[2px] text-[11px] font-medium capitalize ${styles[priority] || styles.medium}`}>
      {priority}
    </span>
  );
}

/* ── Label dot ── */
export function LabelDot({ label }) {
  const LABEL_COLORS = {
    Bug: "#e53935", Feature: "#fb8c00", Improvement: "#5e6ad2",
    Integrations: "#4caf50", Security: "#ab47bc", Infrastructure: "#78909c", Mobile: "#00acc1",
  };
  return (
    <span className="inline-flex items-center gap-[4px] text-[11px] text-text-secondary">
      <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: LABEL_COLORS[label] || "#999" }}></span>
      {label}
    </span>
  );
}
