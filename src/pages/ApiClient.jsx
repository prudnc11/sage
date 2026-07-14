import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Send,
  Folder,
  FileJson,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Search,
  X,
  Check,
  Clock,
  HardDrive,
  Link2,
  FileCode2,
  ToggleLeft,
  ToggleRight,
  Variable,
  Braces,
  Info,
  AlertCircle,
  CalendarDays,
  Hash,
  Type,
  List,
  Sparkles,
  Wand2,
  FlaskConical,
  Diff,
  MessageSquare,
  Command,
  ArrowRight,
  Lightbulb,
  TestTube2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

/* ── Helpers ── */
let _id = 100;
const uid = () => `_${++_id}`;

function resolveVars(str, vars) {
  if (!str) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = vars.find((e) => e.key === key);
    return v ? v.value : `{{${key}}}`;
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/* ── Initial Data ── */
const INITIAL_COLLECTIONS = [
  {
    id: "c1", name: "Savings App API", source: "openapi", schemaFile: "openapi.yaml", items: [
      {
        id: "f1", name: "User Management", type: "folder", tag: "users", items: [
          { id: "r1", name: "Create User", method: "POST", url: "{{base_url}}/api/v1/users", schema: { summary: "Create a new user profile", operationId: "createUser" } },
          { id: "r2", name: "Get User Profile", method: "GET", url: "{{base_url}}/api/v1/users/{{user_id}}", schema: { summary: "Retrieve user by ID", operationId: "getUserById" } },
          { id: "r3", name: "Update User", method: "PUT", url: "{{base_url}}/api/v1/users/{{user_id}}", schema: { summary: "Update existing user", operationId: "updateUser" } },
          { id: "r4", name: "Delete User", method: "DELETE", url: "{{base_url}}/api/v1/users/{{user_id}}", schema: { summary: "Soft-delete a user account", operationId: "deleteUser" } },
        ]
      },
      {
        id: "f2", name: "Accounts", type: "folder", tag: "accounts", items: [
          { id: "r5", name: "Fund Account", method: "POST", url: "{{base_url}}/api/v1/accounts/{{user_id}}/fund", schema: { summary: "Deposit funds into account", operationId: "fundAccount" } },
          { id: "r6", name: "Get Balance", method: "GET", url: "{{base_url}}/api/v1/accounts/{{user_id}}/balance", schema: { summary: "Retrieve current balance", operationId: "getBalance" } },
          { id: "r7", name: "Interest Yield", method: "GET", url: "{{base_url}}/api/v1/accounts/{{user_id}}/yield", schema: { summary: "Calculate interest yield projection", operationId: "getYield" } },
        ]
      },
      {
        id: "f3", name: "Authentication", type: "folder", tag: "auth", items: [
          { id: "r8", name: "Login", method: "POST", url: "{{base_url}}/api/v1/auth/login", schema: { summary: "Authenticate and get tokens", operationId: "login" } },
          { id: "r9", name: "Refresh Token", method: "POST", url: "{{base_url}}/api/v1/auth/refresh", schema: { summary: "Refresh expired access token", operationId: "refreshToken" } },
        ]
      },
    ]
  },
  {
    id: "c2", name: "Payment Gateway", items: [
      { id: "r10", name: "Initialize Payment", method: "POST", url: "{{base_url}}/api/v1/payments/init", schema: { summary: "Start payment flow", operationId: "initPayment" } },
      { id: "r11", name: "Verify Payment", method: "GET", url: "{{base_url}}/api/v1/payments/{{ref}}/verify", schema: { summary: "Verify transaction status", operationId: "verifyPayment" } },
    ]
  },
];

const ENV_VARS_INIT = [
  { key: "base_url", value: "https://jsonplaceholder.typicode.com", secret: false },
  { key: "user_id", value: "1", secret: false },
  { key: "api_key", value: "sk_live_a1b2c3d4e5f6", secret: true },
  { key: "ref", value: "pay_tx_92kd8f", secret: false },
];

const METHOD_COLORS = {
  GET: "text-[#4caf50]",
  POST: "text-[#f59e0b]",
  PUT: "text-[#5e6ad2]",
  PATCH: "text-[#ab47bc]",
  DELETE: "text-[#e53935]",
  OPTIONS: "text-[#78909c]",
  HEAD: "text-[#00acc1]",
};

/* ── Phase 2: Chain Rules (demo) ── */
const CHAIN_RULES_INIT = [
  { id: "ch1", source: "Create User", sourceReq: "r1", path: "data.user.id", targetVar: "user_id", syntax: "{{request.create_user.response.body.data.user.id}}", active: true },
  { id: "ch2", source: "Login", sourceReq: "r8", path: "data.token", targetVar: "api_key", syntax: "{{request.login.response.body.data.token}}", active: true },
  { id: "ch3", source: "Fund Account", sourceReq: "r5", path: "data.transaction_id", targetVar: "ref", syntax: "{{request.fund_account.response.body.data.transaction_id}}", active: false },
];

/* ── Phase 3: AI data ── */
const AI_MOCK_DATA = {
  "Savings App API": {
    first_name: "Chiamaka", last_name: "Eze", email: "chiamaka.eze@example.ng",
    phone: "+234 803 456 7890", tier: "premium", currency: "NGN",
    balance: 2500.50, account_type: "high_yield", interest_rate: 4.5, password: "s3cur3P@ss!",
  },
  "Payment Gateway": {
    amount: 150000, currency: "NGN", email: "customer@example.com",
    reference: "pay_tx_" + Math.random().toString(36).substring(2, 10),
    callback_url: "https://yourapp.com/payment/callback", channel: "card",
  },
};

const AI_ERROR_ANALYSIS = {
  status: 422, statusText: "Unprocessable Entity",
  error: {
    message: "Validation failed",
    errors: [
      { field: "email", message: "must be a valid email address", received: "adaeze@" },
      { field: "tier", message: "must be one of: free, basic, premium, enterprise", received: "gold" },
    ],
  },
  fixes: [
    { field: "email", current: '"adaeze@"', suggested: '"adaeze@example.com"', reason: "Missing domain in email address" },
    { field: "tier", current: '"gold"', suggested: '"premium"', reason: 'Schema enum allows: free, basic, premium, enterprise. "gold" is not valid.' },
  ],
};

const FORM_SCHEMA = [
  { key: "first_name", type: "string", label: "First Name", required: true, value: "Adaeze" },
  { key: "last_name", type: "string", label: "Last Name", required: true, value: "Obi" },
  { key: "email", type: "string", label: "Email", required: true, value: "adaeze@example.com", format: "email" },
  { key: "phone", type: "string", label: "Phone", required: false, value: "+234 812 345 6789" },
  { key: "tier", type: "enum", label: "Tier", required: true, value: "premium", options: ["free", "basic", "premium", "enterprise"] },
  { key: "interest_rate", type: "number", label: "Interest Rate (%)", required: false, value: "4.5", min: 0, max: 25, step: 0.1 },
  { key: "account_creation_date", type: "date", label: "Account Creation Date", required: false, value: "2026-07-13" },
  { key: "password", type: "password", label: "Password", required: true, value: "" },
];

/* ── Global Data Filter ── */
function GlobalFilter({ filter, setFilter }) {
  return (
    <div className="flex items-center gap-[5px] bg-surface-muted border border-divider rounded-[6px] px-[8px] py-[3px] shrink-0">
      <Search size={11} className="text-text-tertiary shrink-0" />
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter response, headers, history... (regex)"
        className="bg-transparent text-[10px] font-mono text-text-primary placeholder:text-text-tertiary outline-none w-[220px]"
      />
      {filter && (
        <button onClick={() => setFilter("")} className="text-text-tertiary hover:text-text-primary" aria-label="Clear filter">
          <X size={10} />
        </button>
      )}
    </div>
  );
}

/* ── Sidebar ── */
function ApiSidebar({ collections, selected, onSelect, filter, onAddRequest, onAddFolder, onDeleteItem, onRenameItem }) {
  const [openState, setOpenState] = useState(() => {
    const s = {};
    collections.forEach((c) => { s[c.id] = true; c.items?.forEach((f) => { if (f.type === "folder") s[f.id] = f.id === "f1"; }); });
    return s;
  });
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const toggle = (id) => setOpenState((p) => ({ ...p, [id]: !p[id] }));

  const matchesFilter = (req) => {
    if (!filter) return true;
    try {
      const re = new RegExp(filter, "i");
      return re.test(req.name) || re.test(req.method) || re.test(req.url);
    } catch { return req.name.toLowerCase().includes(filter.toLowerCase()); }
  };

  const startRename = (id, name) => {
    setEditingId(id);
    setEditName(name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      onRenameItem(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-[10px] h-[38px] shrink-0 border-b border-divider">
        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Collections</span>
        <button onClick={() => onAddFolder(collections[0]?.id)} className="p-[3px] rounded hover:bg-hover text-text-tertiary hover:text-text-primary" aria-label="New folder">
          <Plus size={13} />
        </button>
      </div>

      <div className="px-[8px] py-[6px] border-b border-divider">
        <div className="flex items-center gap-[5px] bg-surface-muted rounded-[6px] px-[8px] py-[4px]">
          <Search size={12} className="text-text-tertiary shrink-0" />
          <input placeholder="Filter requests..." className="bg-transparent text-[11px] text-text-primary placeholder:text-text-tertiary outline-none w-full" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-[4px]">
        {collections.map((col) => (
          <div key={col.id}>
            <div onClick={() => toggle(col.id)} className="flex items-center gap-[4px] px-[8px] py-[4px] cursor-pointer hover:bg-hover group">
              {openState[col.id] ? <ChevronDown size={12} className="text-text-tertiary shrink-0" /> : <ChevronRight size={12} className="text-text-tertiary shrink-0" />}
              <Folder size={12} className="text-text-tertiary shrink-0" />
              <span className="text-[11px] font-medium text-text-primary truncate">{col.name}</span>
              {col.source === "openapi" && (
                <span className="ml-auto text-[8px] font-mono text-accent bg-[#e8eaf6] dark:bg-[#2a2d4a] rounded px-[4px] py-[1px] shrink-0">OAS</span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onAddRequest(col.id); }}
                className="p-[2px] rounded hover:bg-surface-pill text-text-tertiary opacity-0 group-hover:opacity-100 ml-auto shrink-0"
                aria-label="Add request"
              >
                <Plus size={11} />
              </button>
            </div>
            {openState[col.id] && col.items?.map((item) => {
              if (item.type === "folder") {
                const filtered = item.items?.filter(matchesFilter) || [];
                if (filter && filtered.length === 0) return null;
                return (
                  <div key={item.id}>
                    <div className="flex items-center gap-[4px] pl-[22px] pr-[8px] py-[3px] cursor-pointer hover:bg-hover group">
                      <div onClick={() => toggle(item.id)} className="flex items-center gap-[4px] flex-1 min-w-0">
                        {openState[item.id] ? <ChevronDown size={11} className="text-text-tertiary shrink-0" /> : <ChevronRight size={11} className="text-text-tertiary shrink-0" />}
                        <Folder size={11} className="text-text-tertiary shrink-0" />
                        {editingId === item.id ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(e) => e.key === "Enter" && commitRename()}
                            className="text-[11px] text-text-primary bg-surface-muted border border-accent rounded px-[4px] py-[1px] outline-none w-full"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="text-[11px] text-text-secondary truncate"
                            onDoubleClick={(e) => { e.stopPropagation(); startRename(item.id, item.name); }}
                          >{item.name}</span>
                        )}
                      </div>
                      {item.tag && <span className="text-[8px] text-text-tertiary font-mono shrink-0">{item.tag}</span>}
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddRequest(col.id, item.id); }}
                        className="p-[1px] rounded hover:bg-surface-pill text-text-tertiary opacity-0 group-hover:opacity-100 shrink-0"
                        aria-label="Add request to folder"
                      >
                        <Plus size={10} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteItem(col.id, item.id); }}
                        className="p-[1px] rounded hover:bg-surface-pill text-text-tertiary opacity-0 group-hover:opacity-100 shrink-0"
                        aria-label="Delete folder"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                    {openState[item.id] && filtered.map((req) => (
                      <RequestItem key={req.id} req={req} selected={selected} onSelect={onSelect} depth={36} onDelete={() => onDeleteItem(col.id, req.id, item.id)} onRename={(name) => onRenameItem(req.id, name)} />
                    ))}
                  </div>
                );
              }
              if (!matchesFilter(item)) return null;
              return <RequestItem key={item.id} req={item} selected={selected} onSelect={onSelect} depth={22} onDelete={() => onDeleteItem(col.id, item.id)} onRename={(name) => onRenameItem(item.id, name)} />;
            })}
          </div>
        ))}
      </div>

      {/* OpenAPI schema watch indicator */}
      <div className="px-[8px] py-[4px] border-t border-divider">
        <div className="flex items-center gap-[5px] bg-surface-muted rounded-[5px] px-[8px] py-[3px]">
          <FileCode2 size={10} className="text-accent shrink-0" />
          <span className="text-[9px] font-mono text-text-secondary truncate">watching openapi.yaml</span>
          <div className="w-[5px] h-[5px] rounded-full bg-[#4caf50] animate-pulse ml-auto shrink-0" />
        </div>
      </div>

      {/* Env selector */}
      <div className="px-[8px] py-[6px] border-t border-divider">
        <div className="flex items-center gap-[5px] bg-[#e8f5e9] dark:bg-[#1b3a1e] rounded-[5px] px-[8px] py-[4px]">
          <Globe size={11} className="text-[#4caf50] shrink-0" />
          <span className="text-[11px] font-medium text-[#2e7d32] dark:text-[#81c784]">Production</span>
          <ChevronDown size={11} className="text-[#4caf50] ml-auto" />
        </div>
      </div>
    </div>
  );
}

