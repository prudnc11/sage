import {
  Clock,
  Play,
  Square,
  Download,
  Calendar,
} from "lucide-react";
import { Avatar } from "../components/shared";
import { TIME_ENTRIES, ISSUES, USERS, getUserById, formatDuration } from "../data/store";

function TimeEntryRow({ entry }) {
  const user = getUserById(entry.user);
  const issue = ISSUES.find((i) => i.id === entry.issueId);
  return (
    <div className="flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-hover cursor-pointer rounded-[8px]">
      <Avatar initials={user?.initials || "?"} bg={user?.bg || "bg-[#bdbdbd]"} size={28} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px]">
          <span className="text-[13px] font-medium text-text-primary truncate">{issue?.title || entry.issueId}</span>
          <span className="shrink-0 text-[11px] text-text-tertiary font-mono">{entry.issueId}</span>
        </div>
        {entry.note && <p className="text-[12px] text-text-secondary mt-[1px] truncate">{entry.note}</p>}
      </div>
      <div className="shrink-0 flex items-center gap-[12px]">
        <span className={`inline-flex items-center gap-[4px] text-[11px] rounded-[4px] px-[6px] py-[2px] ${entry.source === "timer" ? "bg-[#e8f5e9] dark:bg-[#1b3a1e] text-[#2e7d32] dark:text-[#81c784]" : "bg-surface-pill text-text-secondary"}`}>
          {entry.source === "timer" ? <Clock size={10} /> : <Calendar size={10} />}
          {entry.source}
        </span>
        <span className="text-[13px] font-semibold text-text-primary tabular-nums w-[60px] text-right">{formatDuration(entry.duration)}</span>
        <span className="text-[12px] text-text-tertiary w-[80px] text-right">{entry.date}</span>
      </div>
    </div>
  );
}

export default function TimeTracking() {
  const totalToday = TIME_ENTRIES.filter((e) => e.date === "2026-07-12").reduce((s, e) => s + e.duration, 0);
  const totalWeek = TIME_ENTRIES.reduce((s, e) => s + e.duration, 0);

  const byUser = USERS.map((u) => {
    const entries = TIME_ENTRIES.filter((e) => e.user === u.id);
    const total = entries.reduce((s, e) => s + e.duration, 0);
    return { ...u, total, count: entries.length };
  }).filter((u) => u.total > 0);

  return (
    <div className="bg-surface min-h-full">
      <div className="px-6 pt-[24px] pb-[16px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-[20px]">
          <div>
            <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">Time Tracking</h1>
            <p className="text-[13px] text-text-secondary mt-[2px]">Track effort per issue with start/stop timer or manual entry</p>
          </div>
          <div className="flex items-center gap-[8px]">
            <button className="inline-flex items-center gap-[6px] bg-surface-card border border-divider text-text-primary rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium hover:bg-hover transition-colors">
              <Download size={15} />
              Export CSV
            </button>
            <button className="inline-flex items-center gap-[6px] bg-accent text-white rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium hover:opacity-90 transition-colors">
              <Play size={15} />
              Start Timer
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-[12px] mb-[24px]">
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">Today</span>
            <div className="text-[24px] font-semibold text-text-primary mt-[2px]">{formatDuration(totalToday)}</div>
          </div>
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">This Week</span>
            <div className="text-[24px] font-semibold text-text-primary mt-[2px]">{formatDuration(totalWeek)}</div>
          </div>
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">Entries</span>
            <div className="text-[24px] font-semibold text-text-primary mt-[2px]">{TIME_ENTRIES.length}</div>
          </div>
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">Active Timer</span>
            <div className="flex items-center gap-[6px] mt-[4px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#4caf50] animate-pulse"></div>
              <span className="text-[14px] font-semibold text-[#4caf50]">2h 14m</span>
            </div>
            <span className="text-[11px] text-text-tertiary">ENG-210 — Manik A.</span>
          </div>
        </div>

        {/* Team breakdown */}
        <div className="bg-surface-card border border-divider rounded-[12px] p-[16px] mb-[20px]">
          <h2 className="text-[13px] font-semibold text-text-primary mb-[12px]">Team Breakdown</h2>
          <div className="space-y-[10px]">
            {byUser.map((u) => (
              <div key={u.id} className="flex items-center gap-[10px]">
                <Avatar initials={u.initials} bg={u.bg} size={24} />
                <span className="text-[13px] text-text-primary w-[160px] truncate">{u.name}</span>
                <div className="flex-1 h-[6px] rounded-full bg-surface-muted">
                  <div className="h-[6px] rounded-full bg-accent" style={{ width: `${Math.min((u.total / totalWeek) * 100, 100)}%` }}></div>
                </div>
                <span className="text-[13px] font-medium text-text-primary tabular-nums w-[60px] text-right">{formatDuration(u.total)}</span>
                <span className="text-[12px] text-text-tertiary w-[60px] text-right">{u.count} entries</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent entries */}
        <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
          <div className="flex items-center justify-between mb-[12px]">
            <h2 className="text-[13px] font-semibold text-text-primary">Recent Entries</h2>
          </div>
          <div className="space-y-[2px]">
            {TIME_ENTRIES.map((entry) => (
              <TimeEntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
