import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  MoreHorizontal,
  SlidersHorizontal,
  Calendar,
  Paperclip,
  MessageSquare,
  CircleDot,
  GitBranch,
  AlertTriangle,
  BarChart3,
  X,
  Check,
  Search,
} from "lucide-react";
import { Avatar } from "../components/shared";
import { USERS, getUserById } from "../data/store";

/* ── Seed data for the board ── */
const SEED_PROJECTS = [
  {
    id: "p1", title: "Recipea mobile application",
    description: "A platform for easy smart kitchen control and recipe following.",
    date: "Nov 6, 2025", teams: ["Engineering", "Marketing", "Design"], sprint: "Sprint 2",
    attachments: 4, subIssues: 12, comments: 12, progress: 50, status: "todo",
    priority: "high", members: ["u1", "u2", "u3"],
  },
  {
    id: "p2", title: "Design Token Implementation",
    description: "Design Token Implementation Systematic approach to scaling design decisions across products.",
    date: "Nov 4, 2025", teams: ["Engineering", "Design"], sprint: "Sprint 1",
    attachments: 3, comments: 12, progress: 25, status: "todo",
    priority: "high", members: ["u2", "u4"],
  },
  {
    id: "p3", title: "Brand Style Guide Update",
    description: "Comprehensive refresh of visual identity and design principles documentation.",
    date: "Aug 16, 2025", teams: ["Design"], sprint: "Sprint 2",
    attachments: 1, comments: 17, progress: 0, status: "todo",
    priority: "medium", members: ["u4", "u1"],
  },
  {
    id: "p4", title: "API Documentation Portal",
    description: "Interactive developer hub for API integration and code implementation guides.",
    date: "Mar 26", dateSuffix: "(due in 2 days)", teams: ["Engineering", "Design"], sprint: "Sprint 1",
    comments: 0, progress: 0, status: "inProgress",
    priority: "high", members: [],
  },
  {
    id: "p5", title: "Seasonal Marketing Campaign",
    description: "Q2 product promotion strategy across digital and traditional channels.",
    date: "Nov 6, 2025", teams: ["Marketing"], sprint: "Sprint 2",
    attachments: 1, comments: 12, progress: 50, status: "inProgress",
    priority: "medium", members: ["u5"],
  },
  {
    id: "p6", title: "CI/CD Pipeline Enhancement",
    description: "Automated testing and deployment workflow optimization.",
    date: "Nov 8, 2025", teams: ["Engineering", "Marketing"], sprint: "Sprint 2",
    comments: 12, progress: 50, status: "inProgress",
    priority: "high", members: [],
  },
  {
    id: "p7", title: "Content Strategy Framework",
    description: "Guidelines for consistent brand voice and content creation.",
    date: "Nov 6, 2025", teams: ["Marketing"], sprint: "Sprint 2",
    attachments: 1, comments: 99, progress: 75, status: "inProgress",
    priority: "medium", members: ["u1", "u2", "u5"],
  },
  {
    id: "p8", title: "Cross-Platform Integration",
    description: "Unified experience across web, mobile, and desktop applications.",
    date: "Nov 6, 2025", teams: ["Engineering"], sprint: "Sprint 2",
    attachments: 2, subIssues: 7, comments: 45, progress: 25, status: "inProgress",
    priority: "medium", members: ["u1", "u2", "u3"],
  },
  {
    id: "p9", title: "Aurora AI",
    description: "Develop, run, edit, deploy web applications; generate images, answer queries and more.",
    date: "Mar 6, 2025", teams: ["Engineering"], sprint: "Sprint 2",
    attachments: 4, subIssues: 11, comments: 99, progress: 100, status: "completed",
    priority: "high", members: ["u1", "u2", "u3"],
  },
  {
    id: "p10", title: "Website Redesign",
    description: "Modern interface overhaul focusing on user experience and conversion optimization.",
    date: "Jan 6, 2025", teams: ["Design"], sprint: "Sprint 2",
    attachments: 4, comments: 12, progress: 100, status: "completed",
    priority: "medium", members: ["u1", "u2", "u4"],
  },
  {
    id: "p11", title: "Mobile App Launch V2.0",
    description: "Native app development with seamless platform integration and offline capabilities.",
    date: "Dec 6, 2024", teams: ["Design", "Engineering"], sprint: "Sprint 2",
    attachments: 3, comments: 12, progress: 100, status: "completed",
    priority: "high", members: ["u1", "u2", "u4"],
  },
  {
    id: "p12", title: "Brand Animation Package",
    description: "Motion design assets for digital marketing and product interfaces.",
    date: "Nov 6, 2025", teams: ["Design"], sprint: "Sprint 2",
    attachments: 4, comments: 10, progress: 100, status: "completed",
    priority: "medium", members: ["u1", "u2", "u4"],
  },
  {
    id: "p13", title: "Developer SDK Release",
    description: "Comprehensive toolkit for third-party platform integration.",
    date: "Nov 6, 2025", teams: ["Engineering"], sprint: "Sprint 2",
    attachments: 2, subIssues: 9, comments: 88, progress: 25, status: "completed",
    priority: "high", members: ["u1", "u2", "u3"],
  },
  {
    id: "p14", title: "Cloud synchronization document",
    description: "No description",
    date: "Mar 6, 2025", teams: ["Engineering"], sprint: "Sprint 2",
    attachments: 4, subIssues: 9, comments: 88, progress: 25, status: "paused",
    priority: "high", members: ["u1", "u2", "u3"],
  },
  {
    id: "p15", title: "Query Forms web application",
    description: "Create beautiful forms and surveys.",
    date: "Nov 6, 2024", teams: ["Engineering"], sprint: "Sprint 3",
    attachments: 4, comments: 56, progress: 50, status: "paused",
    priority: "medium", members: ["u1", "u2", "u3"],
  },
];

