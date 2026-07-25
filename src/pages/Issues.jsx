import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Search,
  SlidersHorizontal,
  Star,
  SignalLow,
  Layers,
  Ban,
  CircleDot,
  CircleMinusIcon,
  Diamond,
  CircleAlert,
  Clock,
  MessageSquare,
  Link2,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";
import { IssueStatusIcon, Avatar, GROUP_STYLES, LabelDot, PriorityBadge } from "../components/shared";
import { ISSUES as SEED_ISSUES, USERS, LABELS, getUserById, getIssuesByStatus, formatDuration } from "../data/store";

/* ── Reusable outside-click hook ── */
function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (ref.current && !ref.current.contains(e.target)) handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

/* ── Inline dropdown (status / priority / assignee / label pickers) ── */
function InlineDropdown({ options, selected, onSelect, onClose, multi = false, renderOption }) {
  const ref = useRef(null);
  const [search, setSearch] = useState("");
  useClickOutside(ref, onClose);
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <div ref={ref} className="absolute z-50 mt-[2px] w-[220px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_24px_rgba(0,0,0,0.18)] py-[4px]" onClick={(e) => e.stopPropagation()}>
      {options.length > 5 && (
        <div className="flex items-center gap-[6px] px-3 py-[6px] border-b border-divider mx-[4px] mb-[2px]">
          <Search size={13} className="text-text-tertiary shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." autoFocus className="bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none w-full" />
        </div>
      )}
      {filtered.map((opt) => {
        const isActive = multi ? selected.includes(opt.value) : selected === opt.value;
        return (
          <div key={opt.value} onClick={() => onSelect(opt.value)} className={`flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover ${isActive ? "bg-hover" : ""}`}>
            {multi && (
              <div className={`w-[15px] h-[15px] rounded-[3px] border flex items-center justify-center shrink-0 ${isActive ? "bg-accent border-accent" : "border-divider"}`}>
                {isActive && <Check size={9} strokeWidth={2.5} className="text-white" />}
              </div>
            )}
            {renderOption ? renderOption(opt, isActive) : (
              <>
                {!multi && isActive && <Check size={13} strokeWidth={2} className="text-accent shrink-0" />}
                <span className="text-text-primary truncate">{opt.label}</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Tiny context menu ── */
function ContextMenu({ x, y, onClose, items }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  return (
    <div ref={ref} style={{ top: y, left: x }} className="fixed z-[60] w-[180px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_24px_rgba(0,0,0,0.18)] py-[4px]">
      {items.map((item, i) =>
        item.divider ? <div key={i} className="border-t border-divider my-[3px]" /> : (
          <div key={i} onClick={() => { item.action(); onClose(); }} className={`flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover ${item.danger ? "text-[#e53935]" : "text-text-primary"}`}>
            {item.icon && <item.icon size={14} strokeWidth={1.75} className="shrink-0" />}
            <span>{item.label}</span>
          </div>
        )
      )}
    </div>
  );
}

const STATUS_OPTIONS = [
  { value: "inReviewFilled", label: "In Review" },
  { value: "inProgress", label: "In Progress" },
  { value: "todo", label: "Todo" },
  { value: "backlog", label: "Backlog" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const ASSIGNEE_OPTIONS = [
  { value: "", label: "No assignee" },
  ...USERS.map((u) => ({ value: u.id, label: u.name, initials: u.initials, bg: u.bg })),
];

const LABEL_OPTIONS = LABELS.map((l) => ({ value: l.name, label: l.name, color: l.color }));

/* ── Issue Row ── */
function IssueRow({ issue, onSelect, onUpdate, onDelete, isSelected, onScrollTo }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [subExpanded, setSubExpanded] = useState(false);
  const assignee = issue.assignee ? getUserById(issue.assignee) : null;
  const rowRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        ref={rowRef}
        id={`issue-${issue.id}`}
        onClick={() => onSelect(issue)}
        onContextMenu={handleContextMenu}
        className={`flex items-start gap-3 px-6 pt-[8px] hover:bg-hover cursor-pointer min-h-[36px] ml-[8px] transition-colors ${isSelected ? "bg-hover" : ""}`}
      >
        {/* Status icon — click to change */}
        <div className="mt-[3px] shrink-0 relative" onClick={(e) => { e.stopPropagation(); setStatusOpen(!statusOpen); }}>
          <div className="hover:scale-110 transition-transform" title="Change status">
            <IssueStatusIcon variant={issue.variant} size={16} />
          </div>
          {statusOpen && (
            <InlineDropdown
              options={STATUS_OPTIONS}
              selected={issue.variant}
              onSelect={(v) => { onUpdate(issue.id, { variant: v }); setStatusOpen(false); }}
              onClose={() => setStatusOpen(false)}
              renderOption={(opt, active) => (
                <>
                  <IssueStatusIcon variant={opt.value} size={14} />
                  <span className="text-text-primary">{opt.label}</span>
                  {active && <Check size={13} strokeWidth={2} className="text-accent ml-auto shrink-0" />}
                </>
              )}
            />
          )}
        </div>

        <div className="flex-1 min-w-0 pb-[8px] border-b border-divider">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-tertiary shrink-0 font-mono">{issue.id}</span>
            <span className="text-[13px] text-text-primary leading-[1.4] truncate">{issue.title}</span>
            <div className="shrink-0 ml-auto flex items-center gap-[8px]">
              {/* Labels — click to edit */}
              <div className="relative">
                <div onClick={(e) => { e.stopPropagation(); setLabelOpen(!labelOpen); }} className="flex items-center gap-[6px] hover:opacity-70 transition-opacity" title="Edit labels">
                  {issue.labels?.map((l) => <LabelDot key={l} label={l} />)}
                  {(!issue.labels || issue.labels.length === 0) && <span className="text-[11px] text-text-tertiary hover:text-text-secondary">+ label</span>}
                </div>
                {labelOpen && (
                  <div className="absolute right-0 top-full">
                    <InlineDropdown
                      options={LABEL_OPTIONS}
                      selected={issue.labels || []}
                      multi
                      onSelect={(v) => {
                        const cur = issue.labels || [];
                        const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
                        onUpdate(issue.id, { labels: next });
                      }}
                      onClose={() => setLabelOpen(false)}
                      renderOption={(opt, active) => (
                        <>
                          <span className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                          <span className="text-text-primary">{opt.label}</span>
                        </>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Priority — click to change */}
              <div className="relative" onClick={(e) => { e.stopPropagation(); setPriorityOpen(!priorityOpen); }} title="Change priority">
                <PriorityBadge priority={issue.priority} />
                {priorityOpen && (
                  <div className="absolute right-0 top-full">
                    <InlineDropdown
                      options={PRIORITY_OPTIONS}
                      selected={issue.priority}
                      onSelect={(v) => { onUpdate(issue.id, { priority: v }); setPriorityOpen(false); }}
                      onClose={() => setPriorityOpen(false)}
                      renderOption={(opt, active) => (
                        <>
                          <PriorityBadge priority={opt.value} />
                          <span className="text-text-primary">{opt.label}</span>
                          {active && <Check size={13} strokeWidth={2} className="text-accent ml-auto shrink-0" />}
                        </>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Assignee — click to change */}
              <div className="relative" onClick={(e) => { e.stopPropagation(); setAssigneeOpen(!assigneeOpen); }} title="Change assignee">
                {assignee ? (
                  <div className="hover:ring-2 hover:ring-accent/40 rounded-[8px] transition-all">
                    <Avatar initials={assignee.initials} bg={assignee.bg} size={20} />
                  </div>
                ) : (
                  <div className="w-[20px] h-[20px] rounded-[8px] border border-dashed border-divider flex items-center justify-center hover:border-text-secondary transition-colors">
                    <Plus size={10} strokeWidth={2} className="text-text-tertiary" />
                  </div>
                )}
                {assigneeOpen && (
                  <div className="absolute right-0 top-full">
                    <InlineDropdown
                      options={ASSIGNEE_OPTIONS}
                      selected={issue.assignee || ""}
                      onSelect={(v) => { onUpdate(issue.id, { assignee: v || null }); setAssigneeOpen(false); }}
                      onClose={() => setAssigneeOpen(false)}
                      renderOption={(opt, active) => (
                        <>
                          {opt.value ? <Avatar initials={opt.initials} bg={opt.bg} size={20} /> : (
                            <div className="w-[20px] h-[20px] rounded-[8px] bg-surface-muted flex items-center justify-center">
                              <X size={10} className="text-text-tertiary" />
                            </div>
                          )}
                          <span className="text-text-primary truncate">{opt.label}</span>
                          {active && <Check size={13} strokeWidth={2} className="text-accent ml-auto shrink-0" />}
                        </>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-issues / blocked by chips */}
          {(issue.subIssues || issue.blockedBy) && (
            <div className="flex items-center gap-2 mt-[3px]">
              {issue.subIssues && (
                <span
                  onClick={(e) => { e.stopPropagation(); setSubExpanded(!subExpanded); }}
                  className="inline-flex items-center gap-1 text-[12px] text-text-primary bg-surface-chip rounded-[4px] px-[6px] py-[2px] hover:bg-hover transition-colors cursor-pointer"
                  title={subExpanded ? "Collapse sub-issues" : "Expand sub-issues"}
                >
                  <Layers size={12} strokeWidth={1.75} className="text-text-primary" />
                  <span>Sub-Issue</span>
                  <span className="font-medium">{issue.subIssues}</span>
                  {subExpanded ? <ChevronUp size={11} className="text-text-primary" /> : <ChevronDown size={11} className="text-text-primary" />}
                </span>
              )}
              {issue.blockedBy && (
                <span
                  onClick={(e) => { e.stopPropagation(); onScrollTo(issue.blockedBy); }}
                  className="inline-flex items-center gap-1 text-[12px] text-[#e53935] bg-[#e53935]/10 rounded-[4px] px-[6px] py-[2px] hover:bg-[#e53935]/20 transition-colors cursor-pointer"
                  title={`Scroll to ${issue.blockedBy}`}
                >
                  <Ban size={12} strokeWidth={2} />
                  <span>Blocked by {issue.blockedBy}</span>
                </span>
              )}
            </div>
          )}

          {/* Expanded sub-issues (placeholder since sub-issues aren't linked) */}
          {subExpanded && issue.subIssues && (
            <div className="mt-[6px] ml-[4px] border-l-2 border-divider pl-[10px] py-[2px] space-y-[4px]">
              {Array.from({ length: issue.subIssues }, (_, i) => (
                <div key={i} className="flex items-center gap-[6px] text-[12px] text-text-secondary py-[2px]">
                  <IssueStatusIcon variant={i === 0 ? "done" : "inProgress"} size={13} />
                  <span className="text-text-tertiary font-mono">{issue.id}-{i + 1}</span>
                  <span>{i === 0 ? "Initial implementation" : "Follow-up task"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right-click context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            { icon: ExternalLink, label: "Open issue", action: () => onSelect(issue) },
            { icon: Copy, label: `Copy ${issue.id}`, action: () => navigator.clipboard.writeText(issue.id) },
            { icon: Link2, label: "Copy link", action: () => navigator.clipboard.writeText(`sage.app/issue/${issue.id}`) },
            { divider: true },
            { icon: Trash2, label: "Delete issue", danger: true, action: () => onDelete(issue.id) },
          ]}
        />
      )}
    </>
  );
}

/* ── Inline new issue input ── */
function InlineCreateIssue({ status, onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (!title.trim()) { onCancel(); return; }
    onSubmit(title.trim(), status);
    setTitle("");
  };

  return (
    <div className="flex items-center gap-3 px-6 py-[6px] ml-[8px] bg-hover/50">
      <div className="mt-[1px] shrink-0">
        <IssueStatusIcon variant={status} size={16} />
      </div>
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onCancel(); }}
        onBlur={handleSubmit}
        placeholder="Issue title..."
        className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none"
      />
      <div className="flex items-center gap-[4px] text-[11px] text-text-tertiary">
        <kbd className="bg-surface-pill rounded px-[4px] py-[1px] text-[10px]">↵</kbd>
        save
        <kbd className="bg-surface-pill rounded px-[4px] py-[1px] text-[10px] ml-2">esc</kbd>
        cancel
      </div>
    </div>
  );
}

/* ── Status group ── */
function StatusGroup({ type, issues, first, onSelectIssue, onUpdateIssue, onDeleteIssue, selectedId, onCreateIssue, onScrollTo }) {
  const [creating, setCreating] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const g = GROUP_STYLES[type];
  if (!g) return null;
  const count = issues.length;

  return (
    <div className={first ? "mt-1" : "mt-[16px]"}>
      <div className="flex items-center gap-[4px] px-6 py-[6px]">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className={`inline-flex items-center gap-[6px] ${g.pillBg} ${g.pillText} rounded-full pl-[10px] pr-3 py-[8px] cursor-pointer hover:opacity-80 transition-opacity`}
          title={collapsed ? "Expand group" : "Collapse group"}
        >
          <IssueStatusIcon variant={type} size={15} color="currentColor" />
          <span className="text-[15px] font-normal leading-none" style={{ letterSpacing: '0.03em' }}>{g.label}</span>
        </div>
        <span className="text-[13px] text-text-secondary tabular-nums bg-surface-muted rounded-full px-[8px] py-[8px] leading-none">{count}</span>
        <button
          onClick={() => setCreating(true)}
          className="text-text-primary hover:text-accent hover:scale-110 transition-all"
          aria-label={`Add ${g.label} issue`}
          title={`Create new ${g.label} issue`}
        >
          <Plus size={16} strokeWidth={1.75} />
        </button>
      </div>
      {!collapsed && (
        <>
          {issues.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              onSelect={onSelectIssue}
              onUpdate={onUpdateIssue}
              onDelete={onDeleteIssue}
              isSelected={selectedId === issue.id}
              onScrollTo={onScrollTo}
            />
          ))}
          {creating && (
            <InlineCreateIssue
              status={type}
              onSubmit={(title) => { onCreateIssue(title, type); setCreating(false); }}
              onCancel={() => setCreating(false)}
            />
          )}
        </>
      )}
      {collapsed && count > 0 && (
        <div className="px-6 ml-[8px] py-[4px] text-[12px] text-text-tertiary cursor-pointer hover:text-text-secondary" onClick={() => setCollapsed(false)}>
          {count} issue{count !== 1 ? "s" : ""} hidden
        </div>
      )}
    </div>
  );
}

/* ── Issue Detail Panel ── */
function IssueDetailPanel({ issue, onClose, onUpdate }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [title, setTitle] = useState(issue.title);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const assignee = issue.assignee ? getUserById(issue.assignee) : null;

  useEffect(() => { setTitle(issue.title); setEditing(false); }, [issue.id]);

  const handleTitleSave = () => {
    if (title.trim() && title !== issue.title) onUpdate(issue.id, { title: title.trim() });
    setEditing(false);
  };

  const addComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [...prev, { id: Date.now(), text: comment.trim(), user: "u1", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setComment("");
  };

  return (
    <div className="absolute inset-y-0 right-0 w-[420px] bg-surface-card border-l border-divider shadow-[-4px_0_24px_rgba(0,0,0,0.12)] z-40 flex flex-col animate-[slideIn_0.2s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-divider shrink-0">
        <div className="flex items-center gap-[8px]">
          <span className="text-[13px] font-mono text-text-tertiary">{issue.id}</span>
          <span className="w-px h-[14px] bg-divider" />
          <div className="relative">
            <div onClick={() => setStatusOpen(!statusOpen)} className="cursor-pointer hover:scale-110 transition-transform">
              <IssueStatusIcon variant={issue.variant} size={16} />
            </div>
            {statusOpen && (
              <InlineDropdown
                options={STATUS_OPTIONS}
                selected={issue.variant}
                onSelect={(v) => { onUpdate(issue.id, { variant: v }); setStatusOpen(false); }}
                onClose={() => setStatusOpen(false)}
                renderOption={(opt, active) => (<><IssueStatusIcon variant={opt.value} size={14} /><span className="text-text-primary">{opt.label}</span>{active && <Check size={13} className="text-accent ml-auto" />}</>)}
              />
            )}
          </div>
          <span className="text-[12px] text-text-secondary">{STATUS_OPTIONS.find((o) => o.value === issue.variant)?.label}</span>
        </div>
        <button onClick={onClose} className="p-[5px] rounded-md hover:bg-hover text-text-tertiary hover:text-text-primary transition-colors">
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
        {/* Title */}
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => { if (e.key === "Enter") handleTitleSave(); if (e.key === "Escape") { setTitle(issue.title); setEditing(false); } }}
            autoFocus
            className="text-[16px] font-medium text-text-primary bg-transparent outline-none w-full border-b border-accent pb-[4px] mb-[16px]"
          />
        ) : (
          <h2
            onClick={() => setEditing(true)}
            className="text-[16px] font-medium text-text-primary mb-[16px] cursor-text hover:bg-hover/50 rounded px-[2px] py-[2px] -mx-[2px] transition-colors"
            title="Click to edit title"
          >
            {issue.title}
          </h2>
        )}

        {/* Properties grid */}
        <div className="space-y-[12px] mb-[20px]">
          {/* Priority */}
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] text-text-tertiary w-[72px] shrink-0">Priority</span>
            <div className="relative">
              <div onClick={() => setPriorityOpen(!priorityOpen)} className="cursor-pointer hover:opacity-70 transition-opacity">
                <PriorityBadge priority={issue.priority} />
              </div>
              {priorityOpen && (
                <InlineDropdown
                  options={PRIORITY_OPTIONS}
                  selected={issue.priority}
                  onSelect={(v) => { onUpdate(issue.id, { priority: v }); setPriorityOpen(false); }}
                  onClose={() => setPriorityOpen(false)}
                  renderOption={(opt, active) => (<><PriorityBadge priority={opt.value} /><span className="text-text-primary">{opt.label}</span>{active && <Check size={13} className="text-accent ml-auto" />}</>)}
                />
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] text-text-tertiary w-[72px] shrink-0">Assignee</span>
            <div className="relative">
              <div onClick={() => setAssigneeOpen(!assigneeOpen)} className="flex items-center gap-[6px] cursor-pointer hover:opacity-70 transition-opacity">
                {assignee ? (
                  <>
                    <Avatar initials={assignee.initials} bg={assignee.bg} size={20} />
                    <span className="text-[13px] text-text-primary">{assignee.name}</span>
                  </>
                ) : (
                  <span className="text-[13px] text-text-tertiary hover:text-text-secondary">Unassigned</span>
                )}
              </div>
              {assigneeOpen && (
                <InlineDropdown
                  options={ASSIGNEE_OPTIONS}
                  selected={issue.assignee || ""}
                  onSelect={(v) => { onUpdate(issue.id, { assignee: v || null }); setAssigneeOpen(false); }}
                  onClose={() => setAssigneeOpen(false)}
                  renderOption={(opt, active) => (<>{opt.value ? <Avatar initials={opt.initials} bg={opt.bg} size={20} /> : <X size={14} className="text-text-tertiary" />}<span className="text-text-primary truncate">{opt.label}</span>{active && <Check size={13} className="text-accent ml-auto" />}</>)}
                />
              )}
            </div>
          </div>

          {/* Labels */}
          <div className="flex items-start gap-[12px]">
            <span className="text-[12px] text-text-tertiary w-[72px] shrink-0 mt-[2px]">Labels</span>
            <div className="relative">
              <div onClick={() => setLabelOpen(!labelOpen)} className="flex items-center gap-[6px] flex-wrap cursor-pointer hover:opacity-70 transition-opacity">
                {issue.labels?.length > 0
                  ? issue.labels.map((l) => <LabelDot key={l} label={l} />)
                  : <span className="text-[13px] text-text-tertiary hover:text-text-secondary">None</span>}
              </div>
              {labelOpen && (
                <InlineDropdown
                  options={LABEL_OPTIONS}
                  selected={issue.labels || []}
                  multi
                  onSelect={(v) => {
                    const cur = issue.labels || [];
                    onUpdate(issue.id, { labels: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
                  }}
                  onClose={() => setLabelOpen(false)}
                  renderOption={(opt) => (<><span className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: opt.color }} /><span className="text-text-primary">{opt.label}</span></>)}
                />
              )}
            </div>
          </div>

          {/* Team */}
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] text-text-tertiary w-[72px] shrink-0">Team</span>
            <span className="text-[13px] text-text-primary">{issue.team === "t1" ? "Engineering" : issue.team === "t2" ? "Platform" : "Design"}</span>
          </div>

          {/* Time logged */}
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] text-text-tertiary w-[72px] shrink-0">Time</span>
            <div className="flex items-center gap-[4px] text-[13px] text-text-primary">
              <Clock size={13} strokeWidth={1.75} className="text-text-secondary" />
              <span>{issue.timeLogged > 0 ? formatDuration(issue.timeLogged) : "No time logged"}</span>
            </div>
          </div>

          {/* Blocked by */}
          {issue.blockedBy && (
            <div className="flex items-center gap-[12px]">
              <span className="text-[12px] text-text-tertiary w-[72px] shrink-0">Blocked by</span>
              <span className="text-[13px] text-[#e53935] flex items-center gap-[4px]">
                <Ban size={13} strokeWidth={2} />
                {issue.blockedBy}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-divider my-[16px]" />

        {/* Activity / Comments */}
        <div className="mb-[8px]">
          <h3 className="text-[13px] font-medium text-text-primary mb-[12px] flex items-center gap-[6px]">
            <MessageSquare size={14} strokeWidth={1.75} />
            Activity
          </h3>

          {comments.length === 0 && (
            <p className="text-[12px] text-text-tertiary mb-[12px]">No comments yet</p>
          )}

          {comments.map((c) => {
            const u = getUserById(c.user);
            return (
              <div key={c.id} className="flex gap-[8px] mb-[10px]">
                {u && <Avatar initials={u.initials} bg={u.bg} size={22} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[6px] mb-[2px]">
                    <span className="text-[12px] font-medium text-text-primary">{u?.name || "You"}</span>
                    <span className="text-[11px] text-text-tertiary">{c.time}</span>
                  </div>
                  <p className="text-[13px] text-text-primary leading-[1.5]">{c.text}</p>
                </div>
              </div>
            );
          })}

          <div className="flex gap-[8px] mt-[8px]">
            <Avatar initials="HM" bg="bg-[#43a047]" size={22} />
            <div className="flex-1 min-w-0">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addComment(); } }}
                placeholder="Add a comment..."
                rows={2}
                className="w-full resize-none bg-surface rounded-lg border border-divider px-[10px] py-[8px] text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors"
              />
              <div className="flex justify-end mt-[4px]">
                <button
                  onClick={addComment}
                  disabled={!comment.trim()}
                  className={`text-[12px] px-[10px] py-[4px] rounded-md transition-colors ${comment.trim() ? "bg-accent text-white hover:opacity-90" : "bg-surface-muted text-text-tertiary cursor-not-allowed"}`}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Filter components (unchanged from prior) ── */
const FILTER_TYPES = [
  { key: "status", icon: CircleDot, label: "Status" },
  { key: "assignee", icon: CircleMinusIcon, label: "Assignee" },
  { key: "label", icon: Diamond, label: "Label" },
  { key: "priority", icon: SignalLow, label: "Priority" },
];

function FilterDropdown({ onSelect, onClose, search, setSearch }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  const filtered = FILTER_TYPES.filter((f) => f.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <div ref={ref} className="absolute top-full left-0 mt-[4px] w-[200px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_24px_rgba(0,0,0,0.12)] z-20 py-[4px]">
      <div className="flex items-center gap-[6px] px-3 py-[7px] border-b border-divider mx-[4px] mb-[2px]">
        <Search size={14} className="text-text-tertiary shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter..." autoFocus className="bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none w-full" />
      </div>
      {filtered.map(({ key, icon: Icon, label }) => (
        <div key={key} onClick={() => onSelect(key)} className="flex items-center gap-[8px] px-3 py-[6px] mx-[4px] rounded-md text-[13px] text-text-primary cursor-pointer hover:bg-hover">
          <Icon size={15} strokeWidth={1.75} className="text-text-secondary shrink-0" />
          <span>{label}</span>
        </div>
      ))}
      {filtered.length === 0 && <div className="px-3 py-[6px] text-[13px] text-text-tertiary">No filters match</div>}
    </div>
  );
}

function FilterValueDropdown({ type, selected, onToggle, onClose }) {
  const ref = useRef(null);
  const [search, setSearch] = useState("");
  useClickOutside(ref, onClose);
  let options = [];
  if (type === "status") options = STATUS_OPTIONS;
  else if (type === "priority") options = PRIORITY_OPTIONS;
  else if (type === "label") options = LABEL_OPTIONS;
  else if (type === "assignee") options = [{ value: "__none__", label: "No assignee" }, ...USERS.map((u) => ({ value: u.id, label: u.name, initials: u.initials, bg: u.bg }))];
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <div ref={ref} className="absolute top-full left-0 mt-[4px] w-[240px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_24px_rgba(0,0,0,0.12)] z-20 py-[4px]">
      <div className="flex items-center gap-[6px] px-3 py-[7px] border-b border-divider mx-[4px] mb-[2px]">
        <Search size={14} className="text-text-tertiary shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${type}...`} autoFocus className="bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none w-full" />
      </div>
      {filtered.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <div key={opt.value} onClick={() => onToggle(opt.value)} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover">
            <div className={`w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center shrink-0 ${isSelected ? "bg-accent border-accent" : "border-divider"}`}>
              {isSelected && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </div>
            {type === "assignee" && opt.value && opt.value !== "__none__" ? <Avatar initials={opt.initials} bg={opt.bg} size={22} /> : type === "assignee" ? (
              <div className="w-[22px] h-[22px] rounded-[8px] bg-surface-muted flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="currentColor" className="text-text-tertiary" strokeWidth="1.5" /><path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" className="text-text-tertiary" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
            ) : type === "label" ? <span className="w-[8px] h-[8px] rounded-full shrink-0" style={{ backgroundColor: opt.color }} /> : type === "status" ? <IssueStatusIcon variant={opt.value} size={15} /> : type === "priority" ? <SignalLow size={14} strokeWidth={1.75} className="text-text-secondary" /> : null}
            <span className="text-text-primary truncate">{opt.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const FILTER_ICONS = { status: CircleDot, assignee: CircleMinusIcon, label: Diamond, priority: SignalLow };
const FILTER_LABELS_MAP = { status: "Status", assignee: "Assignee", label: "Label", priority: "Priority" };

function ActiveFilterPill({ type, values, onRemove, onEdit }) {
  let summary = "";
  if (type === "status") { const l = values.map((v) => STATUS_OPTIONS.find((o) => o.value === v)?.label || v); summary = l.length <= 2 ? l.join(", ") : `${values.length} statuses`; }
  else if (type === "priority") { const l = values.map((v) => PRIORITY_OPTIONS.find((o) => o.value === v)?.label || v); summary = l.length <= 2 ? l.join(", ") : `${values.length} priorities`; }
  else if (type === "label") { summary = values.length <= 2 ? values.join(", ") : `${values.length} labels`; }
  else if (type === "assignee") { const l = values.map((v) => v === "__none__" ? "No assignee" : getUserById(v)?.name || v); summary = l.length <= 2 ? l.join(", ") : `${values.length} assignees`; }
  const Icon = FILTER_ICONS[type];
  return (
    <div onClick={onEdit} className="inline-flex items-center gap-[5px] bg-surface-muted rounded-[6px] px-[8px] py-[5px] text-[12px] cursor-pointer hover:bg-hover transition-colors">
      <Icon size={13} strokeWidth={2} className="text-text-secondary" />
      <span className="font-medium text-text-primary">{FILTER_LABELS_MAP[type]}</span>
      <span className="text-text-tertiary">is any of</span>
      <span className="font-medium text-text-primary">{summary}</span>
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="ml-[2px] p-[1px] text-text-tertiary hover:text-text-primary rounded"><X size={13} strokeWidth={2} /></button>
    </div>
  );
}

/* ── Main Issues Component ── */
export default function Issues() {
  const [issues, setIssues] = useState(() => [...SEED_ISSUES]);
  const [filters, setFilters] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [nextId, setNextId] = useState(230);
  const filterBtnRef = useRef(null);

  const engIssues = issues.filter((i) => i.team === "t1");
  const groups = ["inReviewFilled", "inProgress", "backlog", "done", "todo", "cancelled"];

  const filteredIssues = engIssues.filter((issue) => {
    for (const [type, values] of Object.entries(filters)) {
      if (values.length === 0) continue;
      if (type === "status" && !values.includes(issue.variant)) return false;
      if (type === "priority" && !values.includes(issue.priority)) return false;
      if (type === "label" && !issue.labels?.some((l) => values.includes(l))) return false;
      if (type === "assignee") {
        const hasNone = values.includes("__none__");
        const userIds = values.filter((v) => v !== "__none__");
        if (hasNone && !issue.assignee) continue;
        if (userIds.includes(issue.assignee)) continue;
        return false;
      }
    }
    return true;
  });

  const activeFilterKeys = Object.keys(filters).filter((k) => filters[k].length > 0);
  const hasFilters = activeFilterKeys.length > 0;

  const handleUpdateIssue = useCallback((id, updates) => {
    setIssues((prev) => prev.map((i) => i.id === id ? { ...i, ...updates } : i));
    if (selectedIssue?.id === id) setSelectedIssue((prev) => prev ? { ...prev, ...updates } : prev);
  }, [selectedIssue]);

  const handleDeleteIssue = useCallback((id) => {
    setIssues((prev) => prev.filter((i) => i.id !== id));
    if (selectedIssue?.id === id) setSelectedIssue(null);
  }, [selectedIssue]);

  const handleCreateIssue = useCallback((title, status) => {
    const newIssue = {
      id: `ENG-${nextId}`,
      title,
      variant: status,
      assignee: null,
      labels: [],
      priority: "medium",
      team: "t1",
      timeLogged: 0,
    };
    setIssues((prev) => [...prev, newIssue]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const handleSelectIssue = useCallback((issue) => {
    setSelectedIssue((prev) => prev?.id === issue.id ? null : issue);
  }, []);

  const handleScrollTo = useCallback((issueId) => {
    const el = document.getElementById(`issue-${issueId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-accent", "ring-inset");
      setTimeout(() => el.classList.remove("ring-2", "ring-accent", "ring-inset"), 2000);
    }
  }, []);

  const handleSelectFilterType = (type) => {
    setShowFilterDropdown(false);
    setFilterSearch("");
    if (!filters[type]) setFilters((prev) => ({ ...prev, [type]: [] }));
    setEditingFilter(type);
  };

  const handleToggleValue = (type, value) => {
    setFilters((prev) => {
      const current = prev[type] || [];
      return { ...prev, [type]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] };
    });
  };

  const handleRemoveFilter = (type) => {
    setFilters((prev) => { const next = { ...prev }; delete next[type]; return next; });
    if (editingFilter === type) setEditingFilter(null);
  };

  const handleAvatarClick = (userId) => {
    const current = filters.assignee || [];
    const next = current.includes(userId) ? current.filter((v) => v !== userId) : [...current, userId];
    setFilters((prev) => ({ ...prev, assignee: next }));
  };

  const activeAssignees = [...new Set(engIssues.filter((i) => i.assignee).map((i) => i.assignee))].map(getUserById).filter(Boolean);

  // Keep selectedIssue in sync with issues state
  const currentSelected = selectedIssue ? issues.find((i) => i.id === selectedIssue.id) : null;

  return (
    <div className="relative h-full flex">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Filter bar */}
        <div className="bg-surface shrink-0">
          <div className="flex items-center gap-[12px] px-6 pt-[24px] pb-[8px]">
            <div className="relative" ref={filterBtnRef}>
              <button onClick={() => { setShowFilterDropdown(!showFilterDropdown); setEditingFilter(null); setFilterSearch(""); }} className={`inline-flex items-center gap-[6px] text-[13px] text-text-primary transition-colors rounded-md px-[10px] py-[5px] ${showFilterDropdown ? "bg-surface-active" : "bg-surface-card hover:bg-hover"}`}>
                <SlidersHorizontal size={15} strokeWidth={1.75} className="text-text-primary" />
                <span className="font-medium">Filter</span>
              </button>
              {showFilterDropdown && <FilterDropdown onSelect={handleSelectFilterType} onClose={() => { setShowFilterDropdown(false); setFilterSearch(""); }} search={filterSearch} setSearch={setFilterSearch} />}
            </div>
            <div className="w-px h-[18px] bg-divider" />
            {/* Clickable avatar stack */}
            <div className="flex items-center">
              {activeAssignees.slice(0, 5).map((u, i) => {
                const isActive = (filters.assignee || []).includes(u.id);
                return (
                  <div
                    key={u.id}
                    className={`${i > 0 ? "-ml-[6px]" : ""} cursor-pointer transition-all hover:scale-110 hover:z-10 relative ${isActive ? "ring-2 ring-accent rounded-[10px] z-10" : ""}`}
                    onClick={() => handleAvatarClick(u.id)}
                    title={`${isActive ? "Remove" : "Filter by"} ${u.name}`}
                  >
                    <Avatar initials={u.initials} bg={u.bg} size={24} border />
                  </div>
                );
              })}
            </div>
            {hasFilters && (
              <button onClick={() => setFilters({})} className="text-[12px] text-text-tertiary hover:text-accent transition-colors ml-auto">
                Clear all
              </button>
            )}
          </div>

          {hasFilters && (
            <div className="flex items-center gap-[8px] px-6 pb-[10px] flex-wrap">
              <Star size={14} strokeWidth={2} className="text-[#ffb300] fill-[#ffb300] shrink-0" />
              {activeFilterKeys.map((type) => (
                <div key={type} className="relative">
                  <ActiveFilterPill type={type} values={filters[type]} onRemove={() => handleRemoveFilter(type)} onEdit={() => setEditingFilter(editingFilter === type ? null : type)} />
                  {editingFilter === type && <FilterValueDropdown type={type} selected={filters[type]} onToggle={(v) => handleToggleValue(type, v)} onClose={() => setEditingFilter(null)} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {editingFilter && !hasFilters && (
          <div className="absolute top-[60px] left-[24px] z-30">
            <FilterValueDropdown type={editingFilter} selected={filters[editingFilter] || []} onToggle={(v) => handleToggleValue(editingFilter, v)} onClose={() => setEditingFilter(null)} />
          </div>
        )}

        {/* Issue list */}
        <div className="flex-1 overflow-y-auto pb-8">
          {groups.map((g, i) => (
            <StatusGroup
              key={g}
              type={g}
              issues={getIssuesByStatus(filteredIssues, g)}
              first={i === 0}
              onSelectIssue={handleSelectIssue}
              onUpdateIssue={handleUpdateIssue}
              onDeleteIssue={handleDeleteIssue}
              selectedId={selectedIssue?.id}
              onCreateIssue={handleCreateIssue}
              onScrollTo={handleScrollTo}
            />
          ))}
          {filteredIssues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
              <Search size={32} strokeWidth={1.5} className="mb-3 opacity-40" />
              <p className="text-[14px]">No issues match the current filters</p>
              <button onClick={() => setFilters({})} className="mt-2 text-[13px] text-accent hover:underline">Clear all filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Issue detail panel */}
      {currentSelected && (
        <IssueDetailPanel
          issue={currentSelected}
          onClose={() => setSelectedIssue(null)}
          onUpdate={handleUpdateIssue}
        />
      )}
    </div>
  );
}