function RequestItem({ req, selected, onSelect, depth, onDelete, onRename }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(req.name);

  const commitRename = () => {
    if (name.trim()) onRename(name.trim());
    setEditing(false);
  };

  return (
    <div
      onClick={() => !editing && onSelect(req)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`flex items-center gap-[6px] pr-[8px] py-[3px] cursor-pointer text-[11px] relative group ${selected?.id === req.id ? "bg-surface-active" : "hover:bg-hover"}`}
      style={{ paddingLeft: depth }}
    >
      <span className={`font-mono font-semibold shrink-0 text-[9px] w-[32px] ${METHOD_COLORS[req.method]}`}>{req.method}</span>
      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => e.key === "Enter" && commitRename()}
          className="flex-1 text-[11px] text-text-primary bg-surface-muted border border-accent rounded px-[4px] py-[1px] outline-none"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="text-text-primary truncate flex-1"
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
        >{req.name}</span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-[1px] rounded text-text-tertiary hover:text-[#e53935] opacity-0 group-hover:opacity-100 shrink-0"
        aria-label="Delete request"
      >
        <Trash2 size={10} />
      </button>
      {showTooltip && req.schema && !editing && (
        <div className="absolute left-full top-0 ml-[4px] z-30 bg-surface-card border border-divider rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.15)] p-[8px] w-[200px]">
          <div className="text-[10px] font-medium text-text-primary mb-[2px]">{req.schema.operationId}</div>
          <div className="text-[9px] text-text-secondary">{req.schema.summary}</div>
        </div>
      )}
    </div>
  );
}

/* ── Request Builder ── */
const REQ_TABS = ["Params", "Headers", "Auth", "Body", "Chain"];

