import { useState, useRef, useCallback } from "react";
import {
  ChevronDown,
  Plus,
  X,
  SlidersHorizontal,
  Star,
  SignalLow,
  Layers,
  Ban,
  ExternalLink,
  Code2,
  Eye,
  RefreshCw,
  Maximize2,
  Minimize2,
  Sparkles,
  FileText,
} from "lucide-react";
import { IssueStatusIcon, Avatar, GROUP_STYLES, LabelDot, PriorityBadge } from "../components/shared";
import { ISSUES, getUserById, getIssuesByStatus } from "../data/store";

function IssueRow({ issue, selected, onSelect }) {
  const assignee = issue.assignee ? getUserById(issue.assignee) : null;
  return (
    <div
      onClick={() => onSelect(issue.id)}
      className={`flex items-start gap-3 px-4 pt-[8px] hover:bg-hover cursor-pointer min-h-[36px] ${selected ? "bg-hover" : ""}`}
    >
      <div className="mt-[3px] shrink-0">
        <IssueStatusIcon variant={issue.variant} size={16} />
      </div>
      <div className="flex-1 min-w-0 pb-[8px] border-b border-divider">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-text-primary leading-[1.4] truncate">{issue.title}</span>
          <div className="shrink-0 ml-auto flex items-center gap-[8px]">
            {issue.labels?.map((l) => <LabelDot key={l} label={l} />)}
            <PriorityBadge priority={issue.priority} />
            {assignee && <Avatar initials={assignee.initials} bg={assignee.bg} size={20} />}
          </div>
        </div>
        {(issue.subIssues || issue.blockedBy) && (
          <div className="flex items-center gap-2 mt-[3px]">
            {issue.subIssues && (
              <span className="inline-flex items-center gap-1 text-[12px] text-text-primary bg-surface-chip rounded-[4px] px-[6px] py-[2px]">
                <Layers size={12} strokeWidth={1.75} className="text-text-primary" />
                <span>Sub-Issue</span>
                <span className="font-medium">{issue.subIssues}</span>
                <ChevronDown size={11} className="text-text-primary" />
              </span>
            )}
            {issue.blockedBy && (
              <span className="inline-flex items-center gap-1 text-[12px] text-text-primary bg-surface-chip rounded-[4px] px-[6px] py-[2px]">
                <Ban size={12} strokeWidth={2} className="text-text-primary" />
                <span>Blocked by</span>
                <ChevronDown size={11} className="text-text-primary" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusGroup({ type, issues, first, selectedIssue, onSelectIssue }) {
  const g = GROUP_STYLES[type];
  if (!g || issues.length === 0) return null;
  return (
    <div className={first ? "mt-1" : "mt-[16px]"}>
      <div className="flex items-center gap-[4px] px-4 py-[6px]">
        <div className={`inline-flex items-center gap-[6px] ${g.pillBg} ${g.pillText} rounded-full pl-[10px] pr-3 py-[8px]`}>
          <IssueStatusIcon variant={type} size={15} color="currentColor" />
          <span className="text-[15px] font-normal leading-none" style={{ letterSpacing: '0.03em' }}>{g.label}</span>
        </div>
        <span className="text-[13px] text-text-secondary tabular-nums bg-surface-muted rounded-full px-[8px] py-[8px] leading-none">{issues.length}</span>
        <button className="text-text-primary" aria-label={`Add ${g.label} issue`}>
          <Plus size={16} strokeWidth={1.75} />
        </button>
      </div>
      {issues.map((issue) => (
        <IssueRow key={issue.id} issue={issue} selected={selectedIssue === issue.id} onSelect={onSelectIssue} />
      ))}
    </div>
  );
}

const ARTIFACT_TABS = [
  { id: "preview", label: "Preview", icon: Eye },
  { id: "code", label: "Code", icon: Code2 },
  { id: "casestudy", label: "Case Study", icon: FileText },
];

function ArtifactPanel({ expanded, onToggleExpand }) {
  const [activeTab, setActiveTab] = useState("preview");
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className={`flex flex-col h-full bg-surface-card border-l border-divider transition-all duration-300 ease-out ${expanded ? "w-full" : ""}`}>
      {/* Artifact header */}
      <div className="flex items-center justify-between px-[14px] h-[44px] border-b border-divider shrink-0">
        <div className="flex items-center gap-[8px]">
          <Sparkles size={14} className="text-accent" />
          <span className="text-[13px] font-medium text-text-primary">Artifact</span>
          <span className="text-[11px] text-text-tertiary bg-surface-pill rounded-[4px] px-[6px] py-[1px]">Live</span>
        </div>
        <div className="flex items-center gap-[2px]">
          <button
            onClick={handleRefresh}
            className="p-[5px] rounded-md hover:bg-surface-pill text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Refresh artifact"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <a
            href="http://ventryl-app.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="p-[5px] rounded-md hover:bg-surface-pill text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Open in new tab"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={onToggleExpand}
            className="p-[5px] rounded-md hover:bg-surface-pill text-text-tertiary hover:text-text-primary transition-colors"
            aria-label={expanded ? "Minimize artifact" : "Maximize artifact"}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Artifact tabs */}
      <div className="flex items-center gap-[2px] px-[10px] pt-[6px] pb-[4px] border-b border-divider shrink-0">
        {ARTIFACT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-[5px] px-[10px] py-[5px] rounded-[6px] text-[12px] transition-colors ${
              activeTab === tab.id
                ? "bg-surface-pill text-text-primary font-medium"
                : "text-text-secondary hover:text-text-primary hover:bg-hover"
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Artifact content */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === "preview" && (
          <iframe
            src="http://ventryl-app.vercel.app"
            title="Ventryl App"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}

        {activeTab === "code" && (
          <div className="p-[16px] overflow-y-auto h-full">
            <pre className="text-[12px] font-mono text-text-secondary leading-[1.6] whitespace-pre-wrap">
{`export default function VentrylApp() {
  return (
    <iframe
      src="http://ventryl-app.vercel.app"
      title="Ventryl App"
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin
               allow-forms allow-popups"
    />
  );
}`}
            </pre>
          </div>
        )}

        {activeTab === "casestudy" && (
          <div className="p-[24px] overflow-y-auto h-full">
            <article className="max-w-[720px] mx-auto">
              {/* Header */}
              <div className="mb-[32px]">
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <span className="text-[11px] font-medium text-accent bg-[#e8eaf6] dark:bg-[#2a2d4a] rounded-[4px] px-[8px] py-[3px] uppercase tracking-wider">PRD</span>
                  <span className="text-[11px] text-text-tertiary">Draft / Phase 1 Planning</span>
                </div>
                <h1 className="text-[22px] font-semibold text-text-primary tracking-tight leading-[1.3] mb-[8px]">
                  Data-Dense REST API Client
                </h1>
                <p className="text-[13px] text-text-tertiary">July 13, 2026 &middot; Desktop (macOS, Windows, Linux)</p>
              </div>

              {/* 1. Executive Summary */}
              <section className="mb-[28px]">
                <h2 className="text-[14px] font-semibold text-text-primary mb-[8px] flex items-center gap-[8px]">
                  <span className="text-[11px] font-mono text-text-tertiary bg-surface-muted rounded px-[6px] py-[2px]">01</span>
                  Executive Summary &amp; Product Vision
                </h2>
                <p className="text-[13px] text-text-secondary leading-[1.65]">
                  This document outlines the development of a high-performance, local-first API client explicitly optimized for REST architectures. The application aims to solve the problem of fragmented and whitespace-heavy UI in modern API tools. The core philosophy is <strong className="text-text-primary">data density</strong>—allowing developers to simultaneously monitor request parameters, raw JSON payloads, complex response headers, and execution telemetry within a single, highly structured view, minimizing the need for tab-switching or scrolling.
                </p>
              </section>

              {/* 2. Target Audience */}
              <section className="mb-[28px]">
                <h2 className="text-[14px] font-semibold text-text-primary mb-[8px] flex items-center gap-[8px]">
                  <span className="text-[11px] font-mono text-text-tertiary bg-surface-muted rounded px-[6px] py-[2px]">02</span>
                  Target Audience &amp; Primary Use Cases
                </h2>
                <div className="space-y-[8px] mb-[12px]">
                  <div className="flex items-start gap-[10px] bg-surface rounded-[8px] p-[12px] border border-divider">
                    <span className="text-[11px] font-semibold text-accent bg-[#e8eaf6] dark:bg-[#2a2d4a] rounded px-[6px] py-[2px] shrink-0 mt-[1px]">BE</span>
                    <div>
                      <span className="text-[13px] font-medium text-text-primary">Backend Engineers</span>
                      <p className="text-[12px] text-text-secondary mt-[2px]">Developing, testing, and debugging RESTful services locally.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[10px] bg-surface rounded-[8px] p-[12px] border border-divider">
                    <span className="text-[11px] font-semibold text-[#e65100] bg-[#fff3e0] dark:bg-[#3e2a10] rounded px-[6px] py-[2px] shrink-0 mt-[1px]">FE</span>
                    <div>
                      <span className="text-[13px] font-medium text-text-primary">Frontend Engineers</span>
                      <p className="text-[12px] text-text-secondary mt-[2px]">Exploring API payloads to map UI components to data structures.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-[10px] bg-surface rounded-[8px] p-[12px] border border-divider">
                    <span className="text-[11px] font-semibold text-[#2e7d32] bg-[#e8f5e9] dark:bg-[#1b3a1e] rounded px-[6px] py-[2px] shrink-0 mt-[1px]">QA</span>
                    <div>
                      <span className="text-[13px] font-medium text-text-primary">QA/Automation Engineers</span>
                      <p className="text-[12px] text-text-secondary mt-[2px]">Validating endpoint responses, status codes, and data types.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-card border border-divider rounded-[8px] p-[14px]">
                  <span className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-[6px] block">Core Use Case</span>
                  <p className="text-[13px] text-text-secondary leading-[1.65]">
                    A developer building the backend for a savings application needs to execute a <code className="text-[12px] font-mono bg-surface-muted text-accent rounded px-[4px] py-[1px]">POST</code> request to create a user profile, immediately capture the <code className="text-[12px] font-mono bg-surface-muted text-accent rounded px-[4px] py-[1px]">user_id</code>, pass it into a <code className="text-[12px] font-mono bg-surface-muted text-accent rounded px-[4px] py-[1px]">POST</code> to fund the account, and finally run a <code className="text-[12px] font-mono bg-surface-muted text-accent rounded px-[4px] py-[1px]">GET</code> to verify the calculated interest yield. The tool must facilitate this workflow with zero friction.
                  </p>
                </div>
              </section>

              {/* 3. Design & UX Principles */}
              <section className="mb-[28px]">
                <h2 className="text-[14px] font-semibold text-text-primary mb-[8px] flex items-center gap-[8px]">
                  <span className="text-[11px] font-mono text-text-tertiary bg-surface-muted rounded px-[6px] py-[2px]">03</span>
                  Design &amp; UX Principles
                </h2>
                <div className="space-y-[6px]">
                  {[
                    { title: "Maximum Screen Utility", desc: "Customizable, resizable multi-pane layout (Sidebar 15%, Request Builder 40%, Response Viewer 45%). Compact typography with monospace for data, sans-serif for UI, and minimal padding." },
                    { title: "Inline Intelligence", desc: "Surfaces critical metadata without user action. Inactive request tabs display the last executed status code (green dot for 200, red for 500) and latency sparklines directly on the tab header." },
                    { title: "Keyboard-First Operation", desc: "Every core action mapped to customizable keyboard shortcuts. Global Command Palette accessible via Cmd/Ctrl + K." },
                    { title: "Local-First Execution", desc: "Collections, environments, and history saved directly to local file system. Instant launch, fully functional offline." },
                  ].map((p) => (
                    <div key={p.title} className="flex items-start gap-[10px] py-[10px] border-b border-divider last:border-0">
                      <div className="w-[6px] h-[6px] rounded-full bg-accent mt-[6px] shrink-0"></div>
                      <div>
                        <span className="text-[13px] font-medium text-text-primary">{p.title}</span>
                        <p className="text-[12px] text-text-secondary leading-[1.6] mt-[2px]">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 4. Functional Requirements */}
              <section className="mb-[28px]">
                <h2 className="text-[14px] font-semibold text-text-primary mb-[8px] flex items-center gap-[8px]">
                  <span className="text-[11px] font-mono text-text-tertiary bg-surface-muted rounded px-[6px] py-[2px]">04</span>
                  Functional Requirements — Phase 1
                </h2>
                <p className="text-[13px] text-text-secondary leading-[1.65] mb-[16px]">
                  The objective of Phase 1 is to establish a stable application shell and the core execution engine capable of handling standard REST workflows.
                </p>

                {/* Application Shell */}
                <div className="mb-[16px]">
                  <h3 className="text-[13px] font-semibold text-text-primary mb-[8px]">Application Shell</h3>
                  <div className="bg-surface border border-divider rounded-[8px] p-[12px] space-y-[6px]">
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Resizable three-pane layout: Navigation (Left), Request Configuration (Center), Response Data (Right).</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Persisted window state (tabs, window size, and pane split ratios restore exactly as left on app restart).</p>
                    </div>
                  </div>
                </div>

                {/* Workspace Hierarchy */}
                <div className="mb-[16px]">
                  <h3 className="text-[13px] font-semibold text-text-primary mb-[8px]">Workspace Hierarchy</h3>
                  <div className="bg-surface border border-divider rounded-[8px] p-[12px] space-y-[6px]">
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Support for top-level Spaces (e.g., "Personal Projects", "Client Work").</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Infinite nesting of Collections and Folders (e.g., Savings App API &gt; User Management &gt; Authentication).</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Drag-and-drop reordering of all sidebar elements.</p>
                    </div>
                  </div>
                </div>

                {/* Request Builder */}
                <div className="mb-[16px]">
                  <h3 className="text-[13px] font-semibold text-text-primary mb-[8px]">Request Builder</h3>
                  <div className="bg-surface border border-divider rounded-[8px] p-[12px] space-y-[6px]">
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Support for standard HTTP verbs: <span className="font-mono text-accent">GET</span>, <span className="font-mono text-accent">POST</span>, <span className="font-mono text-accent">PUT</span>, <span className="font-mono text-accent">PATCH</span>, <span className="font-mono text-accent">DELETE</span>, <span className="font-mono text-accent">OPTIONS</span>, <span className="font-mono text-accent">HEAD</span>.</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Dedicated tabs for: Query Params, Headers, Auth, Body, and Pre/Post Request Scripts.</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Auth support: No Auth, Bearer Token, Basic Auth, API Key (Header/Query).</p>
                    </div>
                  </div>
                </div>

                {/* Body Editor */}
                <div className="mb-[16px]">
                  <h3 className="text-[13px] font-semibold text-text-primary mb-[8px]">Body Editor</h3>
                  <div className="bg-surface border border-divider rounded-[8px] p-[12px] space-y-[6px]">
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Integration of Monaco Editor for the request body.</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Syntax highlighting for JSON, XML, HTML, and plain text.</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Auto-closing brackets, quotes, and intelligent indentation.</p>
                    </div>
                  </div>
                </div>

                {/* Environment Variables */}
                <div className="mb-[16px]">
                  <h3 className="text-[13px] font-semibold text-text-primary mb-[8px]">Environment Variables</h3>
                  <div className="bg-surface border border-divider rounded-[8px] p-[12px] space-y-[6px]">
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Global and Workspace-level environments.</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Syntax for interpolation: <code className="font-mono text-accent bg-surface-muted rounded px-[4px] py-[1px]">{"{{variable_name}}"}</code> in URLs, headers, and body payloads.</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Secure storage for secrets (passwords, tokens) that are masked in the UI.</p>
                    </div>
                  </div>
                </div>

                {/* Response Viewer */}
                <div className="mb-[16px]">
                  <h3 className="text-[13px] font-semibold text-text-primary mb-[8px]">Response Viewer</h3>
                  <div className="bg-surface border border-divider rounded-[8px] p-[12px] space-y-[6px]">
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Split-pane view separating Headers and Body.</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">HTTP status code prominently displayed with standard color coding (<span className="text-[#4caf50]">2xx Green</span>, <span className="text-accent">3xx Blue</span>, <span className="text-[#f59e0b]">4xx Yellow</span>, <span className="text-[#e53935]">5xx Red</span>).</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Execution metrics (Time in ms, Size in KB/MB) displayed inline.</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-text-tertiary mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Expandable/collapsible JSON tree view.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Non-Functional Requirements */}
              <section className="mb-[28px]">
                <h2 className="text-[14px] font-semibold text-text-primary mb-[8px] flex items-center gap-[8px]">
                  <span className="text-[11px] font-mono text-text-tertiary bg-surface-muted rounded px-[6px] py-[2px]">05</span>
                  Non-Functional Requirements
                </h2>

                {/* Performance */}
                <div className="mb-[16px]">
                  <h3 className="text-[13px] font-semibold text-text-primary mb-[8px]">Performance</h3>
                  <div className="bg-surface border border-divider rounded-[8px] p-[12px] space-y-[6px]">
                    {[
                      { metric: "Cold Start", target: "< 1.5s", desc: "Application launch time from cold start must be under 1.5 seconds." },
                      { metric: "Large Payloads", target: "50MB", desc: "UI must remain responsive (main thread unblocked) when rendering JSON payloads up to 50MB." },
                      { metric: "Tab Switch", target: "< 50ms", desc: "Switching between tabs or spaces must happen in under 50 milliseconds." },
                    ].map((p) => (
                      <div key={p.metric} className="flex items-start gap-[10px] py-[6px] border-b border-divider last:border-0">
                        <span className="text-[10px] font-mono font-semibold text-accent bg-[#e8eaf6] dark:bg-[#2a2d4a] rounded px-[6px] py-[2px] shrink-0 mt-[1px]">{p.target}</span>
                        <div>
                          <span className="text-[12px] font-medium text-text-primary">{p.metric}</span>
                          <p className="text-[11px] text-text-secondary leading-[1.5] mt-[1px]">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <div className="mb-[16px]">
                  <h3 className="text-[13px] font-semibold text-text-primary mb-[8px]">Security</h3>
                  <div className="bg-surface border border-divider rounded-[8px] p-[12px] space-y-[6px]">
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-[#e53935] mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">No automatic telemetry or data collection of request payloads or headers.</p>
                    </div>
                    <div className="flex items-start gap-[8px]">
                      <div className="w-[4px] h-[4px] rounded-full bg-[#e53935] mt-[7px] shrink-0"></div>
                      <p className="text-[12px] text-text-secondary leading-[1.6]">Environment variables marked as "Secret" must be <strong className="text-text-primary">encrypted at rest</strong> on the local file system.</p>
                    </div>
                  </div>
                </div>

                {/* Architecture */}
                <div className="mb-[16px]">
                  <h3 className="text-[13px] font-semibold text-text-primary mb-[8px]">Architecture</h3>
                  <div className="bg-surface border border-divider rounded-[8px] overflow-hidden">
                    <div className="flex items-center gap-[10px] px-[12px] py-[10px] border-b border-divider">
                      <span className="text-[11px] font-mono font-semibold text-[#e65100] bg-[#fff3e0] dark:bg-[#3e2a10] rounded px-[6px] py-[2px] shrink-0">Tauri</span>
                      <p className="text-[12px] text-text-secondary">Rust backend for OS-level I/O and networking, React/Svelte frontend for UI state.</p>
                    </div>
                    <div className="flex items-center gap-[10px] px-[12px] py-[10px]">
                      <span className="text-[11px] font-mono font-semibold text-accent bg-[#e8eaf6] dark:bg-[#2a2d4a] rounded px-[6px] py-[2px] shrink-0">SQLite</span>
                      <p className="text-[12px] text-text-secondary">Local storage driven by SQLite for high-speed historical querying.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. Success Metrics & Telemetry */}
              <section className="mb-[28px]">
                <h2 className="text-[14px] font-semibold text-text-primary mb-[8px] flex items-center gap-[8px]">
                  <span className="text-[11px] font-mono text-text-tertiary bg-surface-muted rounded px-[6px] py-[2px]">06</span>
                  Success Metrics &amp; Telemetry
                  <span className="text-[10px] font-normal text-[#4caf50] bg-[#e8f5e9] dark:bg-[#1b3a1e] rounded px-[6px] py-[1px]">Opt-in</span>
                </h2>
                <div className="space-y-[6px]">
                  {[
                    { label: "Engagement", metric: "Avg requests / session", desc: "Average number of requests sent per session." },
                    { label: "Feature Adoption", metric: "Env Vars & Cmd Palette %", desc: "Percentage of users utilizing Environment Variables and the Command Palette." },
                    { label: "Performance", metric: "Render time > 10MB", desc: "Average time taken to render payloads larger than 10MB." },
                    { label: "AI Utility", metric: "Fix acceptance rate", desc: "Acceptance rate of AI-suggested payload fixes or generated mock data." },
                  ].map((m) => (
                    <div key={m.label} className="flex items-start gap-[10px] bg-surface-card border border-divider rounded-[8px] p-[12px]">
                      <div className="shrink-0 w-[80px]">
                        <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">{m.label}</span>
                      </div>
                      <div>
                        <span className="text-[12px] font-medium text-text-primary">{m.metric}</span>
                        <p className="text-[11px] text-text-secondary leading-[1.5] mt-[1px]">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 7. Explicit Non-Goals */}
              <section className="mb-[28px]">
                <h2 className="text-[14px] font-semibold text-text-primary mb-[8px] flex items-center gap-[8px]">
                  <span className="text-[11px] font-mono text-text-tertiary bg-surface-muted rounded px-[6px] py-[2px]">07</span>
                  Explicit Non-Goals
                  <span className="text-[10px] font-normal text-[#e53935] bg-[#fbe9e7] dark:bg-[#3e1a18] rounded px-[6px] py-[1px]">Out of Scope</span>
                </h2>
                <div className="bg-surface border border-divider rounded-[8px] p-[12px] space-y-[8px]">
                  {[
                    { item: "Cloud synchronization", reason: "Maintain strict local-first architecture for the initial launch." },
                    { item: "Real-time collaborative editing", reason: "Multiplayer cursors and shared sessions are out of scope." },
                    { item: "GraphQL, gRPC, or WebSocket protocols", reason: "Strict focus on REST optimization first." },
                  ].map((n) => (
                    <div key={n.item} className="flex items-start gap-[8px] py-[4px] border-b border-divider last:border-0">
                      <div className="w-[16px] h-[16px] rounded-[4px] bg-[#fbe9e7] dark:bg-[#3e1a18] flex items-center justify-center shrink-0 mt-[1px]">
                        <span className="text-[10px] text-[#e53935]">✕</span>
                      </div>
                      <div>
                        <span className="text-[12px] font-medium text-text-primary">{n.item}</span>
                        <p className="text-[11px] text-text-secondary leading-[1.5] mt-[1px]">{n.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Footer */}
              <div className="border-t border-divider pt-[16px] mt-[32px]">
                <p className="text-[11px] text-text-tertiary text-center">
                  Product Requirements Document &middot; Data-Dense REST API Client &middot; v1.0 Draft &middot; July 13, 2026
                </p>
              </div>
            </article>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-surface/80 flex items-center justify-center">
            <div className="flex items-center gap-[8px] text-[13px] text-text-secondary">
              <RefreshCw size={16} className="animate-spin text-accent" />
              <span>Refreshing artifact...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlatformIssues() {
  const platIssues = ISSUES.filter((i) => i.team === "t2");
  const groups = ["inProgress", "todo", "backlog", "done"];
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [artifactExpanded, setArtifactExpanded] = useState(false);
  const [artifactPercent, setArtifactPercent] = useState(70);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = 100 - (x / rect.width) * 100;
      setArtifactPercent(Math.min(90, Math.max(30, percent)));
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  const issuesPercent = artifactExpanded ? 0 : 100 - artifactPercent;

  return (
    <div ref={containerRef} className="flex h-full">
      {/* Issues list */}
      <div
        className={`flex flex-col min-w-0 overflow-hidden transition-opacity duration-300 ease-out ${artifactExpanded ? "opacity-0" : "opacity-100"}`}
        style={{ width: `${issuesPercent}%` }}
      >
        {/* Filter bar */}
        <div className="bg-surface shrink-0">
          <div className="flex items-center gap-[12px] px-4 pt-[24px] pb-[8px]">
            <button className="inline-flex items-center gap-[6px] text-[13px] text-text-primary transition-colors bg-surface-card rounded-md px-[10px] py-[5px]">
              <SlidersHorizontal size={15} strokeWidth={1.75} className="text-text-primary" />
              <span className="font-medium">Filter</span>
            </button>
            <div className="w-px h-[18px] bg-divider"></div>
            <div className="flex items-center">
              <Avatar initials="MR" bg="bg-[#e65100]" size={24} border />
              <div className="-ml-[6px]"><Avatar initials="FB" bg="bg-[#5c6bc0]" size={24} border /></div>
            </div>
          </div>
          <div className="flex items-center gap-[8px] px-4 pb-[10px]">
            <Star size={14} strokeWidth={2} className="text-[#ffb300] fill-[#ffb300] shrink-0" />
            <div className="inline-flex items-center gap-[5px] bg-surface-muted rounded-[6px] px-[8px] py-[5px] text-[12px]">
              <SignalLow size={13} strokeWidth={2} className="text-text-secondary" />
              <span className="font-medium text-text-primary">Priority</span>
              <span className="text-text-tertiary">is</span>
              <span className="font-medium text-text-primary">Urgent, High</span>
              <button className="ml-[2px] p-[1px] text-text-tertiary hover:text-text-primary rounded" aria-label="Remove priority filter">
                <X size={13} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Issue list */}
        <div className="flex-1 overflow-y-auto pb-8">
          {groups.map((g, i) => (
            <StatusGroup
              key={g}
              type={g}
              issues={getIssuesByStatus(platIssues, g)}
              first={i === 0}
              selectedIssue={selectedIssue}
              onSelectIssue={setSelectedIssue}
            />
          ))}
        </div>
      </div>

      {/* Draggable divider */}
      {!artifactExpanded && (
        <div
          onMouseDown={onMouseDown}
          className="w-[4px] shrink-0 cursor-col-resize group relative hover:bg-accent/40 transition-colors"
        >
          <div className="absolute inset-y-0 -left-[4px] -right-[4px]" />
        </div>
      )}

      {/* Artifact panel */}
      <div
        className="min-w-0 overflow-hidden"
        style={{ width: artifactExpanded ? "100%" : `${artifactPercent}%` }}
      >
        <ArtifactPanel
          expanded={artifactExpanded}
          onToggleExpand={() => setArtifactExpanded(!artifactExpanded)}
        />
      </div>
    </div>
  );
}
