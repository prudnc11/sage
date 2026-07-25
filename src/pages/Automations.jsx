import { useState, useRef, useEffect, useCallback } from "react";
import {
  Zap,
  Plus,
  ToggleLeft,
  ToggleRight,
  Play,
  ArrowRight,
  Activity,
  AlertTriangle,
  X,
  Check,
  Search,
  Trash2,
  Copy,
  MoreHorizontal,
  ChevronDown,
  Edit3,
  Pause,
} from "lucide-react";
import { AUTOMATION_RULES as SEED_RULES, TEAMS } from "../data/store";

function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) { if (ref.current && !ref.current.contains(e.target)) handler(); }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

const TRIGGER_OPTIONS = ["Issue created", "Issue updated", "PR merged", "PR opened", "Age > 24h", "Age > 48h", "Age > 90 days", "Comment added", "Label changed", "Status changed"];
const ACTION_OPTIONS = ["Change status to In Review", "Change status to Done", "Change status to Cancelled", "Assign to round-robin (Engineering)", "Send Slack notification to Team Lead", "Add label 'Security'", "Post comment", "Remove from sprint"];

/* ── Editable pill ── */
function EditablePill({ value, options, onChange, color }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <span onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className={`inline-flex items-center gap-[4px] ${color} rounded-[4px] px-[6px] py-[3px] text-[11px] font-medium cursor-pointer hover:opacity-80 transition-opacity max-w-[200px]`}>
        <span className="truncate">{value}</span>
        <ChevronDown size={10} className="shrink-0" />
      </span>
      {open && (
        <div className="absolute left-0 top-full mt-[2px] w-[260px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.18)] z-30 py-[4px]">
          <div className="flex items-center gap-[6px] px-3 py-[6px] border-b border-divider mx-[4px] mb-[2px]">
            <Search size={13} className="text-text-tertiary shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." autoFocus className="bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none w-full" />
          </div>
          {filtered.map((opt) => (
            <div key={opt} onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); setSearch(""); }} className={`flex items-center gap-[6px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover ${opt === value ? "text-accent" : "text-text-primary"}`}>
              <span className="truncate">{opt}</span>
              {opt === value && <Check size={13} className="ml-auto text-accent shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Inline text edit ── */
function InlineEdit({ value, onSave, className = "" }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  if (editing) {
    return (
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => { if (text.trim()) onSave(text.trim()); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === "Enter") { if (text.trim()) onSave(text.trim()); setEditing(false); } if (e.key === "Escape") { setText(value); setEditing(false); } }}
        autoFocus
        className={`bg-transparent outline-none border-b border-accent ${className}`}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }
  return <span onClick={(e) => { e.stopPropagation(); setEditing(true); }} className={`cursor-text hover:bg-hover/50 rounded px-[1px] -mx-[1px] transition-colors ${className}`} title="Click to edit">{value}</span>;
}

/* ── Dry run modal ── */
function DryRunModal({ rule, onClose }) {
  const [running, setRunning] = useState(true);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRunning(false);
      setResults([
        { issue: "ENG-195", match: true, action: rule.action },
        { issue: "ENG-222", match: true, action: rule.action },
        { issue: "ENG-210", match: false, reason: "Condition not met" },
        { issue: "ENG-201", match: false, reason: "Already processed" },
      ]);
    }, 1500);
    return () => clearTimeout(timer);
  }, [rule]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-surface-card rounded-[16px] border border-divider shadow-[0_8px_40px_rgba(0,0,0,0.25)] w-[480px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-divider">
          <div className="flex items-center gap-[8px]">
            <Play size={15} className="text-[#f59e0b]" />
            <span className="text-[14px] font-semibold text-text-primary">Dry Run — {rule.name}</span>
          </div>
          <button onClick={onClose} className="p-[4px] rounded-md hover:bg-hover text-text-tertiary"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-[20px]">
          {running ? (
            <div className="flex flex-col items-center py-[32px] gap-[12px]">
              <div className="w-[32px] h-[32px] border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px] text-text-secondary">Testing rule against existing issues...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-[8px] mb-[16px]">
                <span className="text-[13px] font-medium text-text-primary">Results</span>
                <span className="text-[12px] text-text-tertiary">{results.filter((r) => r.match).length} of {results.length} issues matched</span>
              </div>
              <div className="space-y-[6px]">
                {results.map((r) => (
                  <div key={r.issue} className={`flex items-center gap-[10px] px-[12px] py-[8px] rounded-[8px] ${r.match ? "bg-[#e8f5e9] dark:bg-[#1b3a1e]" : "bg-surface"}`}>
                    {r.match ? <Check size={14} className="text-[#4caf50] shrink-0" /> : <X size={14} className="text-text-tertiary shrink-0" />}
                    <span className="text-[13px] font-mono text-text-primary">{r.issue}</span>
                    <span className="text-[12px] text-text-secondary truncate flex-1">{r.match ? r.action : r.reason}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Rule detail panel ── */
function RuleDetailPanel({ rule, onClose, onUpdate, onDryRun }) {
  const team = TEAMS.find((t) => t.id === rule.team);
  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-surface-card border-l border-divider shadow-[-4px_0_24px_rgba(0,0,0,0.12)] z-40 flex flex-col animate-[slideIn_0.2s_ease-out]">
      <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-divider shrink-0">
        <div className="flex items-center gap-[8px]">
          <Zap size={15} className="text-accent" />
          <span className="text-[13px] font-medium text-text-primary">Rule Details</span>
        </div>
        <button onClick={onClose} className="p-[5px] rounded-md hover:bg-hover text-text-tertiary"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-[20px] py-[16px] space-y-[16px]">
        {/* Name */}
        <div>
          <span className="text-[12px] text-text-tertiary block mb-[4px]">Name</span>
          <InlineEdit value={rule.name} onSave={(v) => onUpdate(rule.id, { name: v })} className="text-[16px] font-medium text-text-primary" />
        </div>
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-text-tertiary">Status</span>
          <button onClick={() => onUpdate(rule.id, { enabled: !rule.enabled })} className={`inline-flex items-center gap-[6px] text-[13px] font-medium px-[10px] py-[5px] rounded-md transition-colors ${rule.enabled ? "text-[#4caf50] bg-[#e8f5e9] dark:bg-[#1b3a1e]" : "text-text-tertiary bg-surface-muted"}`}>
            {rule.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {rule.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>
        {/* Trigger */}
        <div>
          <span className="text-[12px] text-text-tertiary block mb-[4px]">Trigger</span>
          <EditablePill value={rule.trigger} options={TRIGGER_OPTIONS} onChange={(v) => onUpdate(rule.id, { trigger: v })} color="bg-[#e8eaf6] dark:bg-[#2a2d4a] text-[#5e6ad2] dark:text-[#9da5f0]" />
        </div>
        {/* Condition */}
        <div>
          <span className="text-[12px] text-text-tertiary block mb-[4px]">Condition</span>
          <InlineEdit value={rule.condition} onSave={(v) => onUpdate(rule.id, { condition: v })} className="text-[13px] text-text-primary bg-[#fff8e1] dark:bg-[#3e3510] text-[#f57f17] dark:text-[#fff176] rounded-[4px] px-[6px] py-[3px]" />
        </div>
        {/* Action */}
        <div>
          <span className="text-[12px] text-text-tertiary block mb-[4px]">Action</span>
          <EditablePill value={rule.action} options={ACTION_OPTIONS} onChange={(v) => onUpdate(rule.id, { action: v })} color="bg-[#e8f5e9] dark:bg-[#1b3a1e] text-[#2e7d32] dark:text-[#81c784]" />
        </div>
        {/* Team */}
        <div className="flex items-center gap-[12px]">
          <span className="text-[12px] text-text-tertiary w-[72px]">Team</span>
          <span className="text-[13px] text-text-primary">{team?.name || "—"}</span>
        </div>
        {/* Executions */}
        <div className="flex items-center gap-[12px]">
          <span className="text-[12px] text-text-tertiary w-[72px]">Executions</span>
          <span className="text-[13px] text-text-primary flex items-center gap-[4px]"><Activity size={13} /> {rule.executions}</span>
        </div>
        <div className="border-t border-divider pt-[16px]">
          <button onClick={() => onDryRun(rule)} className="inline-flex items-center gap-[6px] bg-[#fff8e1] dark:bg-[#3e3510] text-[#f57f17] dark:text-[#fff176] rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium hover:opacity-80 transition-colors w-full justify-center">
            <Play size={14} /> Run Dry Test
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Rule Card ── */
function RuleCard({ rule, onUpdate, onDelete, onSelect, onDryRun }) {
  const team = TEAMS.find((t) => t.id === rule.team);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <div onClick={() => onSelect(rule)} className="bg-surface-card border border-divider rounded-[12px] p-[16px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-text-tertiary/30 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-[10px]">
        <div className="flex items-center gap-[8px] min-w-0 flex-1">
          <div className={`w-[8px] h-[8px] rounded-full shrink-0 ${rule.enabled ? "bg-[#4caf50]" : "bg-text-tertiary"}`} />
          <span className="text-[13px] font-medium text-text-primary truncate">{rule.name}</span>
        </div>
        <div className="flex items-center gap-[4px] shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onUpdate(rule.id, { enabled: !rule.enabled }); }}
            className="text-text-tertiary hover:text-text-primary transition-colors"
            title={rule.enabled ? "Disable rule" : "Enable rule"}
          >
            {rule.enabled ? <ToggleRight size={20} className="text-accent" /> : <ToggleLeft size={20} />}
          </button>
          <div className="relative" ref={menuRef}>
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="p-[3px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-[2px] w-[160px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_20px_rgba(0,0,0,0.18)] z-30 py-[4px]">
                <div onClick={(e) => { e.stopPropagation(); onDryRun(rule); setMenuOpen(false); }} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover text-text-primary"><Play size={13} /> Dry Run</div>
                <div onClick={(e) => { e.stopPropagation(); onUpdate(rule.id, { enabled: !rule.enabled }); setMenuOpen(false); }} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover text-text-primary">{rule.enabled ? <Pause size={13} /> : <Play size={13} />}{rule.enabled ? "Disable" : "Enable"}</div>
                <div onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(rule.name); setMenuOpen(false); }} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover text-text-primary"><Copy size={13} /> Copy Name</div>
                <div className="border-t border-divider my-[3px]" />
                <div onClick={(e) => { e.stopPropagation(); onDelete(rule.id); setMenuOpen(false); }} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover text-[#e53935]"><Trash2 size={13} /> Delete</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Flow */}
      <div className="flex items-center gap-[6px] mb-[12px] flex-wrap">
        <span className="inline-flex items-center gap-[4px] bg-[#e8eaf6] dark:bg-[#2a2d4a] text-[#5e6ad2] dark:text-[#9da5f0] rounded-[4px] px-[6px] py-[3px] text-[11px] font-medium"><Zap size={11} />{rule.trigger}</span>
        <ArrowRight size={12} className="text-text-tertiary shrink-0" />
        <span className="inline-flex items-center bg-[#fff8e1] dark:bg-[#3e3510] text-[#f57f17] dark:text-[#fff176] rounded-[4px] px-[6px] py-[3px] text-[11px] font-medium truncate max-w-[180px]">{rule.condition}</span>
        <ArrowRight size={12} className="text-text-tertiary shrink-0" />
        <span className="inline-flex items-center bg-[#e8f5e9] dark:bg-[#1b3a1e] text-[#2e7d32] dark:text-[#81c784] rounded-[4px] px-[6px] py-[3px] text-[11px] font-medium truncate max-w-[180px]">{rule.action}</span>
      </div>
      <div className="flex items-center justify-between text-[12px] text-text-secondary">
        <span className="inline-flex items-center gap-[4px]"><Activity size={12} />{rule.executions} executions</span>
        <span>{team?.name}</span>
      </div>
    </div>
  );
}

/* ── New rule form ── */
function NewRuleForm({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("Issue created");
  const [condition, setCondition] = useState("");
  const [action, setAction] = useState("Change status to In Review");
  const [team, setTeam] = useState("t1");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = () => {
    if (!name.trim() || !condition.trim()) return;
    onSubmit({ name: name.trim(), trigger, condition: condition.trim(), action, team });
  };

  return (
    <div className="bg-surface-card border border-accent/50 rounded-[12px] p-[16px] space-y-[10px]">
      <input ref={ref} value={name} onChange={(e) => setName(e.target.value)} placeholder="Rule name..." className="w-full bg-transparent text-[14px] font-medium text-text-primary placeholder:text-text-tertiary outline-none" />
      <div className="flex items-center gap-[6px] flex-wrap">
        <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className="bg-[#e8eaf6] dark:bg-[#2a2d4a] text-[#5e6ad2] dark:text-[#9da5f0] rounded-[4px] px-[6px] py-[3px] text-[11px] font-medium border-none outline-none cursor-pointer">
          {TRIGGER_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <ArrowRight size={12} className="text-text-tertiary" />
        <input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="Condition..." className="bg-[#fff8e1] dark:bg-[#3e3510] text-[#f57f17] dark:text-[#fff176] rounded-[4px] px-[6px] py-[3px] text-[11px] font-medium outline-none placeholder:text-[#f57f17]/50 w-[160px]" />
        <ArrowRight size={12} className="text-text-tertiary" />
        <select value={action} onChange={(e) => setAction(e.target.value)} className="bg-[#e8f5e9] dark:bg-[#1b3a1e] text-[#2e7d32] dark:text-[#81c784] rounded-[4px] px-[6px] py-[3px] text-[11px] font-medium border-none outline-none cursor-pointer">
          {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-[8px]">
        <button onClick={handleSubmit} disabled={!name.trim() || !condition.trim()} className={`text-[12px] px-[10px] py-[5px] rounded-md font-medium transition-colors ${name.trim() && condition.trim() ? "bg-accent text-white hover:opacity-90" : "bg-surface-muted text-text-tertiary cursor-not-allowed"}`}>Create Rule</button>
        <button onClick={onCancel} className="text-[12px] text-text-tertiary hover:text-text-primary transition-colors">Cancel</button>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function Automations() {
  const [rules, setRules] = useState(() => [...SEED_RULES]);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [dryRunRule, setDryRunRule] = useState(null);
  const [nextId, setNextId] = useState(10);

  const enabled = rules.filter((r) => r.enabled);
  const disabled = rules.filter((r) => !r.enabled);

  const handleUpdate = useCallback((id, updates) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, ...updates } : prev);
  }, [selected]);

  const handleDelete = useCallback((id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    if (selected?.id === id) setSelected(null);
  }, [selected]);

  const handleCreate = useCallback((data) => {
    const newRule = { id: `r${nextId}`, ...data, enabled: true, executions: 0 };
    setRules((prev) => [...prev, newRule]);
    setNextId((n) => n + 1);
    setCreating(false);
  }, [nextId]);

  const currentSelected = selected ? rules.find((r) => r.id === selected.id) : null;

  return (
    <div className="bg-surface min-h-full overflow-y-auto">
      <div className="px-6 pt-[24px] pb-[16px]">
        <div className="flex items-center justify-between mb-[20px]">
          <div>
            <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">Workflow Automations</h1>
            <p className="text-[13px] text-text-secondary mt-[2px]">Automate status transitions, assignments, and notifications with rule-based triggers</p>
          </div>
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-[6px] bg-accent text-white rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium hover:opacity-90 transition-colors">
            <Plus size={15} /> New Rule
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-[12px] mb-[24px]">
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">Active Rules</span>
            <div className="text-[24px] font-semibold text-text-primary mt-[2px]">{enabled.length}</div>
          </div>
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">Total Executions</span>
            <div className="text-[24px] font-semibold text-text-primary mt-[2px]">{rules.reduce((s, r) => s + r.executions, 0)}</div>
          </div>
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">Auto-Transition Rate</span>
            <div className="text-[24px] font-semibold text-accent mt-[2px]">42%</div>
          </div>
        </div>

        {/* Dry-run banner */}
        <div className="flex items-center gap-[8px] bg-[#fff8e1] dark:bg-[#3e3510] border border-[#ffe082] dark:border-[#5a4a1a] rounded-[8px] px-[14px] py-[10px] mb-[20px] text-[13px]">
          <AlertTriangle size={15} className="text-[#f57f17] shrink-0" />
          <span className="text-[#5d4037] dark:text-[#fff176]"><strong>Dry-run mode available</strong> — test rules against existing issues before enabling</span>
          <button onClick={() => { if (enabled.length > 0) setDryRunRule(enabled[0]); }} className="ml-auto inline-flex items-center gap-[4px] text-[#f57f17] font-medium hover:underline text-[12px]"><Play size={12} /> Try it</button>
        </div>

        {/* New rule form */}
        {creating && (
          <div className="mb-[16px]">
            <NewRuleForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
          </div>
        )}

        {/* Active rules */}
        <div className="mb-[20px]">
          <div className="flex items-center gap-[8px] mb-[10px]">
            <span className="text-[13px] font-semibold text-text-primary">Active</span>
            <span className="text-[12px] text-text-tertiary">{enabled.length}</span>
          </div>
          <div className="grid gap-[10px]">
            {enabled.map((r) => <RuleCard key={r.id} rule={r} onUpdate={handleUpdate} onDelete={handleDelete} onSelect={setSelected} onDryRun={setDryRunRule} />)}
          </div>
        </div>

        {disabled.length > 0 && (
          <div>
            <div className="flex items-center gap-[8px] mb-[10px]">
              <span className="text-[13px] font-semibold text-text-secondary">Disabled</span>
              <span className="text-[12px] text-text-tertiary">{disabled.length}</span>
            </div>
            <div className="grid gap-[10px]">
              {disabled.map((r) => <RuleCard key={r.id} rule={r} onUpdate={handleUpdate} onDelete={handleDelete} onSelect={setSelected} onDryRun={setDryRunRule} />)}
            </div>
          </div>
        )}
      </div>

      {currentSelected && <RuleDetailPanel rule={currentSelected} onClose={() => setSelected(null)} onUpdate={handleUpdate} onDryRun={setDryRunRule} />}
      {dryRunRule && <DryRunModal rule={dryRunRule} onClose={() => setDryRunRule(null)} />}
    </div>
  );
}