function RequestBuilder({ method, setMethod, url, setUrl, headers, setHeaders, params, setParams, body, setBody, authType, setAuthType, authToken, setAuthToken, onSend, sending, envVars, setEnvVars, chainRules, setChainRules }) {
  const [activeTab, setActiveTab] = useState("Body");
  const [bodyView, setBodyView] = useState("json");

  return (
    <div className="flex flex-col h-full">
      {/* URL bar */}
      <div className="flex items-center gap-[6px] px-[10px] py-[6px] border-b border-divider shrink-0">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className={`font-mono font-semibold text-[11px] bg-surface-muted border border-divider rounded-[5px] px-[6px] py-[4px] outline-none ${METHOD_COLORS[method]}`}
        >
          {Object.keys(METHOD_COLORS).map((m) => <option key={m} value={m} className="text-text-primary">{m}</option>)}
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          className="flex-1 bg-surface-muted border border-divider rounded-[5px] px-[8px] py-[4px] text-[11px] font-mono text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent"
          placeholder="Enter request URL or paste a curl..."
        />
        <button
          onClick={onSend}
          disabled={sending}
          className="inline-flex items-center gap-[4px] bg-accent text-white rounded-[5px] px-[10px] py-[4px] text-[11px] font-semibold hover:opacity-90 shrink-0 disabled:opacity-60"
        >
          {sending ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-[1px] px-[8px] pt-[4px] border-b border-divider shrink-0">
        {REQ_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-[10px] py-[5px] text-[11px] rounded-t-[5px] transition-colors ${activeTab === t ? "bg-surface-card text-text-primary font-medium border border-divider border-b-surface-card -mb-px" : "text-text-secondary hover:text-text-primary"}`}
          >
            {t}
            {t === "Headers" && <span className="ml-[4px] text-[9px] text-text-tertiary bg-surface-muted rounded-full px-[5px] py-[1px]">{headers.filter(h => h.enabled).length}</span>}
            {t === "Params" && <span className="ml-[4px] text-[9px] text-text-tertiary bg-surface-muted rounded-full px-[5px] py-[1px]">{params.filter(p => p.enabled).length}</span>}
            {t === "Chain" && <span className="ml-[4px] text-[9px] text-accent bg-[#e8eaf6] dark:bg-[#2a2d4a] rounded-full px-[5px] py-[1px]">{chainRules.filter(c => c.active).length}</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "Params" && <KeyValueTable rows={params} setRows={setParams} />}
        {activeTab === "Headers" && <KeyValueTable rows={headers} setRows={setHeaders} />}
        {activeTab === "Auth" && <AuthTab authType={authType} setAuthType={setAuthType} authToken={authToken} setAuthToken={setAuthToken} />}
        {activeTab === "Body" && (
          <BodyTab body={body} setBody={setBody} bodyView={bodyView} setBodyView={setBodyView} />
        )}
        {activeTab === "Chain" && <ChainTab chainRules={chainRules} setChainRules={setChainRules} envVars={envVars} setEnvVars={setEnvVars} />}
      </div>
    </div>
  );
}

function KeyValueTable({ rows, setRows }) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const updateRow = (index, field, value) => {
    setRows((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const toggleRow = (index) => {
    setRows((prev) => prev.map((r, i) => i === index ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    if (!newKey.trim()) return;
    setRows((prev) => [...prev, { key: newKey.trim(), value: newValue, enabled: true }]);
    setNewKey("");
    setNewValue("");
  };

  return (
    <div className="text-[11px]">
      <div className="flex items-center border-b border-divider bg-surface-muted px-[10px] py-[4px] text-text-tertiary font-medium">
        <span className="w-[24px] shrink-0"></span>
        <span className="flex-1">Key</span>
        <span className="flex-1">Value</span>
        <span className="w-[28px] shrink-0"></span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex items-center border-b border-divider px-[10px] py-[3px] hover:bg-hover group">
          <div className="w-[24px] shrink-0 flex items-center">
            <button
              onClick={() => toggleRow(i)}
              className={`w-[12px] h-[12px] rounded-[3px] border flex items-center justify-center ${r.enabled ? "bg-accent border-accent" : "border-divider"}`}
            >
              {r.enabled && <Check size={8} className="text-white" />}
            </button>
          </div>
          <input
            value={r.key}
            onChange={(e) => updateRow(i, "key", e.target.value)}
            className="flex-1 bg-transparent text-text-primary font-mono outline-none py-[3px]"
          />
          <input
            value={r.value}
            onChange={(e) => updateRow(i, "value", e.target.value)}
            className="flex-1 bg-transparent text-text-secondary font-mono outline-none py-[3px]"
          />
          <button
            onClick={() => deleteRow(i)}
            className="w-[28px] shrink-0 flex items-center justify-center text-text-tertiary hover:text-[#e53935] opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}
      <div className="flex items-center px-[10px] py-[3px] text-text-tertiary">
        <div className="w-[24px] shrink-0"></div>
        <input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addRow()}
          placeholder="Key"
          className="flex-1 bg-transparent text-text-primary font-mono outline-none py-[3px] placeholder:text-text-tertiary"
        />
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addRow()}
          placeholder="Value"
          className="flex-1 bg-transparent text-text-primary font-mono outline-none py-[3px] placeholder:text-text-tertiary"
        />
        <button
          onClick={addRow}
          className="w-[28px] shrink-0 flex items-center justify-center text-text-tertiary hover:text-accent"
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
}

function AuthTab({ authType, setAuthType, authToken, setAuthToken }) {
  const [showToken, setShowToken] = useState(false);
  return (
    <div className="p-[12px] space-y-[10px]">
      <div>
        <label className="block text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-[4px]">Type</label>
        <select
          value={authType}
          onChange={(e) => setAuthType(e.target.value)}
          className="w-full bg-surface-muted border border-divider rounded-[5px] px-[8px] py-[5px] text-[11px] text-text-primary outline-none"
        >
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="apikey">API Key</option>
          <option value="none">No Auth</option>
        </select>
      </div>
      {authType !== "none" && (
        <div>
          <label className="block text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-[4px]">
            {authType === "bearer" ? "Token" : authType === "basic" ? "Credentials" : "API Key"}
          </label>
          <div className="flex items-center gap-[4px]">
            <input
              type={showToken ? "text" : "password"}
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="flex-1 bg-surface-muted border border-divider rounded-[5px] px-[8px] py-[5px] text-[11px] font-mono text-text-primary outline-none focus:border-accent"
            />
            <button
              onClick={() => setShowToken(!showToken)}
              className="p-[5px] rounded-[5px] border border-divider hover:bg-hover text-text-tertiary"
              aria-label="Toggle visibility"
            >
              {showToken ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-[6px] bg-[#e8eaf6] dark:bg-[#2a2d4a] rounded-[5px] px-[10px] py-[6px]">
        <Lock size={11} className="text-accent shrink-0" />
        <span className="text-[10px] text-accent">
          {authType === "bearer" && "Token will be sent as Authorization: Bearer header"}
          {authType === "basic" && "Credentials will be sent as Authorization: Basic header"}
          {authType === "apikey" && "Key will be sent as X-API-Key header"}
          {authType === "none" && "No authentication will be applied to this request"}
        </span>
      </div>
    </div>
  );
}

function BodyTab({ body, setBody, bodyView, setBodyView }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-[6px] px-[10px] py-[4px] border-b border-divider shrink-0">
        {["JSON", "XML", "Text"].map((t, i) => (
          <button
            key={t}
            onClick={() => setBodyView("json")}
            className={`text-[10px] px-[8px] py-[3px] rounded-[4px] ${i === 0 && bodyView === "json" ? "bg-surface-pill text-text-primary font-medium" : "text-text-tertiary hover:text-text-primary"}`}
          >{t}</button>
        ))}
        <div className="w-px h-[12px] bg-divider"></div>
        <button
          onClick={() => setBodyView(bodyView === "form" ? "json" : "form")}
          className={`inline-flex items-center gap-[4px] text-[10px] px-[8px] py-[3px] rounded-[4px] ${bodyView === "form" ? "bg-accent text-white font-medium" : "text-text-tertiary hover:text-text-primary"}`}
        >
          <List size={10} />
          Form View
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {bodyView === "form" ? (
          <FormView body={body} setBody={setBody} />
        ) : (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full h-full p-[10px] text-[11px] font-mono leading-[1.7] text-text-primary bg-transparent resize-none outline-none"
            placeholder='{\n  "key": "value"\n}'
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

/* ── Phase 2: Form Auto-Generation ── */
function FormView({ body, setBody }) {
  const [formData, setFormData] = useState(() => {
    try { return JSON.parse(body) || {}; } catch { return {}; }
  });

  const updateField = (key, value) => {
    const next = { ...formData, [key]: value };
    setFormData(next);
    setBody(JSON.stringify(next, null, 2));
  };

  return (
    <div className="p-[12px] space-y-[8px]">
      <div className="flex items-center gap-[6px] mb-[4px]">
        <Braces size={11} className="text-accent" />
        <span className="text-[10px] font-medium text-accent">Auto-generated from OpenAPI schema</span>
      </div>
      {FORM_SCHEMA.map((field) => (
        <div key={field.key} className="space-y-[2px]">
          <label className="flex items-center gap-[4px] text-[10px] font-medium text-text-secondary">
            {field.type === "number" && <Hash size={9} className="text-text-tertiary" />}
            {field.type === "string" && <Type size={9} className="text-text-tertiary" />}
            {field.type === "date" && <CalendarDays size={9} className="text-text-tertiary" />}
            {field.type === "enum" && <List size={9} className="text-text-tertiary" />}
            {field.type === "password" && <Lock size={9} className="text-text-tertiary" />}
            {field.label}
            {field.required && <span className="text-[#e53935] text-[8px]">*</span>}
          </label>
          {field.type === "enum" ? (
            <select
              value={formData[field.key] ?? field.value}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="w-full bg-surface-muted border border-divider rounded-[4px] px-[8px] py-[4px] text-[11px] font-mono text-text-primary outline-none focus:border-accent"
            >
              {field.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : field.type === "date" ? (
            <input
              type="date"
              value={formData[field.key] ?? field.value}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="w-full bg-surface-muted border border-divider rounded-[4px] px-[8px] py-[4px] text-[11px] font-mono text-text-primary outline-none focus:border-accent"
            />
          ) : field.type === "number" ? (
            <input
              type="number"
              value={formData[field.key] ?? field.value}
              onChange={(e) => updateField(field.key, parseFloat(e.target.value) || 0)}
              min={field.min} max={field.max} step={field.step}
              className="w-full bg-surface-muted border border-divider rounded-[4px] px-[8px] py-[4px] text-[11px] font-mono text-text-primary outline-none focus:border-accent"
            />
          ) : (
            <input
              type={field.type === "password" ? "password" : "text"}
              value={formData[field.key] ?? field.value}
              onChange={(e) => updateField(field.key, e.target.value)}
              className="w-full bg-surface-muted border border-divider rounded-[4px] px-[8px] py-[4px] text-[11px] font-mono text-text-primary outline-none focus:border-accent"
              placeholder={field.format || ""}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Phase 2: Dynamic Request Chaining ── */
function ChainTab({ chainRules, setChainRules, envVars, setEnvVars }) {
  const toggleChain = (id) => {
    setChainRules((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="p-[10px] space-y-[8px]">
      <div className="flex items-center gap-[6px] mb-[2px]">
        <Link2 size={12} className="text-accent" />
        <span className="text-[11px] font-medium text-text-primary">Request Chaining</span>
        <span className="text-[9px] text-text-tertiary ml-auto">Extract response values into environment variables</span>
      </div>

      {chainRules.map((chain) => (
        <div key={chain.id} className={`rounded-[6px] border p-[10px] space-y-[6px] ${chain.active ? "border-accent/30 bg-[#e8eaf6]/50 dark:bg-[#2a2d4a]/50" : "border-divider bg-surface"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[6px]">
              <button onClick={() => toggleChain(chain.id)} className="text-text-tertiary hover:text-text-primary">
                {chain.active ? <ToggleRight size={16} className="text-accent" /> : <ToggleLeft size={16} />}
              </button>
              <span className="text-[11px] font-medium text-text-primary">{chain.source}</span>
              <ChevronRight size={10} className="text-text-tertiary" />
              <span className="text-[11px] font-mono text-accent">{chain.targetVar}</span>
            </div>
          </div>
          <div className="flex items-center gap-[4px] pl-[22px]">
            <span className="text-[9px] text-text-tertiary">Path:</span>
            <code className="text-[9px] font-mono text-[#4caf50] bg-surface-muted rounded px-[4px] py-[1px]">response.body.{chain.path}</code>
          </div>
          <div className="flex items-center gap-[4px] pl-[22px]">
            <span className="text-[9px] text-text-tertiary">Syntax:</span>
            <code className="text-[9px] font-mono text-text-secondary bg-surface-muted rounded px-[4px] py-[1px]">{chain.syntax}</code>
            <button
              onClick={() => navigator.clipboard?.writeText(chain.syntax)}
              className="p-[2px] rounded hover:bg-hover text-text-tertiary hover:text-text-primary"
              aria-label="Copy syntax"
            >
              <Copy size={9} />
            </button>
          </div>
        </div>
      ))}

      <button className="inline-flex items-center gap-[4px] text-[10px] text-accent hover:underline">
        <Plus size={10} />
        Add chain rule
      </button>

      <div className="flex items-center gap-[6px] bg-[#fff8e1] dark:bg-[#3e3510] rounded-[5px] px-[10px] py-[6px] mt-[4px]">
        <Info size={11} className="text-[#f59e0b] shrink-0" />
        <span className="text-[9px] text-[#5d4037] dark:text-[#fff176]">Right-click any key in the response JSON to extract it as a variable</span>
      </div>
    </div>
  );
}

