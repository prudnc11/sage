import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Zap, Sparkles, AlertTriangle, HelpCircle, ThumbsUp,
  FileEdit, CheckCircle2, MoreHorizontal, X, ExternalLink,
  Play, Rocket, Search, ChevronDown, Copy, Plus, ZoomIn,
  Maximize2, MousePointer2, GitBranch, Smile, Filter,
  BrainCircuit, Mail, Database, Send, Ticket, BookOpen,
} from "lucide-react";
import { Avatar } from "../components/shared";

/* ═══════════════════════════════════════════════════════════
   SEED DATA
   ═══════════════════════════════════════════════════════════ */

const SEED_NODES = [
  {
    id: "n1", type: "trigger", title: "New Ticket", subtitle: "Zendesk Webhook",
    x: 370, y: 60, iconBg: "#4caf50", iconType: "zap",
  },
  {
    id: "n2", type: "ai", title: "Analyze Sentiment", subtitle: "GPT-4o \u2022 28ms",
    x: 330, y: 210, iconBg: "#7c3aed", iconType: "sparkles",
    config: {
      model: "GPT-4o-mini (Fastest)",
      cost: "$0.002 per run",
      prompt: 'You are a customer support triage agent. Analyze the incoming message stored in variable {{trigger.message}}.\n\nOutput JSON with:\n1. "sentiment": float (-1.0 to 1.0)\n2. "urgency": "low", "medium", "high"\n3. "summary": string (max 10 words)',
      temperature: 0.2,
      schema: '{\n  "sentiment": 0.85,\n  "urgency": "low",\n  "summary": "User loves the new dashboard"\n}',
    },
  },
  {
    id: "n3", type: "route", title: "Route: Critical", subtitle: "If sentiment < 0.3",
    x: 130, y: 390, iconBg: "#ef4444", iconType: "alert",
    config: { condition: "sentiment < 0.3" },
  },
  {
    id: "n4", type: "route", title: "Route: Inquiry", subtitle: 'If type = "Question"',
    x: 370, y: 390, iconBg: "#06b6d4", iconType: "help",
    config: { condition: 'type = "Question"' },
  },
  {
    id: "n5", type: "route", title: "Route: Praise", subtitle: "If sentiment > 0.8",
    x: 610, y: 390, iconBg: "#f59e0b", iconType: "thumbsUp",
    config: { condition: "sentiment > 0.8" },
  },
  {
    id: "n6", type: "action", title: "Escalate to Slack", subtitle: "Channel: #urgent",
    x: 130, y: 530, iconBg: "#ef4444", iconType: "alert",
    config: { channel: "#urgent", integration: "Slack" },
  },
  {
    id: "n7", type: "action", title: "Draft Response", subtitle: "Using KB Articles",
    x: 370, y: 530, iconBg: "#3b82f6", iconType: "fileEdit",
    config: { source: "KB Articles", integration: "Internal" },
  },
  {
    id: "n8", type: "action", title: "Log Feedback", subtitle: "Airtable: Testimonials",
    x: 610, y: 530, iconBg: "#10b981", iconType: "database",
    config: { table: "Testimonials", integration: "Airtable" },
  },
  {
    id: "n9", type: "end", title: "Mark Ticket Resolved", subtitle: "",
    x: 370, y: 680, iconBg: "#4caf50", iconType: "check",
  },
];

const SEED_EDGES = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
  { from: "n2", to: "n4" },
  { from: "n2", to: "n5" },
  { from: "n3", to: "n6" },
  { from: "n4", to: "n7" },
  { from: "n5", to: "n8" },
  { from: "n6", to: "n9" },
  { from: "n7", to: "n9" },
  { from: "n8", to: "n9" },
];

const LOGIC_BLOCKS = [
  { id: "lb1", type: "ai", title: "AI Reason", iconType: "brain", iconBg: "#7c3aed" },
  { id: "lb2", type: "route", title: "Branch", iconType: "branch", iconBg: "#06b6d4" },
  { id: "lb3", type: "ai", title: "Sentiment", iconType: "smile", iconBg: "#f59e0b" },
  { id: "lb4", type: "action", title: "Extract", iconType: "filter", iconBg: "#10b981" },
];

