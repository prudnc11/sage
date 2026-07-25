import { useState, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  Play,
  Square,
  Download,
  Calendar,
  Plus,
  X,
  Check,
  Trash2,
  Search,
  MoreHorizontal,
  Edit3,
  Pause,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "../components/shared";
import { TIME_ENTRIES as SEED_ENTRIES, ISSUES, USERS, getUserById, formatDuration } from "../data/store";

/* ── Timer ── */
function useTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerIssue, setTimerIssue] = useState("ENG-210");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = (issueId) => { setTimerIssue(issueId || timerIssue); setElapsed(0); setRunning(true); };
  const stop = () => { setRunning(false); const dur = elapsed; setElapsed(0); return { issueId: timerIssue, duration: dur }; };
  const toggle = () => { if (running) return stop(); start(timerIssue); return null; };

  return { running, elapsed, timerIssue, setTimerIssue, start, stop, toggle };
}

/* ── Editable entry row ── */
function TimeEntryRow({ entry, onUpdate, onDelete }) {
  const user = getUserById(entry.user);
  const issue = ISSUES.find((i) => i.id === entry.issueId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(entry.note || "");
  const [duration, setDuration] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    function close(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); }
    if (menuOpen) { document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }
  }, [menuOpen]);

  const handleSave = () => {
    const updates = { note: note.trim() };
    if (duration.trim()) {
      const match = duration.match(/^(\d+)h?\s*(\d+)?m?$/);
      if (match) updates.duration = (parseInt(match[1] || 0) * 3600) + (parseInt(match[2] || 0) * 60);
    }
    onUpdate(entry.id, updates);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-[12px] px-[16px] py-[10px] bg-hover rounded-[8px]">
        <Avatar initials={user?.initials || "?"} bg={user?.bg || "bg-[#bdbdbd]"} size={28} />
        <div className="flex-1 min-w-0 space-y-[6px]">
          <div className="flex items-center gap-[8px]">
            <span className="text-[11px] text-text-tertiary font-mono">{entry.issueId}</span>
            <span className="text-[13px] text-text-primary truncate">{issue?.title || entry.issueId}</span>
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note..." className="w-full bg-transparent text-[12px] text-text-primary placeholder:text-text-tertiary outline-none border-b border-accent" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }} />
          <div className="flex items-center gap-[8px]">
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder={formatDuration(entry.duration)} className="bg-transparent text-[12px] text-text-primary placeholder:text-text-tertiary outline-none border-b border-divider w-[60px]" />
            <button onClick={handleSave} className="text-[11px] bg-accent text-white rounded px-[8px] py-[3px]">Save</button>
            <button onClick={() => setEditing(false)} className="text-[11px] text-text-tertiary hover:text-text-primary">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[12px] px-[16px] py-[10px] hover:bg-hover cursor-pointer rounded-[8px] group">
      <Avatar initials={user?.initials || "?"} bg={user?.bg || "bg-[#bdbdbd]"} size={28} />
      <div className="flex-1 min-w-0" onClick={() => setEditing(true)}>
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
        <div className="relative" ref={menuRef}>
          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="p-[3px] rounded-md text-text-tertiary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all">
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-[2px] w-[140px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.18)] z-30 py-[4px]">
              <div onClick={() => { setEditing(true); setMenuOpen(false); }} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover text-text-primary"><Edit3 size={13} /> Edit</div>
              <div className="border-t border-divider my-[3px]" />
              <div onClick={() => { onDelete(entry.id); setMenuOpen(false); }} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover text-[#e53935]"><Trash2 size={13} /> Delete</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Manual entry form ── */
function ManualEntryForm({ onSubmit, onCancel }) {
  const [issueId, setIssueId] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [note, setNote] = useState("");
  const [issueSearch, setIssueSearch] = useState("");
  const [showIssues, setShowIssues] = useState(false);
  const ref = useRef(null);

  const engIssues = ISSUES.filter((i) => i.team === "t1");
  const filtered = issueSearch ? engIssues.filter((i) => i.id.toLowerCase().includes(issueSearch.toLowerCase()) || i.title.toLowerCase().includes(issueSearch.toLowerCase())) : engIssues.slice(0, 6);

  const handleSubmit = () => {
    if (!issueId) return;
    const dur = (parseInt(hours || 0) * 3600) + (parseInt(minutes || 0) * 60);
    if (dur <= 0) return;
    onSubmit({ issueId, duration: dur, note: note.trim() });
  };

  return (
    <div className="bg-surface-card border border-accent/50 rounded-[12px] p-[16px] space-y-[10px]">
      <div className="relative">
        <div className="flex items-center gap-[6px]">
          <Search size={13} className="text-text-tertiary shrink-0" />
          <input
            value={issueSearch || issueId}
            onChange={(e) => { setIssueSearch(e.target.value); setIssueId(""); setShowIssues(true); }}
            onFocus={() => setShowIssues(true)}
            placeholder="Search issue..."
            className="bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none w-full"
          />
        </div>
        {showIssues && (
          <div className="absolute left-0 right-0 top-full mt-[4px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.18)] z-20 py-[4px] max-h-[200px] overflow-y-auto">
            {filtered.map((i) => (
              <div key={i.id} onClick={() => { setIssueId(i.id); setIssueSearch(""); setShowIssues(false); }} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover">
                <span className="text-text-tertiary font-mono text-[11px]">{i.id}</span>
                <span className="text-text-primary truncate">{i.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-[8px]">
        <input value={hours} onChange={(e) => setHours(e.target.value.replace(/\D/g, ""))} placeholder="0" className="w-[40px] bg-surface rounded-[6px] border border-divider px-[8px] py-[5px] text-[13px] text-text-primary text-center outline-none focus:border-accent" />
        <span className="text-[12px] text-text-tertiary">h</span>
        <input value={minutes} onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))} placeholder="0" className="w-[40px] bg-surface rounded-[6px] border border-divider px-[8px] py-[5px] text-[13px] text-text-primary text-center outline-none focus:border-accent" />
        <span className="text-[12px] text-text-tertiary">m</span>
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)..." className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none border-b border-divider pb-[4px]" onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }} />
      <div className="flex items-center gap-[8px]">
        <button onClick={handleSubmit} disabled={!issueId} className={`text-[12px] px-[10px] py-[5px] rounded-md font-medium ${issueId ? "bg-accent text-white hover:opacity-90" : "bg-surface-muted text-text-tertiary cursor-not-allowed"}`}>Log Entry</button>
        <button onClick={onCancel} className="text-[12px] text-text-tertiary hover:text-text-primary">Cancel</button>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function TimeTracking() {
  const [entries, setEntries] = useState(() => [...SEED_ENTRIES]);
  const [showManual, setShowManual] = useState(false);
  const [nextId, setNextId] = useState(50);
  const timer = useTimer();
  const [issuePickerOpen, setIssuePickerOpen] = useState(false);

  const totalToday = entries.filter((e) => e.date === "2026-07-12").reduce((s, e) => s + e.duration, 0);
  const totalWeek = entries.reduce((s, e) => s + e.duration, 0);

  const byUser = USERS.map((u) => {
    const userEntries = entries.filter((e) => e.user === u.id);
    return { ...u, total: userEntries.reduce((s, e) => s + e.duration, 0), count: userEntries.length };
  }).filter((u) => u.total > 0).sort((a, b) => b.total - a.total);

  const handleUpdate = useCallback((id, updates) => {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const handleDelete = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleManualSubmit = useCallback((data) => {
    const newEntry = {
      id: `te${nextId}`,
      issueId: data.issueId,
      user: "u1",
      date: new Date().toISOString().slice(0, 10),
      duration: data.duration,
      source: "manual",
      note: data.note,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setNextId((n) => n + 1);
    setShowManual(false);
  }, [nextId]);

  const handleTimerStop = () => {
    const result = timer.stop();
    if (result && result.duration > 0) {
      const newEntry = {
        id: `te${nextId}`,
        issueId: result.issueId,
        user: "u1",
        date: new Date().toISOString().slice(0, 10),
        duration: result.duration,
        source: "timer",
        note: "Timer session",
      };
      setEntries((prev) => [newEntry, ...prev]);
      setNextId((n) => n + 1);
    }
  };

  const handleExport = () => {
    const csv = "Issue,User,Date,Duration,Source,Note\n" + entries.map((e) => {
      const u = getUserById(e.user);
      return `${e.issueId},${u?.name || e.user},${e.date},${formatDuration(e.duration)},${e.source},"${e.note || ""}"`;
    }).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "time-entries.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-surface min-h-full overflow-y-auto">
      <div className="px-6 pt-[24px] pb-[16px]">
        <div className="flex items-center justify-between mb-[20px]">
          <div>
            <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">Time Tracking</h1>
            <p className="text-[13px] text-text-secondary mt-[2px]">Track effort per issue with start/stop timer or manual entry</p>
          </div>
          <div className="flex items-center gap-[8px]">
            <button onClick={handleExport} className="inline-flex items-center gap-[6px] bg-surface-card border border-divider text-text-primary rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium hover:bg-hover transition-colors">
              <Download size={15} /> Export CSV
            </button>
            <button onClick={() => setShowManual(true)} className="inline-flex items-center gap-[6px] bg-surface-card border border-divider text-text-primary rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium hover:bg-hover transition-colors">
              <Plus size={15} /> Manual Entry
            </button>
            <button
              onClick={() => { if (timer.running) handleTimerStop(); else timer.start(timer.timerIssue); }}
              className={`inline-flex items-center gap-[6px] rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium transition-colors ${timer.running ? "bg-[#e53935] text-white hover:bg-[#c62828]" : "bg-accent text-white hover:opacity-90"}`}
            >
              {timer.running ? <Square size={15} /> : <Play size={15} />}
              {timer.running ? "Stop Timer" : "Start Timer"}
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
            <div className="text-[24px] font-semibold text-text-primary mt-[2px]">{entries.length}</div>
          </div>
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">Active Timer</span>
            {timer.running ? (
              <>
                <div className="flex items-center gap-[6px] mt-[4px]">
                  <div className="w-[8px] h-[8px] rounded-full bg-[#4caf50] animate-pulse" />
                  <span className="text-[14px] font-semibold text-[#4caf50] tabular-nums">{formatDuration(timer.elapsed)}</span>
                </div>
                <div className="flex items-center gap-[4px] mt-[2px]">
                  <span className="text-[11px] text-text-tertiary">{timer.timerIssue}</span>
                  <div className="relative">
                    <button onClick={() => setIssuePickerOpen(!issuePickerOpen)} className="text-[10px] text-accent hover:underline">change</button>
                    {issuePickerOpen && (
                      <div className="absolute right-0 top-full mt-[2px] w-[200px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.18)] z-30 py-[4px] max-h-[150px] overflow-y-auto">
                        {ISSUES.filter((i) => i.team === "t1").slice(0, 6).map((i) => (
                          <div key={i.id} onClick={() => { timer.setTimerIssue(i.id); setIssuePickerOpen(false); }} className="flex items-center gap-[6px] px-3 py-[4px] mx-[4px] rounded-md text-[12px] cursor-pointer hover:bg-hover text-text-primary">
                            <span className="text-text-tertiary font-mono text-[10px]">{i.id}</span>
                            <span className="truncate">{i.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-[6px] mt-[4px]">
                <div className="w-[8px] h-[8px] rounded-full bg-text-tertiary" />
                <span className="text-[14px] text-text-tertiary">Not running</span>
              </div>
            )}
          </div>
        </div>

        {/* Manual entry form */}
        {showManual && (
          <div className="mb-[20px]">
            <ManualEntryForm onSubmit={handleManualSubmit} onCancel={() => setShowManual(false)} />
          </div>
        )}

        {/* Team breakdown */}
        <div className="bg-surface-card border border-divider rounded-[12px] p-[16px] mb-[20px]">
          <h2 className="text-[13px] font-semibold text-text-primary mb-[12px]">Team Breakdown</h2>
          <div className="space-y-[10px]">
            {byUser.map((u) => (
              <div key={u.id} className="flex items-center gap-[10px]">
                <Avatar initials={u.initials} bg={u.bg} size={24} />
                <span className="text-[13px] text-text-primary w-[160px] truncate">{u.name}</span>
                <div className="flex-1 h-[6px] rounded-full bg-surface-muted">
                  <div className="h-[6px] rounded-full bg-accent transition-all" style={{ width: `${Math.min((u.total / totalWeek) * 100, 100)}%` }} />
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
            <span className="text-[12px] text-text-tertiary">{entries.length} total</span>
          </div>
          <div className="space-y-[2px]">
            {entries.map((entry) => (
              <TimeEntryRow key={entry.id} entry={entry} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
            {entries.length === 0 && (
              <div className="py-[24px] text-center text-[13px] text-text-tertiary">No time entries yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