/* ── Response Viewer ── */
function ResponseViewer({ response, filter, envVars, setEnvVars, sending }) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [copied, setCopied] = useState(false);

  if (sending) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-[12px]">
        <div className="w-[28px] h-[28px] rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <span className="text-[12px] text-text-secondary">Sending request...</span>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-[8px] text-text-tertiary">
        <Send size={28} strokeWidth={1} />
        <span className="text-[12px]">Send a request to see the response</span>
        <span className="text-[10px]">Or press Enter in the URL bar</span>
      </div>
    );
  }

  const statusColor = response.status < 300 ? "text-[#4caf50] bg-[#e8f5e9] dark:bg-[#1b3a1e]" : response.status < 400 ? "text-accent bg-[#e8eaf6] dark:bg-[#2a2d4a]" : response.status < 500 ? "text-[#f59e0b] bg-[#fff8e1] dark:bg-[#3e3510]" : "text-[#e53935] bg-[#fbe9e7] dark:bg-[#3e1a18]";

  const handleSetEnvVar = (key, value) => {
    setEnvVars((prev) => {
      const exists = prev.findIndex((v) => v.key === key);
      if (exists >= 0) {
        const copy = [...prev];
        copy[exists] = { ...copy[exists], value: String(value) };
        return copy;
      }
      return [...prev, { key, value: String(value), secret: false }];
    });
    setContextMenu(null);
  };

  const copyResponse = () => {
    navigator.clipboard?.writeText(JSON.stringify(response.body, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const responseHeaders = response.headers || {};
  const filteredHeaders = Object.entries(responseHeaders).filter(([k, v]) => {
    if (!filter) return true;
    try { const re = new RegExp(filter, "i"); return re.test(k) || re.test(v); } catch { return true; }
  });

  return (
    <div className="flex flex-col h-full" onClick={() => setContextMenu(null)}>
      {/* Status bar */}
      <div className="flex items-center gap-[8px] px-[10px] py-[5px] border-b border-divider shrink-0">
        <span className={`font-mono font-bold text-[12px] rounded-[4px] px-[8px] py-[2px] ${statusColor}`}>{response.status} {response.statusText}</span>
        <div className="flex items-center gap-[4px] text-[10px] text-text-tertiary">
          <Clock size={10} />
          <span className="font-mono font-medium text-text-secondary">{response.time}ms</span>
        </div>
        <div className="flex items-center gap-[4px] text-[10px] text-text-tertiary">
          <HardDrive size={10} />
          <span className="font-mono font-medium text-text-secondary">{response.size}</span>
        </div>
        <div className="ml-auto flex items-center gap-[2px]">
          <button onClick={() => setShowHeaders(!showHeaders)} className={`text-[10px] px-[8px] py-[3px] rounded-[4px] ${showHeaders ? "bg-surface-pill text-text-primary font-medium" : "text-text-tertiary hover:text-text-primary"}`}>
            Headers <span className="text-[9px] ml-[2px] text-text-tertiary">{Object.keys(responseHeaders).length}</span>
          </button>
          <button onClick={copyResponse} className="p-[4px] rounded hover:bg-hover text-text-tertiary hover:text-text-primary" aria-label="Copy response">
            {copied ? <Check size={12} className="text-[#4caf50]" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Headers */}
      {showHeaders && (
        <div className="border-b border-divider shrink-0 max-h-[140px] overflow-y-auto">
          {filteredHeaders.map(([k, v]) => (
            <div key={k} className="flex items-center px-[10px] py-[2px] text-[10px] font-mono hover:bg-hover">
              <span className="text-accent w-[200px] shrink-0 truncate">{k}</span>
              <span className="text-text-secondary truncate">{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-[8px] relative">
        {response.error ? (
          <div className="p-[12px] space-y-[6px]">
            <div className="flex items-center gap-[6px] text-[#e53935]">
              <AlertCircle size={14} />
              <span className="text-[12px] font-medium">Request Failed</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-[1.5]">{response.error}</p>
            {response.errorHint && (
              <div className="flex items-center gap-[6px] bg-[#fff8e1] dark:bg-[#3e3510] rounded-[5px] px-[10px] py-[6px] mt-[4px]">
                <Lightbulb size={11} className="text-[#f59e0b] shrink-0" />
                <span className="text-[9px] text-[#5d4037] dark:text-[#fff176]">{response.errorHint}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {typeof response.body === "string" ? (
              <pre className="text-[11px] font-mono text-text-primary whitespace-pre-wrap break-all">{response.body}</pre>
            ) : (
              <JsonTree data={response.body} depth={0} filter={filter} onContextMenu={(key, value, x, y) => setContextMenu({ key, value, x, y })} />
            )}
          </>
        )}

        {/* Context menu */}
        {contextMenu && (
          <div
            className="fixed z-50 bg-surface-card border border-divider rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.2)] py-[4px] w-[200px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-[10px] py-[3px] text-[9px] text-text-tertiary font-mono truncate border-b border-divider mb-[2px]">
              {contextMenu.key}: {String(contextMenu.value).substring(0, 30)}
            </div>
            <button
              onClick={() => handleSetEnvVar(contextMenu.key, contextMenu.value)}
              className="flex items-center gap-[6px] w-full px-[10px] py-[5px] text-[11px] text-text-primary hover:bg-hover"
            >
              <Variable size={12} className="text-accent" />
              Set as Environment Variable
            </button>
            <button
              onClick={() => { navigator.clipboard?.writeText(String(contextMenu.value)); setContextMenu(null); }}
              className="flex items-center gap-[6px] w-full px-[10px] py-[5px] text-[11px] text-text-primary hover:bg-hover"
            >
              <Copy size={12} className="text-text-tertiary" />
              Copy Value
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function JsonTree({ data, depth, filter, onContextMenu }) {
  const [collapsed, setCollapsed] = useState(depth > 2);

  if (data === null) return <span className="text-text-tertiary font-mono text-[11px]">null</span>;
  if (typeof data === "boolean") return <span className="text-[#ab47bc] font-mono text-[11px]">{data.toString()}</span>;
  if (typeof data === "number") return <span className="text-[#f59e0b] font-mono text-[11px]">{data}</span>;
  if (typeof data === "string") {
    const highlighted = filter ? highlightMatch(data, filter) : null;
    return <span className="text-[#4caf50] font-mono text-[11px]">{highlighted ? <>"{highlighted}"</> : `"${data}"`}</span>;
  }

  const isArray = Array.isArray(data);
  const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data);
  const bracket = isArray ? ["[", "]"] : ["{", "}"];

  if (collapsed) {
    return (
      <span className="font-mono text-[11px]">
        <button onClick={() => setCollapsed(false)} className="text-text-tertiary hover:text-text-primary mr-[2px]">
          <ChevronRight size={10} className="inline" />
        </button>
        <span className="text-text-tertiary">{bracket[0]} {entries.length} {isArray ? "items" : "keys"} {bracket[1]}</span>
      </span>
    );
  }

  return (
    <div style={{ paddingLeft: depth > 0 ? 14 : 0 }}>
      <span className="font-mono text-[11px]">
        {depth > 0 && (
          <button onClick={() => setCollapsed(true)} className="text-text-tertiary hover:text-text-primary mr-[2px]">
            <ChevronDown size={10} className="inline" />
          </button>
        )}
        <span className="text-text-tertiary">{bracket[0]}</span>
      </span>
      {entries.map(([key, val], i) => {
        const isLeaf = val === null || typeof val !== "object";
        const matchesFilter = filter && matchValue(key, val, filter);
        return (
          <div
            key={key}
            className={`flex items-start group ${matchesFilter ? "bg-[#fff8e1] dark:bg-[#3e3510] -mx-[4px] px-[4px] rounded" : ""}`}
            style={{ paddingLeft: 14 }}
            onContextMenu={(e) => {
              if (isLeaf && onContextMenu) {
                e.preventDefault();
                onContextMenu(key, val, e.clientX, e.clientY);
              }
            }}
          >
            <span className="font-mono text-[11px] shrink-0">
              {!isArray && <span className="text-accent">"{key}"</span>}
              {isArray && <span className="text-text-tertiary">{key}</span>}
              <span className="text-text-tertiary">: </span>
            </span>
            <span className="min-w-0">
              <JsonTree data={val} depth={depth + 1} filter={filter} onContextMenu={onContextMenu} />
              {i < entries.length - 1 && <span className="text-text-tertiary font-mono text-[11px]">,</span>}
            </span>
          </div>
        );
      })}
      <span className="text-text-tertiary font-mono text-[11px]">{bracket[1]}</span>
    </div>
  );
}

function matchValue(key, val, filter) {
  if (!filter) return false;
  try {
    const re = new RegExp(filter, "i");
    return re.test(String(key)) || re.test(String(val));
  } catch { return false; }
}

function highlightMatch(str, filter) {
  if (!filter) return null;
  try {
    const re = new RegExp(`(${filter})`, "gi");
    const parts = str.split(re);
    if (parts.length <= 1) return null;
    return parts.map((part, i) =>
      re.test(part) ? <mark key={i} className="bg-[#f59e0b]/30 text-[#4caf50] rounded-[1px]">{part}</mark> : part
    );
  } catch { return null; }
}

/* ── Environment Panel ── */
function EnvPanel({ envVars, setEnvVars, showSecrets, setShowSecrets }) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const updateVar = (index, field, value) => {
    setEnvVars((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const deleteVar = (index) => {
    setEnvVars((prev) => prev.filter((_, i) => i !== index));
  };

  const addVar = () => {
    if (!newKey.trim()) return;
    setEnvVars((prev) => [...prev, { key: newKey.trim(), value: newValue, secret: false }]);
    setNewKey("");
    setNewValue("");
  };

  return (
    <div className="border-t border-divider bg-surface-card">
      <div className="flex items-center justify-between px-[10px] py-[4px]">
        <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">Environment: Production</span>
        <div className="flex items-center gap-[4px]">
          <button onClick={() => setShowSecrets(!showSecrets)} className="text-text-tertiary hover:text-text-primary p-[3px] rounded hover:bg-hover" aria-label="Toggle secrets">
            {showSecrets ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
        </div>
      </div>
      <div className="max-h-[120px] overflow-y-auto">
        {envVars.map((v, i) => (
          <div key={i} className="flex items-center gap-[6px] px-[10px] py-[2px] text-[10px] font-mono hover:bg-hover group">
            {v.secret ? <Lock size={9} className="text-text-tertiary shrink-0" /> : <Variable size={9} className="text-text-tertiary shrink-0" />}
            <input
              value={v.key}
              onChange={(e) => updateVar(i, "key", e.target.value)}
              className="text-accent w-[100px] shrink-0 truncate bg-transparent outline-none"
            />
            <input
              type={v.secret && !showSecrets ? "password" : "text"}
              value={v.value}
              onChange={(e) => updateVar(i, "value", e.target.value)}
              className="text-text-secondary truncate flex-1 bg-transparent outline-none"
            />
            <button
              onClick={() => updateVar(i, "secret", !v.secret)}
              className="p-[2px] rounded text-text-tertiary hover:text-text-primary opacity-0 group-hover:opacity-100 shrink-0"
              aria-label="Toggle secret"
            >
              {v.secret ? <Lock size={9} /> : <Eye size={9} />}
            </button>
            <button
              onClick={() => deleteVar(i)}
              className="p-[2px] rounded text-text-tertiary hover:text-[#e53935] opacity-0 group-hover:opacity-100 shrink-0"
              aria-label="Delete variable"
            >
              <Trash2 size={9} />
            </button>
          </div>
        ))}
        {/* Add row */}
        <div className="flex items-center gap-[6px] px-[10px] py-[2px] text-[10px] font-mono">
          <Plus size={9} className="text-text-tertiary shrink-0" />
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addVar()}
            placeholder="key"
            className="text-text-tertiary w-[100px] shrink-0 bg-transparent outline-none placeholder:text-text-tertiary"
          />
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addVar()}
            placeholder="value"
            className="text-text-tertiary flex-1 bg-transparent outline-none placeholder:text-text-tertiary"
          />
        </div>
      </div>
    </div>
  );
}

/* ── History Panel ── */
function HistoryPanel({ history, filter, onReplay }) {
  const filtered = history.filter((h) => {
    if (!filter) return true;
    try {
      const re = new RegExp(filter, "i");
      return re.test(h.method) || re.test(h.url) || re.test(String(h.status));
    } catch { return true; }
  });

  return (
    <div className="border-t border-divider bg-surface">
      <div className="flex items-center justify-between px-[10px] py-[4px]">
        <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider">History</span>
        <span className="text-[9px] text-text-tertiary">{filtered.length} entries</span>
      </div>
      <div className="max-h-[100px] overflow-y-auto">
        {filtered.length === 0 && (
          <div className="px-[10px] py-[6px] text-[10px] text-text-tertiary">No requests yet</div>
        )}
        {filtered.map((h) => {
          const sc = h.status < 300 ? "text-[#4caf50]" : h.status < 400 ? "text-accent" : h.status < 500 ? "text-[#f59e0b]" : "text-[#e53935]";
          return (
            <div
              key={h.id}
              onClick={() => onReplay(h)}
              className="flex items-center gap-[6px] px-[10px] py-[2px] text-[10px] font-mono hover:bg-hover cursor-pointer"
            >
              <span className={`font-semibold text-[9px] w-[28px] shrink-0 ${METHOD_COLORS[h.method]}`}>{h.method}</span>
              <span className="text-text-primary truncate flex-1">{h.url}</span>
              <span className={`font-semibold shrink-0 ${sc}`}>{h.status}</span>
              <span className="text-text-tertiary shrink-0 w-[36px] text-right">{h.time}ms</span>
              <span className="text-text-tertiary shrink-0 w-[48px] text-right">{h.ts}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Phase 3: Prompt-to-Request Command Bar ── */
function PromptBar({ open, onClose, onApply }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQuery(""); setResult(null); setThinking(false); }
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const handleSubmit = () => {
    if (!query.trim()) return;
    setThinking(true);
    setTimeout(() => {
      const q = query.toLowerCase();
      let parsed = { method: "GET", url: "/api/v1/users", headers: [], body: null };

      if (q.includes("post")) parsed.method = "POST";
      else if (q.includes("put")) parsed.method = "PUT";
      else if (q.includes("delete")) parsed.method = "DELETE";
      else if (q.includes("patch")) parsed.method = "PATCH";

      if (q.includes("/deposit") || q.includes("deposit") || q.includes("fund")) parsed.url = "{{base_url}}/api/v1/accounts/{{user_id}}/fund";
      else if (q.includes("/user") || q.includes("user")) parsed.url = "{{base_url}}/api/v1/users";
      else if (q.includes("/payment") || q.includes("payment")) parsed.url = "{{base_url}}/api/v1/payments/init";
      else if (q.includes("/balance") || q.includes("balance")) parsed.url = "{{base_url}}/api/v1/accounts/{{user_id}}/balance";
      else if (q.includes("/login") || q.includes("login")) parsed.url = "{{base_url}}/api/v1/auth/login";
      else if (q.includes("/yield") || q.includes("interest")) parsed.url = "{{base_url}}/api/v1/accounts/{{user_id}}/yield";
      // Check for raw URLs
      const urlMatch = q.match(/(https?:\/\/[^\s]+)/i);
      if (urlMatch) parsed.url = urlMatch[1];
      const pathMatch = q.match(/(?:to|from|at)\s+(\/[^\s]+)/i);
      if (pathMatch) parsed.url = "{{base_url}}" + pathMatch[1];

      if (q.includes("bearer")) parsed.headers.push({ key: "Authorization", value: "Bearer {{api_key}}" });
      parsed.headers.push({ key: "Content-Type", value: "application/json" });

      const amountMatch = q.match(/\$(\d[\d,.]*)/);
      if (parsed.method === "POST" && (q.includes("deposit") || q.includes("fund"))) {
        parsed.body = JSON.stringify({ amount: amountMatch ? parseFloat(amountMatch[1].replace(",", "")) : 1000, currency: "NGN" }, null, 2);
      } else if (parsed.method === "POST" && q.includes("user")) {
        parsed.body = JSON.stringify({ first_name: "Chiamaka", last_name: "Eze", email: "chiamaka@example.com", tier: "premium" }, null, 2);
      } else if (parsed.method === "POST" && q.includes("login")) {
        parsed.body = JSON.stringify({ email: "adaeze@example.com", password: "password123" }, null, 2);
      }

      setResult(parsed);
      setThinking(false);
    }, 800);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15%] bg-black/40" onClick={onClose}>
      <div className="w-[560px] bg-surface-card border border-divider rounded-[12px] shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-[8px] px-[16px] py-[12px] border-b border-divider">
          <Sparkles size={16} className="text-accent shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder='e.g. "Send a POST to /deposits with a bearer token and $500"'
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none"
          />
          <div className="flex items-center gap-[4px] text-[10px] text-text-tertiary shrink-0">
            <Command size={10} />I
          </div>
        </div>

        {thinking && (
          <div className="flex items-center gap-[8px] px-[16px] py-[12px]">
            <div className="w-[14px] h-[14px] rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-[12px] text-text-secondary">Parsing natural language...</span>
          </div>
        )}

        {result && !thinking && (
          <div className="p-[16px] space-y-[10px]">
            <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Parsed Request</div>
            <div className="flex items-center gap-[8px]">
              <span className={`font-mono font-bold text-[12px] ${METHOD_COLORS[result.method]}`}>{result.method}</span>
              <code className="text-[11px] font-mono text-text-primary bg-surface-muted rounded px-[6px] py-[2px] flex-1 truncate">{result.url}</code>
            </div>
            {result.headers.length > 0 && (
              <div className="space-y-[2px]">
                <span className="text-[10px] text-text-tertiary">Headers</span>
                {result.headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-[6px] text-[10px] font-mono">
                    <span className="text-accent">{h.key}</span>
                    <span className="text-text-tertiary">:</span>
                    <span className="text-text-secondary">{h.value}</span>
                  </div>
                ))}
              </div>
            )}
            {result.body && (
              <div>
                <span className="text-[10px] text-text-tertiary">Body</span>
                <pre className="text-[10px] font-mono text-text-primary bg-surface-muted rounded-[6px] p-[8px] mt-[2px] whitespace-pre">{result.body}</pre>
              </div>
            )}
            <div className="flex items-center gap-[8px] pt-[4px]">
              <button
                onClick={() => { onApply(result); onClose(); }}
                className="inline-flex items-center gap-[4px] bg-accent text-white rounded-[6px] px-[12px] py-[5px] text-[11px] font-medium hover:opacity-90"
              >
                <ArrowRight size={12} />
                Apply &amp; Send
              </button>
              <button onClick={onClose} className="text-[11px] text-text-secondary hover:text-text-primary px-[8px] py-[5px]">
                Cancel
              </button>
            </div>
          </div>
        )}

        {!result && !thinking && (
          <div className="px-[16px] py-[10px] space-y-[4px]">
            {[
              "Send a POST to /deposits with a bearer token and a payload of $500",
              "GET user profile with user_id",
              "POST login with email and password",
              "DELETE user with bearer token",
            ].map((hint, i) => (
              <button
                key={i}
                onClick={() => setQuery(hint)}
                className="flex items-center gap-[6px] w-full px-[8px] py-[4px] rounded-[4px] text-[11px] text-text-secondary hover:bg-hover hover:text-text-primary text-left"
              >
                <MessageSquare size={11} className="text-text-tertiary shrink-0" />
                {hint}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Phase 3: AI Error Analysis Panel ── */
function ErrorAnalysisPanel({ onClose, onApplyFixes }) {
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setAnalyzing(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const err = AI_ERROR_ANALYSIS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[600px] max-h-[80vh] bg-surface-card border border-divider rounded-[12px] shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-[16px] py-[10px] border-b border-divider shrink-0">
          <div className="flex items-center gap-[8px]">
            <Sparkles size={14} className="text-accent" />
            <span className="text-[13px] font-medium text-text-primary">AI Error Analysis</span>
            <span className={`font-mono font-bold text-[11px] rounded-[4px] px-[6px] py-[1px] text-[#f59e0b] bg-[#fff8e1] dark:bg-[#3e3510]`}>
              {err.status} {err.statusText}
            </span>
          </div>
          <button onClick={onClose} className="p-[4px] rounded hover:bg-hover text-text-tertiary hover:text-text-primary">
            <X size={14} />
          </button>
        </div>

        {analyzing ? (
          <div className="flex flex-col items-center justify-center py-[40px] gap-[12px]">
            <div className="w-[24px] h-[24px] rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-[12px] text-text-secondary">Comparing payload against schema...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-[16px] space-y-[16px]">
            <div className="bg-[#fbe9e7] dark:bg-[#3e1a18] border border-[#ef9a9a] dark:border-[#5a2020] rounded-[8px] p-[12px]">
              <div className="text-[12px] font-medium text-[#c62828] dark:text-[#ef9a9a] mb-[6px]">Validation Error</div>
              <div className="space-y-[4px]">
                {err.error.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-[6px] text-[11px]">
                    <AlertCircle size={12} className="text-[#e53935] shrink-0 mt-[1px]" />
                    <span className="text-[#5d4037] dark:text-[#ef9a9a]">
                      <code className="font-mono font-medium">{e.field}</code>: {e.message} (received: <code className="font-mono text-[#e53935]">{e.received}</code>)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-[6px] mb-[8px]">
                <Lightbulb size={13} className="text-accent" />
                <span className="text-[12px] font-medium text-text-primary">Suggested Fixes</span>
              </div>
              <div className="space-y-[8px]">
                {err.fixes.map((fix, i) => (
                  <div key={i} className="border border-divider rounded-[8px] overflow-hidden">
                    <div className="flex items-center gap-[6px] px-[12px] py-[6px] bg-surface-muted text-[10px]">
                      <span className="font-mono font-medium text-text-primary">{fix.field}</span>
                      <span className="text-text-tertiary">— {fix.reason}</span>
                    </div>
                    <div className="flex">
                      <div className="flex-1 bg-[#fbe9e7]/50 dark:bg-[#3e1a18]/50 px-[12px] py-[8px] border-r border-divider">
                        <div className="text-[9px] text-[#c62828] dark:text-[#ef9a9a] uppercase tracking-wider mb-[4px]">Current</div>
                        <code className="text-[11px] font-mono text-[#e53935]">{fix.current}</code>
                      </div>
                      <div className="flex-1 bg-[#e8f5e9]/50 dark:bg-[#1b3a1e]/50 px-[12px] py-[8px]">
                        <div className="text-[9px] text-[#2e7d32] dark:text-[#81c784] uppercase tracking-wider mb-[4px]">Suggested</div>
                        <code className="text-[11px] font-mono text-[#4caf50]">{fix.suggested}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => { onApplyFixes?.(err.fixes); onClose(); }}
                className="inline-flex items-center gap-[4px] bg-accent text-white rounded-[6px] px-[12px] py-[5px] text-[11px] font-medium hover:opacity-90"
              >
                <Wand2 size={12} />
                Apply All Fixes
              </button>
              <button onClick={onClose} className="text-[11px] text-text-secondary hover:text-text-primary px-[8px] py-[5px]">
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Phase 3: Mock Data Generator ── */
function MockDataPanel({ onClose, onApply, collectionName }) {
  const [generating, setGenerating] = useState(true);
  const mockData = AI_MOCK_DATA[collectionName] || AI_MOCK_DATA["Savings App API"];

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[480px] bg-surface-card border border-divider rounded-[12px] shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-[16px] py-[10px] border-b border-divider">
          <div className="flex items-center gap-[8px]">
            <FlaskConical size={14} className="text-accent" />
            <span className="text-[13px] font-medium text-text-primary">AI Mock Data</span>
            <span className="text-[10px] text-text-tertiary bg-surface-muted rounded px-[6px] py-[1px]">{collectionName}</span>
          </div>
          <button onClick={onClose} className="p-[4px] rounded hover:bg-hover text-text-tertiary hover:text-text-primary">
            <X size={14} />
          </button>
        </div>

        {generating ? (
          <div className="flex flex-col items-center justify-center py-[32px] gap-[10px]">
            <div className="w-[20px] h-[20px] rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-[12px] text-text-secondary">Generating context-aware test data...</span>
          </div>
        ) : (
          <div className="p-[16px] space-y-[10px]">
            <div className="flex items-center gap-[6px] text-[10px] text-text-tertiary">
              <Sparkles size={10} />
              <span>Generated realistic data for "{collectionName}"</span>
            </div>
            <pre className="text-[11px] font-mono text-text-primary bg-surface rounded-[8px] border border-divider p-[12px] leading-[1.7] whitespace-pre overflow-auto max-h-[300px]">
              {JSON.stringify(mockData, null, 2)}
            </pre>
            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => { onApply(JSON.stringify(mockData, null, 2)); onClose(); }}
                className="inline-flex items-center gap-[4px] bg-accent text-white rounded-[6px] px-[12px] py-[5px] text-[11px] font-medium hover:opacity-90"
              >
                <ArrowRight size={12} />
                Insert into Body
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(JSON.stringify(mockData, null, 2))}
                className="inline-flex items-center gap-[4px] text-[11px] text-text-secondary hover:text-text-primary px-[8px] py-[5px]"
              >
                <Copy size={11} />
                Copy
              </button>
              <button onClick={onClose} className="text-[11px] text-text-secondary hover:text-text-primary px-[8px] py-[5px]">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Phase 3: Auto-Assertion Generator ── */
function AssertionPanel({ onClose, response }) {
  const [generating, setGenerating] = useState(true);

  const assertions = response ? generateAssertions(response) : [];
  const [selected, setSelected] = useState(() => new Set(assertions.map((_, i) => i)));

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!generating) setSelected(new Set(assertions.map((_, i) => i)));
  }, [generating]);

  const toggleAssertion = (i) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const copySelected = () => {
    const code = assertions.filter((_, i) => selected.has(i)).map((a) => a.code).join("\n");
    navigator.clipboard?.writeText(code);
  };

  const statusLabel = response ? `${response.status} ${response.statusText}` : "No response";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-[520px] max-h-[80vh] bg-surface-card border border-divider rounded-[12px] shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-[16px] py-[10px] border-b border-divider shrink-0">
          <div className="flex items-center gap-[8px]">
            <TestTube2 size={14} className="text-accent" />
            <span className="text-[13px] font-medium text-text-primary">Auto-Generated Assertions</span>
            <span className="text-[10px] text-[#4caf50] bg-[#e8f5e9] dark:bg-[#1b3a1e] rounded px-[6px] py-[1px]">{statusLabel}</span>
          </div>
          <button onClick={onClose} className="p-[4px] rounded hover:bg-hover text-text-tertiary hover:text-text-primary">
            <X size={14} />
          </button>
        </div>

        {generating ? (
          <div className="flex flex-col items-center justify-center py-[32px] gap-[10px]">
            <div className="w-[20px] h-[20px] rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-[12px] text-text-secondary">Analyzing response structure...</span>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-[12px] space-y-[2px]">
              {assertions.map((a, i) => (
                <div
                  key={i}
                  onClick={() => toggleAssertion(i)}
                  className={`flex items-start gap-[8px] p-[8px] rounded-[6px] cursor-pointer transition-colors ${selected.has(i) ? "bg-[#e8f5e9]/50 dark:bg-[#1b3a1e]/50" : "hover:bg-hover"}`}
                >
                  <div className={`w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center shrink-0 mt-[1px] ${selected.has(i) ? "bg-[#4caf50] border-[#4caf50]" : "border-divider"}`}>
                    {selected.has(i) && <Check size={9} className="text-white" />}
                  </div>
                  <div className="min-w-0">
                    <code className="text-[10px] font-mono text-text-primary block">{a.code}</code>
                    <span className="text-[9px] text-text-tertiary">{a.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-[8px] px-[16px] py-[10px] border-t border-divider shrink-0">
              <button
                onClick={copySelected}
                className="inline-flex items-center gap-[4px] bg-accent text-white rounded-[6px] px-[12px] py-[5px] text-[11px] font-medium hover:opacity-90"
              >
                <Copy size={11} />
                Copy {selected.size} assertions
              </button>
              <span className="text-[9px] text-text-tertiary ml-auto">{selected.size}/{assertions.length} selected</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function generateAssertions(response) {
  if (!response || response.error) return [];
  const a = [];
  a.push({ code: `expect(response.status).to.equal(${response.status});`, desc: `Status code is ${response.status} ${response.statusText}` });
  if (response.body && typeof response.body === "object") {
    const body = response.body;
    const addPaths = (obj, prefix) => {
      if (!obj || typeof obj !== "object") return;
      for (const [k, v] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${k}` : k;
        if (v === null) {
          a.push({ code: `expect(response.body.${path}).to.be.null;`, desc: `${path} is null` });
        } else if (typeof v === "string") {
          a.push({ code: `expect(typeof response.body.${path}).to.equal("string");`, desc: `${path} is a string` });
          if (v.includes("@")) a.push({ code: `expect(response.body.${path}).to.include("@");`, desc: `${path} contains @` });
        } else if (typeof v === "number") {
          a.push({ code: `expect(typeof response.body.${path}).to.equal("number");`, desc: `${path} is a number` });
        } else if (typeof v === "boolean") {
          a.push({ code: `expect(response.body.${path}).to.be.a("boolean");`, desc: `${path} is boolean` });
        } else if (Array.isArray(v)) {
          a.push({ code: `expect(response.body.${path}).to.be.an("array");`, desc: `${path} is an array` });
        } else if (typeof v === "object" && a.length < 15) {
          addPaths(v, path);
        }
        if (a.length >= 15) return;
      }
    };
    addPaths(body, "");
  }
  if (response.time) {
    a.push({ code: `expect(response.time).to.be.below(${Math.max(response.time * 2, 500)});`, desc: `Response time under ${Math.max(response.time * 2, 500)}ms` });
  }
  return a;
}

/* ── Main Layout ── */
export default function ApiClient() {
  // Collections
  const [collections, setCollections] = useState(INITIAL_COLLECTIONS);

  // Active request state
  const [selectedReq, setSelectedReq] = useState(INITIAL_COLLECTIONS[0].items[0].items[0]);
  const [method, setMethod] = useState("POST");
  const [url, setUrl] = useState("{{base_url}}/api/v1/users");
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json", enabled: true },
    { key: "Authorization", value: "Bearer {{api_key}}", enabled: true },
    { key: "X-Idempotency-Key", value: "idem_7k2x9f", enabled: true },
    { key: "Accept", value: "application/json", enabled: true },
  ]);
  const [params, setParams] = useState([
    { key: "include", value: "account", enabled: true },
    { key: "expand", value: "kyc_status", enabled: false },
  ]);
  const [body, setBody] = useState(`{
  "first_name": "Adaeze",
  "last_name": "Obi",
  "email": "adaeze@example.com",
  "phone": "+234 812 345 6789",
  "tier": "premium",
  "password": "securePass123"
}`);
  const [authType, setAuthType] = useState("bearer");
  const [authToken, setAuthToken] = useState("{{api_key}}");
  const [chainRules, setChainRules] = useState(CHAIN_RULES_INIT);

  // Environment
  const [envVars, setEnvVars] = useState(ENV_VARS_INIT);
  const [showSecrets, setShowSecrets] = useState(false);

  // Response
  const [response, setResponse] = useState(null);
  const [sending, setSending] = useState(false);

  // History
  const [history, setHistory] = useState([]);

  // Open tabs
  const [openTabs, setOpenTabs] = useState([
    { id: "r1", name: "Create User", method: "POST" },
  ]);

  // UI
  const [globalFilter, setGlobalFilter] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [errorAnalysisOpen, setErrorAnalysisOpen] = useState(false);
  const [mockDataOpen, setMockDataOpen] = useState(false);
  const [assertionOpen, setAssertionOpen] = useState(false);

  // Select a request from sidebar
  const handleSelectReq = (req) => {
    setSelectedReq(req);
    setMethod(req.method);
    setUrl(req.url || "");
    setResponse(null);
    // Add to tabs if not already open
    setOpenTabs((prev) => {
      if (prev.find((t) => t.id === req.id)) return prev;
      return [...prev, { id: req.id, name: req.name, method: req.method }];
    });
  };

  // Close a tab
  const closeTab = (tabId, e) => {
    e.stopPropagation();
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      if (selectedReq?.id === tabId && next.length > 0) {
        const fallback = next[next.length - 1];
        // find in collections
        const found = findReqById(collections, fallback.id);
        if (found) handleSelectReq(found);
      }
      return next;
    });
  };

  // Find a request in collections by ID
  const findReqById = (cols, id) => {
    for (const col of cols) {
      for (const item of col.items || []) {
        if (item.id === id) return item;
        if (item.type === "folder") {
          for (const req of item.items || []) {
            if (req.id === id) return req;
          }
        }
      }
    }
    return null;
  };

  // Add request to collection
  const handleAddRequest = (colId, folderId) => {
    const newReq = { id: uid(), name: "New Request", method: "GET", url: "", schema: null };
    setCollections((prev) => prev.map((col) => {
      if (col.id !== colId) return col;
      if (folderId) {
        return { ...col, items: col.items.map((item) => {
          if (item.id === folderId && item.type === "folder") {
            return { ...item, items: [...(item.items || []), newReq] };
          }
          return item;
        })};
      }
      return { ...col, items: [...col.items, newReq] };
    }));
    handleSelectReq(newReq);
  };

  // Add folder
  const handleAddFolder = (colId) => {
    const newFolder = { id: uid(), name: "New Folder", type: "folder", tag: "", items: [] };
    setCollections((prev) => prev.map((col) => {
      if (col.id !== colId) return col;
      return { ...col, items: [...col.items, newFolder] };
    }));
  };

  // Delete item from collection
  const handleDeleteItem = (colId, itemId, folderId) => {
    setCollections((prev) => prev.map((col) => {
      if (col.id !== colId) return col;
      if (folderId) {
        return { ...col, items: col.items.map((item) => {
          if (item.id === folderId && item.type === "folder") {
            return { ...item, items: item.items.filter((r) => r.id !== itemId) };
          }
          return item;
        })};
      }
      return { ...col, items: col.items.filter((item) => item.id !== itemId) };
    }));
    // Remove from tabs
    setOpenTabs((prev) => prev.filter((t) => t.id !== itemId));
  };

  // Rename item
  const handleRenameItem = (itemId, name) => {
    setCollections((prev) => prev.map((col) => ({
      ...col,
      items: col.items.map((item) => {
        if (item.id === itemId) return { ...item, name };
        if (item.type === "folder") {
          if (item.id === itemId) return { ...item, name };
          return { ...item, items: item.items?.map((r) => r.id === itemId ? { ...r, name } : r) };
        }
        return item;
      }),
    })));
    setOpenTabs((prev) => prev.map((t) => t.id === itemId ? { ...t, name } : t));
  };

  // Send request
  const handleSend = async () => {
    const resolvedUrl = resolveVars(url, envVars);

    // Build query params
    const enabledParams = params.filter((p) => p.enabled && p.key);
    let finalUrl = resolvedUrl;
    if (enabledParams.length > 0) {
      const qs = enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(resolveVars(p.value, envVars))}`).join("&");
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + qs;
    }

    // Build headers
    const reqHeaders = {};
    headers.filter((h) => h.enabled && h.key).forEach((h) => {
      reqHeaders[h.key] = resolveVars(h.value, envVars);
    });

    // Auth
    if (authType === "bearer" && authToken) {
      reqHeaders["Authorization"] = `Bearer ${resolveVars(authToken, envVars)}`;
    } else if (authType === "apikey" && authToken) {
      reqHeaders["X-API-Key"] = resolveVars(authToken, envVars);
    } else if (authType === "basic" && authToken) {
      reqHeaders["Authorization"] = `Basic ${btoa(resolveVars(authToken, envVars))}`;
    }

    // Build fetch options
    const fetchOpts = { method, headers: reqHeaders };
    if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
      fetchOpts.body = body;
    }

    setSending(true);
    setResponse(null);
    const startTime = performance.now();

    try {
      const res = await fetch(finalUrl, fetchOpts);
      const elapsed = Math.round(performance.now() - startTime);

      // Read response headers
      const resHeaders = {};
      res.headers.forEach((value, key) => { resHeaders[key] = value; });

      // Read body
      const contentType = res.headers.get("content-type") || "";
      let resBody;
      const rawText = await res.text();
      const sizeBytes = new TextEncoder().encode(rawText).length;

      if (contentType.includes("json")) {
        try { resBody = JSON.parse(rawText); } catch { resBody = rawText; }
      } else {
        resBody = rawText;
      }

      const result = {
        status: res.status,
        statusText: res.statusText,
        time: elapsed,
        size: formatBytes(sizeBytes),
        headers: resHeaders,
        body: resBody,
      };

      setResponse(result);

      // Apply chain rules
      chainRules.filter((c) => c.active).forEach((chain) => {
        try {
          const pathParts = chain.path.split(".");
          let val = resBody;
          for (const p of pathParts) {
            if (val && typeof val === "object") val = val[p];
            else { val = undefined; break; }
          }
          if (val !== undefined) {
            setEnvVars((prev) => {
              const idx = prev.findIndex((v) => v.key === chain.targetVar);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], value: String(val) };
                return copy;
              }
              return [...prev, { key: chain.targetVar, value: String(val), secret: false }];
            });
          }
        } catch { /* ignore chain errors */ }
      });

      // Add to history
      const now = new Date();
      const ts = now.toTimeString().substring(0, 8);
      setHistory((prev) => [{
        id: uid(),
        method,
        url: finalUrl.replace(/https?:\/\/[^/]+/, ""),
        status: res.status,
        time: elapsed,
        ts,
        fullUrl: url,
      }, ...prev].slice(0, 50));

    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      const isCors = err.message?.includes("Failed to fetch") || err.name === "TypeError";
      setResponse({
        status: 0,
        statusText: "Error",
        time: elapsed,
        size: "0 B",
        headers: {},
        body: null,
        error: err.message || "Request failed",
        errorHint: isCors
          ? "This is likely a CORS error. The target server needs to include Access-Control-Allow-Origin headers for browser requests. Try using a CORS proxy, or test APIs that allow cross-origin requests (e.g. jsonplaceholder.typicode.com)."
          : "Check the URL and try again.",
      });

      const now = new Date();
      setHistory((prev) => [{
        id: uid(),
        method,
        url: finalUrl.replace(/https?:\/\/[^/]+/, ""),
        status: 0,
        time: elapsed,
        ts: now.toTimeString().substring(0, 8),
        fullUrl: url,
      }, ...prev].slice(0, 50));
    }

    setSending(false);
  };

  // Replay from history
  const handleReplay = (entry) => {
    if (entry.fullUrl) {
      setUrl(entry.fullUrl);
      setMethod(entry.method);
    }
  };

  // Prompt bar apply
  const handlePromptApply = (parsed) => {
    setMethod(parsed.method);
    setUrl(parsed.url);
    if (parsed.headers?.length) {
      setHeaders((prev) => {
        const existing = prev.map((h) => h.key);
        const newHeaders = parsed.headers.filter((h) => !existing.includes(h.key)).map((h) => ({ ...h, enabled: true }));
        return [...prev, ...newHeaders];
      });
    }
    if (parsed.body) setBody(parsed.body);
    // Auto-send after applying
    setTimeout(() => handleSend(), 100);
  };

  // Mock data apply
  const handleMockApply = (jsonStr) => {
    setBody(jsonStr);
  };

  // Error analysis apply fixes
  const handleApplyFixes = (fixes) => {
    try {
      const parsed = JSON.parse(body);
      for (const fix of fixes) {
        const suggested = fix.suggested.replace(/^"|"$/g, "");
        parsed[fix.field] = suggested;
      }
      setBody(JSON.stringify(parsed, null, 2));
    } catch { /* ignore parse errors */ }
  };

  // Cmd/Ctrl + I to open prompt bar
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        setPromptOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Resizable panes
  const containerRef = useRef(null);
  const draggingLeft = useRef(false);
  const draggingRight = useRef(false);
  const [sidebarPct, setSidebarPct] = useState(15);
  const [responsePct, setResponsePct] = useState(45);

  const onDividerDown = useCallback((which) => (e) => {
    e.preventDefault();
    if (which === "left") draggingLeft.current = true;
    else draggingRight.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      if (draggingLeft.current) setSidebarPct(Math.min(25, Math.max(10, x)));
      if (draggingRight.current) setResponsePct(Math.min(60, Math.max(25, 100 - x)));
    };

    const onUp = () => {
      draggingLeft.current = false;
      draggingRight.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const requestPct = 100 - sidebarPct - responsePct;

  // Get current collection name for mock data
  const currentCollectionName = collections[0]?.name || "Savings App API";

  return (
    <div className="flex flex-col h-full bg-surface-card overflow-hidden">
      {/* Global filter bar + AI toolbar */}
      <div className="flex items-center gap-[8px] px-[10px] py-[4px] border-b border-divider shrink-0 bg-surface">
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
        {globalFilter && (
          <span className="text-[9px] text-text-tertiary shrink-0">
            Filtering response, headers &amp; history
          </span>
        )}
        <div className="ml-auto flex items-center gap-[3px] shrink-0">
          <button
            onClick={() => setPromptOpen(true)}
            className="inline-flex items-center gap-[4px] text-[10px] text-text-secondary hover:text-text-primary px-[8px] py-[3px] rounded-[5px] hover:bg-hover transition-colors"
            title="Prompt to Request (Cmd+I)"
          >
            <Sparkles size={11} className="text-accent" />
            Prompt
            <span className="text-[8px] text-text-tertiary bg-surface-muted rounded px-[4px] py-[1px] font-mono ml-[2px]">⌘I</span>
          </button>
          <button
            onClick={() => setMockDataOpen(true)}
            className="inline-flex items-center gap-[4px] text-[10px] text-text-secondary hover:text-text-primary px-[8px] py-[3px] rounded-[5px] hover:bg-hover transition-colors"
            title="Generate mock data"
          >
            <FlaskConical size={11} className="text-text-tertiary" />
            Mock
          </button>
          <button
            onClick={() => setAssertionOpen(true)}
            className="inline-flex items-center gap-[4px] text-[10px] text-text-secondary hover:text-text-primary px-[8px] py-[3px] rounded-[5px] hover:bg-hover transition-colors"
            title="Auto-generate assertions"
          >
            <TestTube2 size={11} className="text-text-tertiary" />
            Assert
          </button>
          <button
            onClick={() => setErrorAnalysisOpen(true)}
            className="inline-flex items-center gap-[4px] text-[10px] text-[#f59e0b] hover:text-[#e65100] px-[8px] py-[3px] rounded-[5px] hover:bg-hover transition-colors"
            title="Analyze error response"
          >
            <AlertCircle size={11} />
            Analyze
          </button>
        </div>
      </div>

      {/* AI Modals */}
      <PromptBar open={promptOpen} onClose={() => setPromptOpen(false)} onApply={handlePromptApply} />
      {errorAnalysisOpen && <ErrorAnalysisPanel onClose={() => setErrorAnalysisOpen(false)} onApplyFixes={handleApplyFixes} />}
      {mockDataOpen && <MockDataPanel onClose={() => setMockDataOpen(false)} onApply={handleMockApply} collectionName={currentCollectionName} />}
      {assertionOpen && <AssertionPanel onClose={() => setAssertionOpen(false)} response={response} />}

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="shrink-0 border-r border-divider bg-surface overflow-hidden" style={{ width: `${sidebarPct}%` }}>
          <ApiSidebar
            collections={collections}
            selected={selectedReq}
            onSelect={handleSelectReq}
            filter={globalFilter}
            onAddRequest={handleAddRequest}
            onAddFolder={handleAddFolder}
            onDeleteItem={handleDeleteItem}
            onRenameItem={handleRenameItem}
          />
        </div>

        {/* Left divider */}
        <div onMouseDown={onDividerDown("left")} className="w-[3px] shrink-0 cursor-col-resize hover:bg-accent/40 transition-colors relative">
          <div className="absolute inset-y-0 -left-[3px] -right-[3px]" />
        </div>

        {/* Request Builder */}
        <div className="flex flex-col overflow-hidden" style={{ width: `${requestPct}%` }}>
          {/* Tabs */}
          <div className="flex items-center gap-[1px] px-[6px] h-[30px] border-b border-divider shrink-0 bg-surface overflow-x-auto">
            {openTabs.map((tab) => {
              const active = selectedReq?.id === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    const found = findReqById(collections, tab.id);
                    if (found) handleSelectReq(found);
                    else {
                      setSelectedReq(tab);
                      setMethod(tab.method);
                    }
                  }}
                  className={`inline-flex items-center gap-[5px] px-[10px] py-[4px] text-[10px] rounded-t-[5px] shrink-0 whitespace-nowrap ${active ? "bg-surface-card text-text-primary font-medium border border-divider border-b-surface-card -mb-px" : "text-text-secondary hover:text-text-primary"}`}
                >
                  <span className={`font-mono font-semibold text-[9px] ${METHOD_COLORS[tab.method]}`}>{tab.method}</span>
                  {tab.name}
                  {openTabs.length > 1 && (
                    <span
                      onClick={(e) => closeTab(tab.id, e)}
                      className="text-text-tertiary hover:text-text-primary ml-[2px]"
                    >
                      <X size={9} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-hidden">
            <RequestBuilder
              method={method} setMethod={setMethod}
              url={url} setUrl={setUrl}
              headers={headers} setHeaders={setHeaders}
              params={params} setParams={setParams}
              body={body} setBody={setBody}
              authType={authType} setAuthType={setAuthType}
              authToken={authToken} setAuthToken={setAuthToken}
              onSend={handleSend} sending={sending}
              envVars={envVars} setEnvVars={setEnvVars}
              chainRules={chainRules} setChainRules={setChainRules}
            />
          </div>
          <EnvPanel envVars={envVars} setEnvVars={setEnvVars} showSecrets={showSecrets} setShowSecrets={setShowSecrets} />
        </div>

        {/* Right divider */}
        <div onMouseDown={onDividerDown("right")} className="w-[3px] shrink-0 cursor-col-resize hover:bg-accent/40 transition-colors relative">
          <div className="absolute inset-y-0 -left-[3px] -right-[3px]" />
        </div>

        {/* Response Viewer */}
        <div className="flex flex-col overflow-hidden border-l border-divider" style={{ width: `${responsePct}%` }}>
          <div className="flex-1 overflow-hidden">
            <ResponseViewer response={response} filter={globalFilter} envVars={envVars} setEnvVars={setEnvVars} sending={sending} />
          </div>
          <HistoryPanel history={history} filter={globalFilter} onReplay={handleReplay} />
        </div>
      </div>
    </div>
  );
}