const COLUMNS = [
  { key: "todo", label: "To-do", icon: "○" },
  { key: "inProgress", label: "In Progress", icon: "◐" },
  { key: "completed", label: "Completed", icon: "●" },
  { key: "paused", label: "Paused", icon: "◎" },
];

const TEAM_COLORS = {
  Engineering: "bg-[#1b3a1e] text-[#81c784]",
  Marketing: "bg-[#3e1a2a] text-[#f48fb1]",
  Design: "bg-[#1e2048] text-[#9fa8da]",
};

/* ── Team tag ── */
function TeamTag({ name }) {
  return (
    <span className={`inline-flex items-center gap-[4px] rounded-[4px] px-[7px] py-[2px] text-[11px] font-medium ${TEAM_COLORS[name] || "bg-surface-muted text-text-primary"}`}>
      <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5a2 2 0 0 0-2 2v1a2 2 0 0 0 4 0v-1a2 2 0 0 0-2-2zM4 11.5c0-2.2 1.8-4 4-4s4 1.8 4 4v1H4v-1z"/></svg>
      {name}
    </span>
  );
}

/* ── Sprint tag ── */
function SprintTag({ sprint }) {
  return (
    <span className="inline-flex items-center rounded-[4px] bg-surface-muted px-[7px] py-[2px] text-[11px] text-text-secondary font-medium">
      {sprint}
    </span>
  );
}

/* ── Signal bars icon ── */
function SignalBars({ priority }) {
  const h = priority === "high" ? [4, 7, 11] : priority === "medium" ? [4, 7] : [4];
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      {[4, 7, 11].map((height, i) => (
        <rect
          key={i}
          x={1 + i * 4}
          y={14 - height}
          width="3"
          rx="0.5"
          height={height}
          fill={i < h.length ? "#4caf50" : "var(--color-surface-muted)"}
        />
      ))}
    </svg>
  );
}

/* ── Avatar stack ── */
function AvatarStack({ memberIds, max = 3 }) {
  const members = memberIds.map(getUserById).filter(Boolean);
  const shown = members.slice(0, max);
  const extra = members.length - max;
  return (
    <div className="flex items-center">
      {shown.map((u, i) => (
        <div key={u.id} className={i > 0 ? "-ml-[6px]" : ""} title={u.name}>
          <Avatar initials={u.initials} bg={u.bg} size={22} border />
        </div>
      ))}
      {extra > 0 && (
        <div className="-ml-[6px] w-[22px] h-[22px] rounded-[8px] bg-surface-muted flex items-center justify-center ring-2 ring-ring text-[10px] font-medium text-text-secondary">
          +{extra}
        </div>
      )}
    </div>
  );
}