const INTEGRATIONS = [
  { id: "int1", name: "Slack", desc: "Send message", color: "#611f69", letter: "S" },
  { id: "int2", name: "Email", desc: "Send via SMTP", color: "#3b82f6", letter: "E" },
  { id: "int3", name: "Notion", desc: "Update DB", color: "#191919", letter: "N" },
  { id: "int4", name: "Zendesk", desc: "Manage Ticket", color: "#17494d", letter: "Z" },
  { id: "int5", name: "HubSpot", desc: "Sync Customer", color: "#ff7a59", letter: "H" },
];

const NODE_W = 210;
const NODE_H = 56;

/* ═══════════════════════════════════════════════════════════
   ICON HELPER
   ═══════════════════════════════════════════════════════════ */
function NodeIcon({ type, bg, size = 30 }) {
  const iconSize = size * 0.5;
  const Icon = {
    zap: Zap, sparkles: Sparkles, alert: AlertTriangle, help: HelpCircle,
    thumbsUp: ThumbsUp, fileEdit: FileEdit, database: Database, check: CheckCircle2,
    brain: BrainCircuit, branch: GitBranch, smile: Smile, filter: Filter,
  }[type] || Zap;

  return (
    <div
      className="rounded-[8px] flex items-center justify-center shrink-0"
      style={{ width: size, height: size, backgroundColor: bg }}
    >
      <Icon size={iconSize} strokeWidth={2} className="text-white" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SVG EDGE PATH
   ═══════════════════════════════════════════════════════════ */
function getEdgePath(from, to) {
  const fx = from.x + NODE_W / 2;
  const fy = from.y + NODE_H;
  const tx = to.x + NODE_W / 2;
  const ty = to.y;
  const dy = Math.abs(ty - fy);
  const cp = Math.max(40, dy * 0.45);
  return `M ${fx} ${fy} C ${fx} ${fy + cp}, ${tx} ${ty - cp}, ${tx} ${ty}`;
}

/* ═══════════════════════════════════════════════════════════
   WORKFLOW NODE
   ═══════════════════════════════════════════════════════════ */
function WorkflowNode({ node, selected, onSelect, onMouseDown, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <div
      style={{ position: "absolute", left: node.x, top: node.y, width: NODE_W }}
      className={`rounded-[12px] border ${selected ? "border-[#7c3aed] shadow-[0_0_0_1px_#7c3aed]" : "border-[#333333]"} bg-[#2A2A2A] shadow-[0_2px_12px_rgba(0,0,0,0.3)] select-none z-10 transition-shadow`}
    >
      {/* Top connector dot */}
      {node.type !== "trigger" && (
        <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#4caf50] border-2 border-[#2A2A2A] z-20" />
      )}

      <div
        className="flex items-center gap-[10px] px-[12px] cursor-grab active:cursor-grabbing"
        style={{ height: NODE_H }}
        onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e, node.id); }}
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
      >
        <NodeIcon type={node.iconType} bg={node.iconBg} size={32} />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-text-primary truncate">{node.title}</div>
          {node.subtitle && <div className="text-[11px] text-text-tertiary truncate">{node.subtitle}</div>}
        </div>
        {/* Status dot for AI nodes */}
        {node.type === "ai" && (
          <div className="w-[8px] h-[8px] rounded-full bg-[#4caf50] shrink-0" />
        )}
        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-[3px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-[#333333] transition-colors"
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-[2px] w-[140px] bg-[#2A2A2A] rounded-lg border border-[#333333] shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-50 py-[4px]">
              <div onClick={(e) => { e.stopPropagation(); onSelect(node.id); setMenuOpen(false); }} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-[#333333] text-text-primary">
                <ExternalLink size={13} /> Inspect
              </div>
              <div className="border-t border-[#333333] my-[2px]" />
              <div onClick={(e) => { e.stopPropagation(); onDelete(node.id); setMenuOpen(false); }} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-[#333333] text-[#e53935]">
                <X size={13} /> Delete
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom connector dot */}
      {node.type !== "end" && (
        <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#4caf50] border-2 border-[#2A2A2A] z-20" />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LIBRARY SIDEBAR
   ═══════════════════════════════════════════════════════════ */
function LibrarySidebar({ onAddNode }) {
  const [logicOpen, setLogicOpen] = useState(true);

  return (
    <div className="w-[240px] shrink-0 border-r border-[#333333] bg-[#1E1E1E] flex flex-col h-full">
      <div className="flex items-center justify-between px-[16px] h-[48px] shrink-0">
        <span className="text-[14px] font-semibold text-text-primary">Library</span>
        <button className="p-[4px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-[#333333]">
          <BookOpen size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-[12px] pb-[12px]">
        {/* Logic Blocks */}
        <button onClick={() => setLogicOpen(!logicOpen)} className="flex items-center gap-[6px] text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-[8px] mt-[4px] px-[4px] hover:text-text-secondary w-full">
          LOGIC BLOCKS
          <ChevronDown size={12} className={`transition-transform ${logicOpen ? "" : "-rotate-90"}`} />
        </button>
        {logicOpen && (
          <div className="grid grid-cols-2 gap-[8px] mb-[20px]">
            {LOGIC_BLOCKS.map((b) => (
              <button
                key={b.id}
                onClick={() => onAddNode(b)}
                className="flex flex-col items-center gap-[6px] py-[14px] rounded-[10px] border border-[#333333] bg-[#2A2A2A] hover:border-[#444444] hover:bg-[#2E2E2E] transition-colors cursor-pointer"
              >
                <NodeIcon type={b.iconType} bg={b.iconBg} size={28} />
                <span className="text-[12px] text-text-primary font-medium">{b.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Integrations */}
        <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-[8px] px-[4px]">INTEGRATIONS</div>
        <div className="space-y-[4px] mb-[20px]">
          {INTEGRATIONS.map((int) => (
            <button
              key={int.id}
              onClick={() => onAddNode({ type: "action", title: int.name, iconType: "zap", iconBg: int.color })}
              className="flex items-center gap-[10px] w-full px-[10px] py-[10px] rounded-[10px] border border-[#333333] bg-[#2A2A2A] hover:border-[#444444] hover:bg-[#2E2E2E] transition-colors cursor-pointer"
            >
              <div className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[14px] font-bold text-white shrink-0" style={{ backgroundColor: int.color }}>
                {int.letter}
              </div>
              <div className="text-left min-w-0">
                <div className="text-[13px] font-medium text-text-primary">{int.name}</div>
                <div className="text-[11px] text-text-tertiary">{int.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Snippets */}
        <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-[8px] px-[4px]">SNIPPETS</div>
        <button className="w-full px-[12px] py-[10px] rounded-[10px] border border-dashed border-[#333333] text-[12px] text-text-tertiary hover:text-text-secondary hover:border-[#444444] transition-colors">
          Save current selection as snippet
        </button>
      </div>

      {/* User */}
      <div className="flex items-center justify-between px-[14px] py-[12px] border-t border-[#333333] shrink-0">
        <div className="flex items-center gap-[8px]">
          <Avatar initials="AM" bg="bg-[#7c3aed]" size={28} />
          <div>
            <div className="text-[13px] font-medium text-text-primary">Alex Morgan</div>
            <div className="text-[11px] text-text-tertiary">Pro Plan</div>
          </div>
        </div>
        <button className="p-[4px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-[#333333]">
          <MoreHorizontal size={15} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NODE INSPECTOR
   ═══════════════════════════════════════════════════════════ */
function NodeInspector({ node, onClose, onUpdate }) {
  const [prompt, setPrompt] = useState(node.config?.prompt || "");
  const [temp, setTemp] = useState(node.config?.temperature ?? 0.5);
  const [model, setModel] = useState(node.config?.model || "GPT-4o-mini (Fastest)");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPrompt(node.config?.prompt || "");
    setTemp(node.config?.temperature ?? 0.5);
    setModel(node.config?.model || "GPT-4o-mini (Fastest)");
  }, [node.id]);

  const handleSave = () => {
    onUpdate(node.id, {
      config: { ...node.config, prompt, temperature: temp, model },
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(node.config?.schema || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-[290px] shrink-0 border-l border-[#333333] bg-[#1E1E1E] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] h-[48px] border-b border-[#333333] shrink-0">
        <div className="flex items-center gap-[8px] min-w-0">
          <NodeIcon type={node.iconType} bg={node.iconBg} size={24} />
          <span className="text-[14px] font-semibold text-text-primary truncate">{node.title}</span>
        </div>
        <div className="flex items-center gap-[2px] shrink-0">
          <button className="p-[4px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-[#333333]">
            <ExternalLink size={14} />
          </button>
          <button onClick={onClose} className="p-[4px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-[#333333]">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-[16px] py-[16px] space-y-[16px]">
        {node.type === "ai" && (
          <>
            {/* Model */}
            <div>
              <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-[6px] block">AI Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-[#333333] rounded-[8px] px-[10px] py-[8px] text-[13px] text-text-primary outline-none focus:border-[#7c3aed] transition-colors appearance-none cursor-pointer"
              >
                <option>GPT-4o-mini (Fastest)</option>
                <option>GPT-4o (Balanced)</option>
                <option>GPT-4.5 (Most Capable)</option>
                <option>Claude Sonnet 4.6</option>
                <option>Claude Opus 4.6</option>
              </select>
              <p className="text-[11px] text-text-tertiary mt-[4px]">Estimated cost: {node.config?.cost || "$0.002 per run"}</p>
            </div>

            {/* Prompt */}
            <div>
              <div className="flex items-center justify-between mb-[6px]">
                <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">System Prompt</label>
                <button className="text-[11px] text-[#7c3aed] hover:text-[#9f7aea] font-medium">Optimize with AI</button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={7}
                className="w-full bg-[#2A2A2A] border border-[#333333] rounded-[8px] px-[10px] py-[8px] text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-[#7c3aed] resize-none leading-[1.6] transition-colors"
              />
            </div>

            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between mb-[6px]">
                <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Temperature</label>
                <span className="text-[13px] font-semibold text-text-primary">{temp.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full h-[4px] rounded-full appearance-none cursor-pointer accent-[#7c3aed]"
                style={{ background: `linear-gradient(to right, #7c3aed ${temp * 100}%, #333333 ${temp * 100}%)` }}
              />
            </div>

            {/* Output Schema */}
            {node.config?.schema && (
              <div>
                <div className="flex items-center justify-between mb-[6px]">
                  <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Output Schema</label>
                  <button onClick={handleCopy} className="flex items-center gap-[4px] text-[11px] text-text-tertiary hover:text-text-primary">
                    <Copy size={11} /> {copied ? "Copied" : ""}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute top-[8px] right-[8px] text-[10px] font-semibold bg-[#7c3aed] text-white rounded px-[6px] py-[1px]">JSON</span>
                  <pre className="bg-[#2A2A2A] border border-[#333333] rounded-[8px] px-[12px] py-[10px] text-[12px] leading-[1.7] overflow-x-auto">
                    <span className="text-text-tertiary">{"{"}</span>{"\n"}
                    <span className="text-[#82aaff]">  "sentiment"</span><span className="text-text-tertiary">:</span> <span className="text-[#c3e88d]">0.85</span><span className="text-text-tertiary">,</span>{"\n"}
                    <span className="text-[#82aaff]">  "urgency"</span><span className="text-text-tertiary">:</span> <span className="text-[#c3e88d]">"low"</span><span className="text-text-tertiary">,</span>{"\n"}
                    <span className="text-[#82aaff]">  "summary"</span><span className="text-text-tertiary">:</span> <span className="text-[#c3e88d]">"User loves the new dashboard"</span>{"\n"}
                    <span className="text-text-tertiary">{"}"}</span>
                  </pre>
                </div>
              </div>
            )}
          </>
        )}

        {node.type === "route" && (
          <div>
            <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-[6px] block">Condition</label>
            <input
              value={node.config?.condition || ""}
              onChange={(e) => onUpdate(node.id, { config: { ...node.config, condition: e.target.value }, subtitle: `If ${e.target.value}` })}
              className="w-full bg-[#2A2A2A] border border-[#333333] rounded-[8px] px-[10px] py-[8px] text-[13px] text-text-primary outline-none focus:border-[#7c3aed] font-mono transition-colors"
            />
          </div>
        )}

        {node.type === "action" && (
          <>
            <div>
              <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-[6px] block">Integration</label>
              <div className="bg-[#2A2A2A] border border-[#333333] rounded-[8px] px-[10px] py-[8px] text-[13px] text-text-primary">
                {node.config?.integration || "Custom"}
              </div>
            </div>
            {node.config?.channel && (
              <div>
                <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-[6px] block">Channel</label>
                <input
                  value={node.config.channel}
                  onChange={(e) => onUpdate(node.id, { config: { ...node.config, channel: e.target.value }, subtitle: `Channel: ${e.target.value}` })}
                  className="w-full bg-[#2A2A2A] border border-[#333333] rounded-[8px] px-[10px] py-[8px] text-[13px] text-text-primary outline-none focus:border-[#7c3aed] font-mono transition-colors"
                />
              </div>
            )}
          </>
        )}

        {node.type === "trigger" && (
          <div>
            <label className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-[6px] block">Trigger Type</label>
            <select className="w-full bg-[#2A2A2A] border border-[#333333] rounded-[8px] px-[10px] py-[8px] text-[13px] text-text-primary outline-none focus:border-[#7c3aed] appearance-none cursor-pointer transition-colors">
              <option>Zendesk Webhook</option>
              <option>HTTP Request</option>
              <option>Schedule (Cron)</option>
              <option>Email Received</option>
            </select>
          </div>
        )}

        {node.type === "end" && (
          <div className="flex flex-col items-center py-[20px] text-text-tertiary">
            <CheckCircle2 size={32} strokeWidth={1.5} className="mb-[8px] text-[#4caf50] opacity-60" />
            <p className="text-[13px]">End of workflow</p>
            <p className="text-[11px] mt-[2px]">All branches converge here</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-[16px] py-[12px] border-t border-[#333333] shrink-0">
        <button className="flex items-center gap-[6px] text-[13px] text-text-secondary hover:text-text-primary px-[12px] py-[6px] rounded-[8px] border border-[#333333] hover:bg-[#333333] transition-colors">
          <Play size={13} /> Test Step
        </button>
        <button onClick={handleSave} className="flex items-center gap-[6px] text-[13px] text-white font-medium px-[14px] py-[6px] rounded-[8px] bg-[#7c3aed] hover:bg-[#6d28d9] transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN AUTOMATIONS PAGE
   ═══════════════════════════════════════════════════════════ */
export default function Automations() {
  const [nodes, setNodes] = useState(() => SEED_NODES.map((n) => ({ ...n })));
  const [edges, setEdges] = useState(() => [...SEED_EDGES]);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [nextId, setNextId] = useState(20);
  const dragRef = useRef(null);

  const selectedNode = nodes.find((n) => n.id === selectedId) || null;

  // Drag
  const handleMouseDown = useCallback((e, nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    dragRef.current = { id: nodeId, offX: e.clientX - node.x, offY: e.clientY - node.y };

    const onMove = (ev) => {
      if (!dragRef.current) return;
      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragRef.current.id
            ? { ...n, x: ev.clientX - dragRef.current.offX, y: ev.clientY - dragRef.current.offY }
            : n
        )
      );
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [nodes]);

  const handleUpdate = useCallback((id, updates) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  const handleDelete = useCallback((id) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleAddNode = useCallback((block) => {
    const newNode = {
      id: `n${nextId}`,
      type: block.type,
      title: block.title || block.name || "New Node",
      subtitle: "",
      x: 300 + Math.random() * 100,
      y: 200 + Math.random() * 200,
      iconBg: block.iconBg || block.color || "#7c3aed",
      iconType: block.iconType || "zap",
      config: block.type === "ai" ? { model: "GPT-4o-mini (Fastest)", cost: "$0.002 per run", prompt: "", temperature: 0.5, schema: "" } : block.type === "route" ? { condition: "" } : {},
    };
    setNodes((prev) => [...prev, newNode]);
    setNextId((n) => n + 1);
    setSelectedId(newNode.id);
  }, [nextId]);

  // Canvas size
  const canvasW = useMemo(() => {
    let max = 1000;
    nodes.forEach((n) => { if (n.x + NODE_W + 60 > max) max = n.x + NODE_W + 60; });
    return max;
  }, [nodes]);
  const canvasH = useMemo(() => {
    let max = 850;
    nodes.forEach((n) => { if (n.y + NODE_H + 80 > max) max = n.y + NODE_H + 80; });
    return max;
  }, [nodes]);

  // Edge paths
  const edgePaths = useMemo(() => {
    return edges.map((e) => {
      const from = nodes.find((n) => n.id === e.from);
      const to = nodes.find((n) => n.id === e.to);
      if (!from || !to) return null;
      return { key: `${e.from}-${e.to}`, d: getEdgePath(from, to) };
    }).filter(Boolean);
  }, [nodes, edges]);

  return (
    <div className="h-full flex flex-col bg-[#1E1E1E]">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-[16px] h-[48px] border-b border-[#333333] shrink-0 bg-[#1E1E1E]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[13px] text-text-tertiary">Workflows</span>
          <span className="text-text-tertiary">/</span>
          <span className="text-[14px] font-semibold text-text-primary">Customer Support Agent v2</span>
          <span className="text-[11px] font-semibold bg-[#f59e0b]/20 text-[#f59e0b] rounded px-[6px] py-[1px]">Draft</span>
        </div>
        <div className="flex items-center gap-[8px]">
          <div className="flex items-center gap-[8px] bg-[#2A2A2A] border border-[#333333] rounded-[8px] px-[12px] py-[6px] w-[260px]">
            <Search size={14} className="text-text-tertiary shrink-0" />
            <span className="text-[13px] text-text-tertiary">Search components, variables, or logic</span>
            <kbd className="ml-auto text-[10px] text-text-tertiary bg-[#333333] rounded px-[5px] py-[1px]">\u2318K</kbd>
          </div>
          <div className="flex items-center -space-x-[6px] ml-[4px]">
            <Avatar initials="AM" bg="bg-[#7c3aed]" size={28} border />
            <Avatar initials="JD" bg="bg-[#06b6d4]" size={28} border />
          </div>
          <button className="flex items-center gap-[6px] text-[13px] text-text-primary px-[12px] py-[6px] rounded-[8px] border border-[#333333] hover:bg-[#333333] transition-colors ml-[4px]">
            <Play size={13} /> Test Run
          </button>
          <button className="flex items-center gap-[6px] text-[13px] text-white font-semibold px-[14px] py-[6px] rounded-[8px] bg-[#7c3aed] hover:bg-[#6d28d9] transition-colors">
            <Rocket size={13} /> Publish
          </button>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex min-h-0">
        {/* Library */}
        <LibrarySidebar onAddNode={handleAddNode} />

        {/* Canvas */}
        <div
          className="flex-1 overflow-auto relative"
          style={{ backgroundImage: "radial-gradient(circle, #333333 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          onClick={() => setSelectedId(null)}
        >
          <div className="relative" style={{ width: canvasW, height: canvasH, minWidth: "100%", minHeight: "100%", transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
            {/* SVG edges */}
            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
              {edgePaths.map((ep) => (
                <path key={ep.key} d={ep.d} fill="none" stroke="#4caf50" strokeWidth="2" strokeOpacity="0.6" />
              ))}
            </svg>
            {/* Nodes */}
            {nodes.map((n) => (
              <WorkflowNode
                key={n.id}
                node={n}
                selected={selectedId === n.id}
                onSelect={setSelectedId}
                onMouseDown={handleMouseDown}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Zoom toolbar */}
          <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 flex items-center gap-[4px] bg-[#2A2A2A] border border-[#333333] rounded-[10px] px-[6px] py-[4px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] z-30">
            <div className="flex items-center gap-[4px] px-[8px] py-[4px] rounded-[6px] bg-[#333333] text-[12px] text-text-primary">
              <Search size={12} /> {zoom}%
            </div>
            <div className="w-px h-[20px] bg-[#333333]" />
            <button onClick={() => setSelectedId(null)} className="p-[6px] rounded-[6px] hover:bg-[#333333] text-text-tertiary hover:text-text-primary transition-colors">
              <MousePointer2 size={14} />
            </button>
            <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="p-[6px] rounded-[6px] hover:bg-[#333333] text-text-tertiary hover:text-text-primary transition-colors">
              <Plus size={14} />
            </button>
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="p-[6px] rounded-[6px] hover:bg-[#333333] text-text-tertiary hover:text-text-primary transition-colors">
              <ZoomIn size={14} />
            </button>
            <button onClick={() => setZoom(100)} className="p-[6px] rounded-[6px] hover:bg-[#333333] text-text-tertiary hover:text-text-primary transition-colors">
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        {/* Inspector */}
        {selectedNode && (
          <NodeInspector
            node={selectedNode}
            onClose={() => setSelectedId(null)}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}