/* ── Project card ── */
function ProjectCard({ project, onUpdate, onDelete, onSelect, isDragging, onDragStart, onDragEnd }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function close(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(project)}
      className={`bg-surface-card border border-divider rounded-[12px] p-[14px] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:border-text-tertiary/30 transition-all cursor-grab active:cursor-grabbing group ${isDragging ? "opacity-50 scale-[0.97]" : ""}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-[6px]">
        <div className="flex items-start gap-[8px] min-w-0 flex-1">
          <h3 className="text-[14px] font-medium text-text-primary leading-[1.35]">{project.title}</h3>
        </div>
        <div className="flex items-center gap-[4px] shrink-0 ml-[8px]">
          {project.priority === "high" && (
            <AlertTriangle size={14} strokeWidth={2} className="text-[#f59e0b]" />
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-[3px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover opacity-0 group-hover:opacity-100 transition-all"
            >
              {project.priority !== "low" && !menuOpen ? (
                <SignalBars priority={project.priority} />
              ) : (
                <MoreHorizontal size={14} strokeWidth={1.75} />
              )}
            </button>
            {/* Always show signal bars when not hovering */}
            {!menuOpen && project.priority !== "low" && (
              <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity pointer-events-none">
                <SignalBars priority={project.priority} />
              </div>
            )}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-[2px] w-[160px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.18)] z-30 py-[4px]">
                {COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    onClick={(e) => { e.stopPropagation(); onUpdate(project.id, { status: col.key }); setMenuOpen(false); }}
                    className={`flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover ${project.status === col.key ? "text-accent" : "text-text-primary"}`}
                  >
                    <span className="text-[12px]">{col.icon}</span>
                    <span>{col.label}</span>
                    {project.status === col.key && <Check size={13} className="ml-auto text-accent" />}
                  </div>
                ))}
                <div className="border-t border-divider my-[3px]" />
                <div
                  onClick={(e) => { e.stopPropagation(); onDelete(project.id); setMenuOpen(false); }}
                  className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover text-[#e53935]"
                >
                  <X size={13} />
                  <span>Remove</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && project.description !== "No description" && (
        <p className="text-[12px] text-text-secondary leading-[1.45] mb-[10px] line-clamp-2">{project.description}</p>
      )}
      {project.description === "No description" && (
        <p className="text-[12px] text-text-tertiary italic mb-[10px]">No description</p>
      )}

      {/* Meta row: date + teams + sprint */}
      <div className="flex items-center gap-[6px] flex-wrap mb-[10px]">
        <span className="inline-flex items-center gap-[4px] text-[11px] text-text-secondary">
          <Calendar size={11} strokeWidth={1.75} />
          {project.date}
          {project.dateSuffix && <span className="text-[#f59e0b] font-medium">{project.dateSuffix}</span>}
        </span>
        {project.teams.map((t) => <TeamTag key={t} name={t} />)}
        <SprintTag sprint={project.sprint} />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[10px] text-[12px] text-text-secondary">
          {project.attachments > 0 && (
            <span className="inline-flex items-center gap-[3px]" title="Attachments">
              <Paperclip size={12} strokeWidth={1.75} />
              {project.attachments}
            </span>
          )}
          {project.subIssues > 0 && (
            <span className="inline-flex items-center gap-[3px]" title="Sub-issues">
              <GitBranch size={12} strokeWidth={1.75} />
              {project.subIssues}
            </span>
          )}
          {project.comments > 0 && (
            <span className="inline-flex items-center gap-[3px]" title="Comments">
              <MessageSquare size={12} strokeWidth={1.75} />
              {project.comments > 99 ? "99+" : project.comments}
            </span>
          )}
          <span className="inline-flex items-center gap-[3px]" title="Progress">
            <CircleDot size={12} strokeWidth={1.75} />
            {project.progress}%
          </span>
        </div>
        {project.members.length > 0 && (
          <AvatarStack memberIds={project.members} max={3} />
        )}
      </div>
    </div>
  );
}

/* ── New project inline form ── */
function NewProjectForm({ status, onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = () => {
    if (!title.trim()) { onCancel(); return; }
    onSubmit(title.trim(), status);
    setTitle("");
  };

  return (
    <div className="bg-surface-card border border-accent/50 rounded-[12px] p-[14px]">
      <input
        ref={ref}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onCancel(); }}
        onBlur={handleSubmit}
        placeholder="Project title..."
        className="w-full bg-transparent text-[14px] font-medium text-text-primary placeholder:text-text-tertiary outline-none mb-[6px]"
      />
      <div className="flex items-center gap-[4px] text-[11px] text-text-tertiary">
        <kbd className="bg-surface-pill rounded px-[3px] py-[1px] text-[10px]">↵</kbd> save
        <kbd className="bg-surface-pill rounded px-[3px] py-[1px] text-[10px] ml-2">esc</kbd> cancel
      </div>
    </div>
  );
}

/* ── Project detail panel ── */
function ProjectDetailPanel({ project, onClose, onUpdate }) {
  const [title, setTitle] = useState(project.title);
  const [desc, setDesc] = useState(project.description || "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => { setTitle(project.title); setDesc(project.description || ""); setEditingTitle(false); setEditingDesc(false); }, [project.id]);

  const colInfo = COLUMNS.find((c) => c.key === project.status);

  return (
    <div className="fixed inset-y-0 right-0 w-[440px] bg-surface-card border-l border-divider shadow-[-4px_0_24px_rgba(0,0,0,0.12)] z-50 flex flex-col animate-[slideIn_0.2s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-divider shrink-0">
        <div className="flex items-center gap-[8px]">
          <div className="relative">
            <button onClick={() => setStatusOpen(!statusOpen)} className="inline-flex items-center gap-[4px] text-[12px] text-text-secondary bg-surface-muted rounded-[4px] px-[6px] py-[2px] hover:bg-hover transition-colors">
              <span>{colInfo?.icon}</span>
              <span>{colInfo?.label}</span>
            </button>
            {statusOpen && (
              <div className="absolute left-0 top-full mt-[2px] w-[160px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.18)] z-30 py-[4px]">
                {COLUMNS.map((col) => (
                  <div key={col.key} onClick={() => { onUpdate(project.id, { status: col.key }); setStatusOpen(false); }} className={`flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover ${project.status === col.key ? "text-accent" : "text-text-primary"}`}>
                    <span className="text-[12px]">{col.icon}</span><span>{col.label}</span>
                    {project.status === col.key && <Check size={13} className="ml-auto text-accent" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={onClose} className="p-[5px] rounded-md hover:bg-hover text-text-tertiary hover:text-text-primary transition-colors">
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
        {/* Title */}
        {editingTitle ? (
          <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => { if (title.trim()) onUpdate(project.id, { title: title.trim() }); setEditingTitle(false); }} onKeyDown={(e) => { if (e.key === "Enter") { if (title.trim()) onUpdate(project.id, { title: title.trim() }); setEditingTitle(false); } if (e.key === "Escape") { setTitle(project.title); setEditingTitle(false); } }} autoFocus className="text-[18px] font-semibold text-text-primary bg-transparent outline-none w-full border-b border-accent pb-[4px] mb-[8px]" />
        ) : (
          <h2 onClick={() => setEditingTitle(true)} className="text-[18px] font-semibold text-text-primary mb-[8px] cursor-text hover:bg-hover/50 rounded px-[2px] -mx-[2px] transition-colors">{project.title}</h2>
        )}

        {/* Description */}
        {editingDesc ? (
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} onBlur={() => { onUpdate(project.id, { description: desc.trim() || "No description" }); setEditingDesc(false); }} onKeyDown={(e) => { if (e.key === "Escape") { setDesc(project.description || ""); setEditingDesc(false); } }} autoFocus rows={3} className="w-full bg-surface rounded-lg border border-divider px-[10px] py-[8px] text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors resize-none mb-[16px]" />
        ) : (
          <p onClick={() => setEditingDesc(true)} className={`text-[13px] leading-[1.55] mb-[16px] cursor-text hover:bg-hover/50 rounded px-[2px] -mx-[2px] transition-colors ${project.description === "No description" ? "text-text-tertiary italic" : "text-text-secondary"}`}>{project.description || "No description"}</p>
        )}

        {/* Properties */}
        <div className="space-y-[12px] mb-[20px]">
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] text-text-tertiary w-[72px] shrink-0">Priority</span>
            <div className="flex items-center gap-[6px]">
              {project.priority === "high" && <AlertTriangle size={13} className="text-[#f59e0b]" />}
              <span className="text-[13px] text-text-primary capitalize">{project.priority}</span>
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] text-text-tertiary w-[72px] shrink-0">Date</span>
            <span className="inline-flex items-center gap-[4px] text-[13px] text-text-primary">
              <Calendar size={13} className="text-text-secondary" />
              {project.date}
              {project.dateSuffix && <span className="text-[#f59e0b] font-medium text-[12px]">{project.dateSuffix}</span>}
            </span>
          </div>
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] text-text-tertiary w-[72px] shrink-0">Sprint</span>
            <SprintTag sprint={project.sprint} />
          </div>
          <div className="flex items-start gap-[12px]">
            <span className="text-[12px] text-text-tertiary w-[72px] shrink-0 mt-[2px]">Teams</span>
            <div className="flex items-center gap-[4px] flex-wrap">
              {project.teams.map((t) => <TeamTag key={t} name={t} />)}
            </div>
          </div>
          <div className="flex items-center gap-[12px]">
            <span className="text-[12px] text-text-tertiary w-[72px] shrink-0">Members</span>
            {project.members.length > 0 ? <AvatarStack memberIds={project.members} max={5} /> : <span className="text-[13px] text-text-tertiary">None</span>}
          </div>
        </div>

        <div className="border-t border-divider my-[16px]" />

        {/* Progress */}
        <div className="mb-[16px]">
          <div className="flex items-center justify-between mb-[6px]">
            <span className="text-[13px] font-medium text-text-primary">Progress</span>
            <span className="text-[13px] text-text-secondary">{project.progress}%</span>
          </div>
          <div className="h-[6px] rounded-full bg-surface-muted">
            <div className={`h-[6px] rounded-full transition-all ${project.progress === 100 ? "bg-[#4caf50]" : "bg-accent"}`} style={{ width: `${project.progress}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-[8px]">
          {[
            { icon: Paperclip, label: "Attachments", value: project.attachments || 0 },
            { icon: GitBranch, label: "Sub-issues", value: project.subIssues || 0 },
            { icon: MessageSquare, label: "Comments", value: project.comments || 0 },
            { icon: CircleDot, label: "Progress", value: `${project.progress}%` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-[8px] bg-surface rounded-[8px] px-[10px] py-[8px]">
              <Icon size={14} strokeWidth={1.75} className="text-text-secondary shrink-0" />
              <div>
                <div className="text-[13px] font-medium text-text-primary">{value}</div>
                <div className="text-[11px] text-text-tertiary">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Column ── */
function Column({ col, projects, onUpdate, onDelete, onSelect, onCreate, isDragOver, isDragging, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }) {
  const [creating, setCreating] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`flex flex-col min-w-0 min-h-0 rounded-[12px] transition-colors ${isDragOver ? "bg-accent/8 ring-2 ring-accent/30 ring-inset" : ""}`}
      onDragOver={(e) => onDragOver(e, col.key)}
      onDragLeave={(e) => onDragLeave(e, col.key)}
      onDrop={(e) => onDrop(e, col.key)}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-[12px] px-[2px]">
        <div className="flex items-center gap-[8px]">
          <span
            onClick={() => setCollapsed(!collapsed)}
            className="text-[14px] font-semibold text-text-primary cursor-pointer hover:text-accent transition-colors"
          >
            {col.label}
          </span>
          <span className="text-[13px] text-text-tertiary tabular-nums bg-surface-muted rounded-full px-[7px] py-[3px] leading-none font-medium">
            {projects.length}
          </span>
        </div>
        <div className="flex items-center gap-[2px]">
          <button
            onClick={() => setCreating(true)}
            className="p-[4px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover transition-colors"
            title={`Add project to ${col.label}`}
          >
            <Plus size={15} strokeWidth={1.75} />
          </button>
          <button className="p-[4px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover transition-colors">
            <MoreHorizontal size={15} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Cards */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto space-y-[8px] pb-[16px] pr-[2px]">
          {creating && (
            <NewProjectForm
              status={col.key}
              onSubmit={(title) => { onCreate(title, col.key); setCreating(false); }}
              onCancel={() => setCreating(false)}
            />
          )}
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onSelect={onSelect}
              isDragging={isDragging === p.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>
      )}
      {collapsed && (
        <div
          onClick={() => setCollapsed(false)}
          className="text-[12px] text-text-tertiary cursor-pointer hover:text-text-secondary py-[8px] px-[2px]"
        >
          {projects.length} project{projects.length !== 1 ? "s" : ""} hidden
        </div>
      )}
    </div>
  );
}

/* ── Main Roadmap ── */
export default function Roadmap() {
  const [projects, setProjects] = useState(() => [...SEED_PROJECTS]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [nextId, setNextId] = useState(100);
  const [dragId, setDragId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const handleDragStart = useCallback((e, projectId) => {
    setDragId(projectId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", projectId);
    // Make ghost slightly transparent
    if (e.target) e.target.style.opacity = "0.5";
  }, []);

  const handleDragEnd = useCallback((e) => {
    if (e.target) e.target.style.opacity = "1";
    setDragId(null);
    setDropTarget(null);
  }, []);

  const handleDragOver = useCallback((e, colKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(colKey);
  }, []);

  const handleDragLeave = useCallback((e, colKey) => {
    // Only clear if leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTarget(null);
    }
  }, []);

  const handleDrop = useCallback((e, colKey) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("text/plain");
    if (projectId) {
      setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, status: colKey } : p));
      if (selectedProject?.id === projectId) setSelectedProject((prev) => prev ? { ...prev, status: colKey } : prev);
    }
    setDragId(null);
    setDropTarget(null);
  }, [selectedProject]);

  const handleUpdate = useCallback((id, updates) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
    if (selectedProject?.id === id) setSelectedProject((prev) => prev ? { ...prev, ...updates } : prev);
  }, [selectedProject]);

  const handleDelete = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
  }, [selectedProject]);

  const handleCreate = useCallback((title, status) => {
    const newProject = {
      id: `p${nextId}`,
      title,
      description: "No description",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      teams: ["Engineering"],
      sprint: "Sprint 1",
      attachments: 0,
      comments: 0,
      progress: 0,
      status,
      priority: "medium",
      members: [],
    };
    setProjects((prev) => [...prev, newProject]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const handleSelect = useCallback((project) => {
    setSelectedProject((prev) => prev?.id === project.id ? null : project);
  }, []);

  // Filter projects
  const filtered = filterText
    ? projects.filter((p) =>
        p.title.toLowerCase().includes(filterText.toLowerCase()) ||
        p.teams.some((t) => t.toLowerCase().includes(filterText.toLowerCase()))
      )
    : projects;

  const currentSelected = selectedProject ? projects.find((p) => p.id === selectedProject.id) : null;

  return (
    <div className="bg-surface h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-[24px] pb-[14px] shrink-0">
        <div className="flex items-center gap-[8px]">
          <BarChart3 size={16} strokeWidth={1.75} className="text-text-secondary" />
          <h1 className="text-[15px] font-semibold text-text-primary">Roadmaps</h1>
        </div>
        <div className="flex items-center gap-[8px]">
          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`inline-flex items-center gap-[6px] text-[13px] rounded-md px-[10px] py-[5px] transition-colors ${filterOpen || filterText ? "bg-surface-active text-text-primary" : "text-text-secondary hover:bg-hover hover:text-text-primary"}`}
            >
              <SlidersHorizontal size={14} strokeWidth={1.75} />
              <span>Filter</span>
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-[4px] w-[220px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.18)] z-20 p-[8px]">
                <div className="flex items-center gap-[6px]">
                  <Search size={13} className="text-text-tertiary shrink-0" />
                  <input
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Search projects..."
                    autoFocus
                    className="bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none w-full"
                  />
                  {filterText && (
                    <button onClick={() => setFilterText("")} className="text-text-tertiary hover:text-text-primary">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Board view toggle */}
          <div className="inline-flex items-center gap-0 bg-surface-card rounded-md border border-divider">
            <button className="inline-flex items-center gap-[5px] text-[13px] font-medium text-text-primary px-[10px] py-[5px] bg-surface-active rounded-md">
              <BarChart3 size={13} strokeWidth={1.75} />
              Board view
            </button>
          </div>
          {/* New project */}
          <button
            onClick={() => {
              const title = "New project";
              handleCreate(title, "todo");
            }}
            className="inline-flex items-center gap-[5px] bg-accent text-white rounded-md px-[12px] py-[5px] text-[13px] font-medium hover:opacity-90 transition-colors"
          >
            <Plus size={14} strokeWidth={2} />
            New project
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-[8px]">
        <div className="grid grid-cols-4 gap-[12px] h-full min-w-[900px]">
          {COLUMNS.map((col) => (
            <Column
              key={col.key}
              col={col}
              projects={filtered.filter((p) => p.status === col.key)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onSelect={handleSelect}
              onCreate={handleCreate}
              isDragOver={dropTarget === col.key}
              isDragging={dragId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {currentSelected && (
        <ProjectDetailPanel
          project={currentSelected}
          onClose={() => setSelectedProject(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
