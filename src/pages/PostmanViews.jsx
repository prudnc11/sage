import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Send,
  Folder,
  FolderOpen,
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
  MoreHorizontal,
  Star,
  Import,
  Code2,
  Settings,
  Layers,
  Server,
  Activity,
  GitBranch,
  History,
  Wifi,
  Terminal,
  Cookie,
  Play,
  ChevronLeft,
  FileJson,
  Braces,
  AlertCircle,
  Lightbulb,
  Info,
} from "lucide-react";

/* ── Helpers ── */
let _uid = 500;
const uid = () => `pm_${++_uid}`;

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

/* ── Method colors ── */
const M_COLORS = {
  GET: { text: "text-[#61affe]", bg: "bg-[#61affe]", label: "GET" },
  POST: { text: "text-[#49cc90]", bg: "bg-[#49cc90]", label: "POST" },
  PUT: { text: "text-[#fca130]", bg: "bg-[#fca130]", label: "PUT" },
  PATCH: { text: "text-[#50e3c2]", bg: "bg-[#50e3c2]", label: "PATCH" },
  DELETE: { text: "text-[#f93e3e]", bg: "bg-[#f93e3e]", label: "DEL" },
  OPTIONS: { text: "text-[#0d5aa7]", bg: "bg-[#0d5aa7]", label: "OPT" },
  HEAD: { text: "text-[#9012fe]", bg: "bg-[#9012fe]", label: "HEAD" },
};

/* ── Sample Data (matching screenshot style) ── */
const INITIAL_COLLECTIONS = [
  {
    id: "col1", name: "Kotlin Aspire", starred: true, items: [
      { id: "f_sbj", name: "SpringBootWithJava", type: "folder", items: [] },
      { id: "f_books", name: "Books", type: "folder", items: [] },
      {
        id: "f_sbka", name: "SpringBootKotlinAssignment", type: "folder", items: [
          {
            id: "f_course", name: "Course", type: "folder", items: [
              { id: "r1", name: "CreateCourses", method: "POST", url: "{{base_url}}/api/v1/courses" },
              { id: "r2", name: "UploadCourseContent", method: "PUT", url: "{{base_url}}/api/v1/courses/{{course_id}}/content" },
              { id: "r3", name: "UpdateCourses", method: "PUT", url: "{{base_url}}/api/v1/courses/{{course_id}}" },
              { id: "r4", name: "GetCourseById", method: "GET", url: "{{base_url}}/api/v1/courses/{{course_id}}" },
              { id: "r5", name: "Get All Courses", method: "GET", url: "{{base_url}}/api/v1/courses" },
              { id: "r6", name: "FilterCourses", method: "POST", url: "{{base_url}}/api/v1/courses/filter" },
              { id: "r7", name: "DeleteCourses", method: "DELETE", url: "{{base_url}}/api/v1/courses/{{course_id}}" },
            ]
          },
          {
            id: "f_teacher", name: "Teacher", type: "folder", items: [
              { id: "r8", name: "CreateTeachers", method: "POST", url: "{{base_url}}/api/v1/teachers" },
              { id: "r9", name: "UpdateTeachers", method: "PUT", url: "{{base_url}}/api/v1/teachers/{{teacher_id}}" },
              { id: "r10", name: "GetTeachersById", method: "GET", url: "{{base_url}}/api/v1/teachers/{{teacher_id}}" },
              { id: "r11", name: "GetAll Teachers", method: "GET", url: "{{base_url}}/api/v1/teachers" },
              { id: "r12", name: "FilterTeachers", method: "POST", url: "{{base_url}}/api/v1/teachers/filter" },
              { id: "r13", name: "findAllByJoiningDateBetween", method: "GET", url: "{{base_url}}/api/v1/teachers/findAllByJoiningDateBetween?startDate={{start_date}}&endDate={{end_date}}" },
              { id: "r14", name: "findAllBySalaryBetween", method: "GET", url: "{{base_url}}/api/v1/teachers/findAllBySalaryBetweenAndAgeBetween?salaryMin=100&salaryMax=250&ageMin=10&ageMax=65" },
              { id: "r15", name: "DeleteTeachers", method: "DELETE", url: "{{base_url}}/api/v1/teachers/{{teacher_id}}" },
            ]
          },
          { id: "f_dept", name: "Department", type: "folder", items: [] },
          { id: "f_student", name: "Student", type: "folder", items: [] },
          { id: "r16", name: "Course Management Documentation", method: "GET", url: "{{base_url}}/api/v1/docs" },
          { id: "r17", name: "Internationalization, Localization", method: "GET", url: "{{base_url}}/api/v1/i18n" },
        ]
      },
    ]
  },
  { id: "col2", name: "Java Guides Kafka", items: [] },
  { id: "col3", name: "Microservice Configuration", items: [] },
  { id: "col4", name: "MultiDBSpringBoot", items: [] },
  { id: "col5", name: "PDF Generator", items: [] },
  {
    id: "col6", name: "Security: Spring Guru", items: [
      { id: "r18", name: "localhost:8080/api/v1/beer/", method: "GET", url: "http://localhost:8080/api/v1/beer/" },
    ]
  },
];

const INITIAL_ENV = [
  { key: "base_url", value: "https://jsonplaceholder.typicode.com", secret: false },
  { key: "course_id", value: "1", secret: false },
  { key: "teacher_id", value: "1", secret: false },
  { key: "start_date", value: "2024-01-01", secret: false },
  { key: "end_date", value: "2026-12-31", secret: false },
];

/* ── Icon Sidebar ── */
const SIDEBAR_ICONS = [
  { id: "collections", icon: Layers, label: "Collections" },
  { id: "apis", icon: GitBranch, label: "APIs" },
  { id: "environments", icon: Globe, label: "Environments" },
  { id: "mock", icon: Server, label: "Mock Servers" },
  { id: "monitors", icon: Activity, label: "Monitors" },
  { id: "flows", icon: GitBranch, label: "Flows" },
  { id: "history", icon: History, label: "History" },
];

function IconSidebar({ active, setActive }) {
  return (
    <div className="w-[48px] shrink-0 bg-surface border-r border-divider flex flex-col items-center py-[8px] gap-[2px]">
      {SIDEBAR_ICONS.map((item) => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`flex flex-col items-center justify-center w-[42px] py-[6px] rounded-[6px] text-[9px] gap-[2px] transition-colors ${active === item.id ? "bg-surface-active text-text-primary" : "text-text-tertiary hover:text-text-secondary hover:bg-hover"}`}
          title={item.label}
        >
          <item.icon size={16} strokeWidth={1.5} />
          <span className="leading-none">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Collection Tree ── */
function CollectionTree({ collections, setCollections, selected, onSelect, onAddRequest, onAddFolder }) {
  const [openState, setOpenState] = useState(() => {
    const s = {};
    const walk = (items) => {
      items.forEach((item) => {
        if (item.type === "folder" || item.items) {
          s[item.id] = item.id === "col1" || item.id === "f_sbka" || item.id === "f_course" || item.id === "f_teacher";
          if (item.items) walk(item.items);
        }
      });
    };
    walk(collections);
    return s;
  });
  const [searchQuery, setSearchQuery] = useState("");

  const toggle = (id) => setOpenState((p) => ({ ...p, [id]: !p[id] }));

  const matchesSearch = (item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (item.name?.toLowerCase().includes(q)) return true;
    if (item.method?.toLowerCase().includes(q)) return true;
    if (item.items) return item.items.some(matchesSearch);
    return false;
  };

  const renderItem = (item, depth = 0) => {
    if (!matchesSearch(item)) return null;

    const isFolder = item.type === "folder" || (item.items && !item.method);
    const isOpen = openState[item.id];
    const isSelected = selected?.id === item.id;
    const pl = 12 + depth * 16;

    if (isFolder) {
      const FolderIcon = isOpen ? FolderOpen : Folder;
      return (
        <div key={item.id}>
          <div
            onClick={() => toggle(item.id)}
            className={`flex items-center gap-[5px] py-[4px] pr-[8px] cursor-pointer hover:bg-hover group`}
            style={{ paddingLeft: pl }}
          >
            <ChevronRight size={11} className={`text-text-tertiary shrink-0 transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`} />
            <FolderIcon size={13} strokeWidth={1.5} className="text-text-tertiary shrink-0" />
            <span className="text-[12px] text-text-primary truncate">{item.name}</span>
            <div className="ml-auto flex items-center gap-[2px] opacity-0 group-hover:opacity-100 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onAddRequest(item.id); }}
                className="p-[2px] rounded hover:bg-surface-pill text-text-tertiary"
                title="Add request"
              >
                <Plus size={11} />
              </button>
              <button className="p-[2px] rounded hover:bg-surface-pill text-text-tertiary" title="More">
                <MoreHorizontal size={11} />
              </button>
            </div>
          </div>
          {isOpen && item.items?.map((child) => renderItem(child, depth + 1))}
        </div>
      );
    }

    // Request item
    const mc = M_COLORS[item.method] || M_COLORS.GET;
    return (
      <div
        key={item.id}
        onClick={() => onSelect(item)}
        className={`flex items-center gap-[6px] py-[4px] pr-[8px] cursor-pointer group ${isSelected ? "bg-surface-active" : "hover:bg-hover"}`}
        style={{ paddingLeft: pl + 16 }}
      >
        <span className={`text-[10px] font-bold shrink-0 w-[30px] ${mc.text}`}>{mc.label}</span>
        <span className="text-[12px] text-text-primary truncate">{item.name}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-[10px] h-[36px] shrink-0 border-b border-divider">
        <div className="flex items-center gap-[8px]">
          <button className="p-[3px] rounded hover:bg-hover text-text-tertiary hover:text-text-primary" title="New">
            <Plus size={14} />
          </button>
          <button className="p-[3px] rounded hover:bg-hover text-text-tertiary hover:text-text-primary" title="Import">
            <Import size={14} />
          </button>
        </div>
        <button className="p-[3px] rounded hover:bg-hover text-text-tertiary hover:text-text-primary" title="More">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-[8px] py-[6px] border-b border-divider">
        <div className="flex items-center gap-[5px] bg-surface-muted rounded-[5px] px-[8px] py-[3px]">
          <Search size={12} className="text-text-tertiary shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="bg-transparent text-[11px] text-text-primary placeholder:text-text-tertiary outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-text-tertiary hover:text-text-primary">
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-[4px]">
        {collections.map((col) => {
          if (!matchesSearch(col)) return null;
          const isOpen = openState[col.id];
          return (
            <div key={col.id}>
              <div
                onClick={() => toggle(col.id)}
                className="flex items-center gap-[5px] px-[10px] py-[4px] cursor-pointer hover:bg-hover group"
              >
                <ChevronRight size={11} className={`text-text-tertiary shrink-0 transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`} />
                <span className="text-[12px] font-medium text-text-primary truncate">{col.name}</span>
                {col.starred && <Star size={11} className="text-[#ffb300] fill-[#ffb300] shrink-0 ml-[2px]" />}
                <div className="ml-auto flex items-center gap-[2px] opacity-0 group-hover:opacity-100 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddRequest(col.id); }}
                    className="p-[2px] rounded hover:bg-surface-pill text-text-tertiary"
                    title="Add request"
                  >
                    <Plus size={11} />
                  </button>
                  <button className="p-[2px] rounded hover:bg-surface-pill text-text-tertiary" title="More">
                    <MoreHorizontal size={11} />
                  </button>
                </div>
              </div>
              {isOpen && col.items?.map((item) => renderItem(item, 1))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tab Bar (scrollable request tabs) ── */
function TabBar({ tabs, activeId, onSelect, onClose }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [tabs, checkScroll]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * 160, behavior: "smooth" });
  };

  return (
    <div className="flex items-center h-[32px] border-b border-divider bg-surface shrink-0 overflow-hidden">
      {canScrollLeft && (
        <button onClick={() => scroll(-1)} className="px-[4px] h-full text-text-tertiary hover:text-text-primary hover:bg-hover shrink-0 border-r border-divider">
          <ChevronLeft size={14} />
        </button>
      )}
      <div ref={scrollRef} className="flex items-center flex-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const mc = M_COLORS[tab.method] || M_COLORS.GET;
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab)}
              className={`inline-flex items-center gap-[5px] px-[10px] h-[32px] text-[11px] shrink-0 whitespace-nowrap border-r border-divider transition-colors ${isActive ? "bg-surface-card text-text-primary border-b-2 border-b-accent" : "text-text-secondary hover:text-text-primary hover:bg-hover"}`}
            >
              <span className={`font-mono font-bold text-[9px] ${mc.text}`}>{tab.method}</span>
              <span className="truncate max-w-[100px]">{tab.name}</span>
              {tab.hasChanges && <span className={`w-[6px] h-[6px] rounded-full ${mc.bg} shrink-0`} />}
              <span
                onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                className="text-text-tertiary hover:text-text-primary ml-[2px] shrink-0"
              >
                <X size={10} />
              </span>
            </button>
          );
        })}
      </div>
      {canScrollRight && (
        <button onClick={() => scroll(1)} className="px-[4px] h-full text-text-tertiary hover:text-text-primary hover:bg-hover shrink-0 border-l border-divider">
          <ChevronRight size={14} />
        </button>
      )}
      <button className="px-[6px] h-full text-text-tertiary hover:text-text-primary hover:bg-hover shrink-0 border-l border-divider">
        <Plus size={14} />
      </button>
      <button className="px-[6px] h-full text-text-tertiary hover:text-text-primary hover:bg-hover shrink-0">
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}

/* ── Breadcrumb ── */
function Breadcrumb({ path }) {
  return (
    <div className="flex items-center gap-[4px] px-[16px] py-[6px] text-[11px] text-text-tertiary border-b border-divider shrink-0 overflow-hidden">
      <Folder size={11} className="shrink-0" />
      {path.map((segment, i) => (
        <span key={i} className="flex items-center gap-[4px] min-w-0">
          {i > 0 && <span>/</span>}
          <span className={`truncate ${i === path.length - 1 ? "text-text-primary font-medium" : "hover:text-text-primary cursor-pointer"}`}>{segment}</span>
        </span>
      ))}
      <div className="ml-auto flex items-center gap-[6px] shrink-0">
        <button className="text-[10px] text-text-tertiary hover:text-text-primary">Save</button>
        <button className="p-[3px] rounded hover:bg-hover text-text-tertiary"><MoreHorizontal size={13} /></button>
      </div>
    </div>
  );
}

/* ── URL Bar ── */
function UrlBar({ method, setMethod, url, setUrl, onSend, sending }) {
  const mc = M_COLORS[method] || M_COLORS.GET;
  return (
    <div className="flex items-center gap-[8px] px-[16px] py-[8px] border-b border-divider shrink-0">
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className={`font-bold text-[12px] bg-surface-muted border border-divider rounded-l-[6px] px-[10px] py-[6px] outline-none ${mc.text}`}
      >
        {Object.keys(M_COLORS).map((m) => (
          <option key={m} value={m} className="text-text-primary">{m}</option>
        ))}
      </select>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
        className="flex-1 bg-surface-muted border border-divider rounded-[6px] px-[10px] py-[6px] text-[12px] font-mono text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent"
        placeholder="Enter URL or paste text"
      />
      <button
        onClick={onSend}
        disabled={sending}
        className="inline-flex items-center gap-[5px] bg-accent hover:bg-accent/90 text-white font-semibold text-[12px] rounded-[6px] px-[16px] py-[6px] shrink-0 disabled:opacity-60"
      >
        {sending ? (
          <div className="w-[12px] h-[12px] rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <Send size={12} />
        )}
        Send
      </button>
    </div>
  );
}

/* ── Request Tabs ── */
const REQUEST_TABS = ["Params", "Authorization", "Headers", "Body", "Pre-request Script", "Tests", "Settings"];

function RequestTabs({ activeTab, setActiveTab, paramCount, headerCount, bodyHasContent }) {
  return (
    <div className="flex items-center border-b border-divider shrink-0 px-[8px] overflow-x-auto">
      {REQUEST_TABS.map((tab) => {
        const isActive = activeTab === tab;
        let badge = null;
        if (tab === "Params" && paramCount > 0) badge = paramCount;
        if (tab === "Headers" && headerCount > 0) badge = headerCount;
        const hasDot = (tab === "Params" && paramCount > 0) || (tab === "Body" && bodyHasContent);

        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-[10px] py-[8px] text-[12px] whitespace-nowrap transition-colors relative ${isActive ? "text-text-primary font-medium" : "text-text-secondary hover:text-text-primary"}`}
          >
            {tab}
            {badge && <span className="ml-[3px] text-[9px] text-text-tertiary">({badge})</span>}
            {hasDot && <span className="absolute top-[6px] right-[4px] w-[5px] h-[5px] rounded-full bg-[#49cc90]" />}
            {isActive && <div className="absolute bottom-0 left-[10px] right-[10px] h-[2px] bg-accent rounded-t" />}
          </button>
        );
      })}
      <div className="ml-auto flex items-center gap-[8px] shrink-0 pr-[8px]">
        <button className="text-[11px] text-accent hover:text-accent/80">Cookies</button>
        <button className="p-[3px] text-text-tertiary hover:text-text-primary" title="Code snippet">
          <Code2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Params Table (with Description column) ── */
function ParamsTable({ params, setParams }) {
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const update = (i, field, val) => setParams((p) => p.map((r, j) => j === i ? { ...r, [field]: val } : r));
  const toggle = (i) => setParams((p) => p.map((r, j) => j === i ? { ...r, enabled: !r.enabled } : r));
  const remove = (i) => setParams((p) => p.filter((_, j) => j !== i));
  const add = () => {
    if (!newKey.trim()) return;
    setParams((p) => [...p, { key: newKey.trim(), value: newVal, description: newDesc, enabled: true }]);
    setNewKey(""); setNewVal(""); setNewDesc("");
  };

  return (
    <div className="text-[12px]">
      <div className="flex items-center justify-between px-[16px] py-[6px]">
        <span className="text-[11px] font-medium text-text-secondary">Query Params</span>
        <div className="flex items-center gap-[8px]">
          <button className="p-[3px] text-text-tertiary hover:text-text-primary"><MoreHorizontal size={13} /></button>
          <button className="text-[11px] text-accent hover:text-accent/80">Bulk Edit</button>
        </div>
      </div>
      {/* Header */}
      <div className="flex items-center border-y border-divider bg-surface-muted/50 px-[16px] py-[4px] text-[11px] text-text-tertiary font-medium">
        <span className="w-[28px] shrink-0" />
        <span className="flex-[2] px-[4px]">Key</span>
        <span className="flex-[2] px-[4px]">Value</span>
        <span className="flex-[2] px-[4px]">Description</span>
        <span className="w-[28px] shrink-0" />
      </div>
      {/* Rows */}
      {params.map((r, i) => (
        <div key={i} className="flex items-center border-b border-divider px-[16px] py-[1px] hover:bg-hover group">
          <div className="w-[28px] shrink-0 flex items-center justify-center">
            <button onClick={() => toggle(i)} className={`w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center ${r.enabled ? "bg-accent border-accent" : "border-divider bg-surface-muted"}`}>
              {r.enabled && <Check size={9} className="text-white" />}
            </button>
          </div>
          <input value={r.key} onChange={(e) => update(i, "key", e.target.value)} className="flex-[2] bg-transparent text-text-primary outline-none px-[4px] py-[6px]" />
          <input value={r.value} onChange={(e) => update(i, "value", e.target.value)} className="flex-[2] bg-transparent text-text-secondary outline-none px-[4px] py-[6px]" />
          <input value={r.description || ""} onChange={(e) => update(i, "description", e.target.value)} placeholder="Description" className="flex-[2] bg-transparent text-text-tertiary outline-none px-[4px] py-[6px] placeholder:text-text-tertiary" />
          <div className="w-[28px] shrink-0 flex items-center justify-center">
            <button onClick={() => remove(i)} className="text-text-tertiary hover:text-[#f93e3e] opacity-0 group-hover:opacity-100">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
      {/* New row */}
      <div className="flex items-center px-[16px] py-[1px]">
        <div className="w-[28px] shrink-0" />
        <input value={newKey} onChange={(e) => setNewKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Key" className="flex-[2] bg-transparent text-text-tertiary outline-none px-[4px] py-[6px] placeholder:text-text-tertiary" />
        <input value={newVal} onChange={(e) => setNewVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Value" className="flex-[2] bg-transparent text-text-tertiary outline-none px-[4px] py-[6px] placeholder:text-text-tertiary" />
        <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Description" className="flex-[2] bg-transparent text-text-tertiary outline-none px-[4px] py-[6px] placeholder:text-text-tertiary" />
        <div className="w-[28px] shrink-0" />
      </div>
    </div>
  );
}

/* ── Headers Table ── */
function HeadersTable({ headers, setHeaders }) {
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const update = (i, field, val) => setHeaders((p) => p.map((r, j) => j === i ? { ...r, [field]: val } : r));
  const toggle = (i) => setHeaders((p) => p.map((r, j) => j === i ? { ...r, enabled: !r.enabled } : r));
  const remove = (i) => setHeaders((p) => p.filter((_, j) => j !== i));
  const add = () => {
    if (!newKey.trim()) return;
    setHeaders((p) => [...p, { key: newKey.trim(), value: newVal, description: newDesc, enabled: true }]);
    setNewKey(""); setNewVal(""); setNewDesc("");
  };

  return (
    <div className="text-[12px]">
      <div className="flex items-center justify-between px-[16px] py-[6px]">
        <span className="text-[11px] font-medium text-text-secondary">Headers</span>
        <div className="flex items-center gap-[8px]">
          <button className="text-[11px] text-accent hover:text-accent/80">Bulk Edit</button>
        </div>
      </div>
      <div className="flex items-center border-y border-divider bg-surface-muted/50 px-[16px] py-[4px] text-[11px] text-text-tertiary font-medium">
        <span className="w-[28px] shrink-0" />
        <span className="flex-[2] px-[4px]">Key</span>
        <span className="flex-[2] px-[4px]">Value</span>
        <span className="flex-[2] px-[4px]">Description</span>
        <span className="w-[28px] shrink-0" />
      </div>
      {headers.map((r, i) => (
        <div key={i} className="flex items-center border-b border-divider px-[16px] py-[1px] hover:bg-hover group">
          <div className="w-[28px] shrink-0 flex items-center justify-center">
            <button onClick={() => toggle(i)} className={`w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center ${r.enabled ? "bg-accent border-accent" : "border-divider bg-surface-muted"}`}>
              {r.enabled && <Check size={9} className="text-white" />}
            </button>
          </div>
          <input value={r.key} onChange={(e) => update(i, "key", e.target.value)} className="flex-[2] bg-transparent text-text-primary outline-none px-[4px] py-[6px]" />
          <input value={r.value} onChange={(e) => update(i, "value", e.target.value)} className="flex-[2] bg-transparent text-text-secondary outline-none px-[4px] py-[6px]" />
          <input value={r.description || ""} onChange={(e) => update(i, "description", e.target.value)} placeholder="Description" className="flex-[2] bg-transparent text-text-tertiary outline-none px-[4px] py-[6px] placeholder:text-text-tertiary" />
          <div className="w-[28px] shrink-0 flex items-center justify-center">
            <button onClick={() => remove(i)} className="text-text-tertiary hover:text-[#f93e3e] opacity-0 group-hover:opacity-100">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center px-[16px] py-[1px]">
        <div className="w-[28px] shrink-0" />
        <input value={newKey} onChange={(e) => setNewKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Key" className="flex-[2] bg-transparent text-text-tertiary outline-none px-[4px] py-[6px] placeholder:text-text-tertiary" />
        <input value={newVal} onChange={(e) => setNewVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Value" className="flex-[2] bg-transparent text-text-tertiary outline-none px-[4px] py-[6px] placeholder:text-text-tertiary" />
        <input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Description" className="flex-[2] bg-transparent text-text-tertiary outline-none px-[4px] py-[6px] placeholder:text-text-tertiary" />
        <div className="w-[28px] shrink-0" />
      </div>
    </div>
  );
}

/* ── Auth Tab ── */
function AuthorizationTab({ authType, setAuthType, authToken, setAuthToken }) {
  const [showToken, setShowToken] = useState(false);
  return (
    <div className="p-[16px] space-y-[12px]">
      <div>
        <label className="block text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-[4px]">Type</label>
        <select
          value={authType}
          onChange={(e) => setAuthType(e.target.value)}
          className="w-[240px] bg-surface-muted border border-divider rounded-[5px] px-[10px] py-[6px] text-[12px] text-text-primary outline-none"
        >
          <option value="inherit">Inherit auth from parent</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="apikey">API Key</option>
          <option value="none">No Auth</option>
        </select>
      </div>
      {authType === "bearer" && (
        <div>
          <label className="block text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-[4px]">Token</label>
          <div className="flex items-center gap-[6px]">
            <input
              type={showToken ? "text" : "password"}
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="flex-1 max-w-[400px] bg-surface-muted border border-divider rounded-[5px] px-[10px] py-[6px] text-[12px] font-mono text-text-primary outline-none focus:border-accent"
            />
            <button onClick={() => setShowToken(!showToken)} className="p-[6px] rounded-[5px] border border-divider hover:bg-hover text-text-tertiary">
              {showToken ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
          </div>
        </div>
      )}
      {authType === "none" && (
        <div className="flex items-center gap-[8px] bg-surface-muted rounded-[6px] px-[12px] py-[10px]">
          <Info size={14} className="text-text-tertiary shrink-0" />
          <span className="text-[12px] text-text-secondary">This request does not use any authorization.</span>
        </div>
      )}
    </div>
  );
}

/* ── Body Tab ── */
function BodyTab({ body, setBody, bodyType, setBodyType }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-[12px] px-[16px] py-[6px] border-b border-divider shrink-0">
        {["none", "raw", "form-data", "x-www-form-urlencoded", "binary", "GraphQL"].map((t) => (
          <label key={t} className="flex items-center gap-[4px] text-[11px] text-text-secondary cursor-pointer">
            <input
              type="radio"
              name="bodyType"
              checked={bodyType === t}
              onChange={() => setBodyType(t)}
              className="accent-accent w-[12px] h-[12px]"
            />
            {t}
          </label>
        ))}
        {bodyType === "raw" && (
          <select className="ml-auto bg-surface-muted border border-divider rounded-[4px] px-[8px] py-[3px] text-[11px] text-accent outline-none">
            <option>JSON</option>
            <option>Text</option>
            <option>XML</option>
            <option>HTML</option>
          </select>
        )}
      </div>
      {bodyType === "none" ? (
        <div className="flex-1 flex items-center justify-center text-[12px] text-text-tertiary">
          This request does not have a body
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full h-full p-[16px] text-[12px] font-mono leading-[1.7] text-text-primary bg-transparent resize-none outline-none"
            placeholder='{\n  "key": "value"\n}'
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}

/* ── Script Tab (placeholder) ── */
function ScriptTab({ type }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary gap-[8px] p-[24px]">
      <Terminal size={28} strokeWidth={1} />
      <span className="text-[12px]">{type === "pre" ? "Pre-request Script" : "Tests"}</span>
      <span className="text-[11px] text-text-tertiary text-center max-w-[300px]">
        Add JavaScript code to execute {type === "pre" ? "before" : "after"} the request is sent.
      </span>
      <textarea
        placeholder={`// ${type === "pre" ? "Pre-request" : "Test"} script\nconsole.log("Hello");`}
        className="w-full max-w-[500px] h-[120px] mt-[8px] p-[12px] text-[11px] font-mono text-text-primary bg-surface-muted border border-divider rounded-[6px] resize-none outline-none focus:border-accent"
      />
    </div>
  );
}

/* ── Response Panel ── */
function ResponsePanel({ response, sending }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);
  const [activeView, setActiveView] = useState("pretty");
  const [copied, setCopied] = useState(false);

  if (!response && !sending) {
    return (
      <div className="border-t border-divider">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-between px-[16px] py-[8px] cursor-pointer hover:bg-hover"
        >
          <span className="text-[12px] font-medium text-text-secondary">Response</span>
          <ChevronDown size={14} className={`text-text-tertiary transition-transform ${collapsed ? "-rotate-90" : ""}`} />
        </div>
        {!collapsed && (
          <div className="flex flex-col items-center justify-center py-[48px] gap-[12px] text-text-tertiary">
            <Send size={36} strokeWidth={1} className="text-text-tertiary/50" />
            <span className="text-[13px] text-text-secondary">Click Send to get a response</span>
          </div>
        )}
      </div>
    );
  }

  if (sending) {
    return (
      <div className="border-t border-divider">
        <div className="flex items-center px-[16px] py-[8px]">
          <span className="text-[12px] font-medium text-text-secondary">Response</span>
        </div>
        <div className="flex items-center justify-center py-[40px] gap-[10px]">
          <div className="w-[20px] h-[20px] rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-[12px] text-text-secondary">Sending request...</span>
        </div>
      </div>
    );
  }

  const statusColor = response.status < 300 ? "text-[#49cc90]" : response.status < 400 ? "text-[#61affe]" : response.status < 500 ? "text-[#fca130]" : "text-[#f93e3e]";

  const copyResponse = () => {
    const text = typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2);
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border-t border-divider flex flex-col">
      {/* Status bar */}
      <div className="flex items-center gap-[16px] px-[16px] py-[6px] border-b border-divider shrink-0">
        <span className="text-[12px] font-medium text-text-secondary">Response</span>
        {response.status > 0 && (
          <>
            <span className={`text-[12px] font-bold font-mono ${statusColor}`}>
              {response.status} {response.statusText}
            </span>
            <span className="text-[11px] text-text-tertiary">
              <span className="text-[#49cc90] font-medium">{response.time}ms</span>
            </span>
            <span className="text-[11px] text-text-tertiary">
              <span className="text-[#49cc90] font-medium">{response.size}</span>
            </span>
          </>
        )}
        <div className="ml-auto flex items-center gap-[4px]">
          {["Pretty", "Raw", "Preview"].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v.toLowerCase())}
              className={`text-[11px] px-[8px] py-[2px] rounded-[4px] ${activeView === v.toLowerCase() ? "bg-surface-pill text-text-primary font-medium" : "text-text-tertiary hover:text-text-primary"}`}
            >
              {v}
            </button>
          ))}
          <button onClick={copyResponse} className="p-[4px] rounded hover:bg-hover text-text-tertiary hover:text-text-primary ml-[4px]">
            {copied ? <Check size={12} className="text-[#49cc90]" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Headers toggle */}
      {response.headers && Object.keys(response.headers).length > 0 && (
        <button
          onClick={() => setShowHeaders(!showHeaders)}
          className="flex items-center gap-[6px] px-[16px] py-[4px] text-[11px] text-accent hover:text-accent/80 border-b border-divider"
        >
          Headers ({Object.keys(response.headers).length})
          <ChevronDown size={11} className={`transition-transform ${showHeaders ? "" : "-rotate-90"}`} />
        </button>
      )}
      {showHeaders && (
        <div className="max-h-[120px] overflow-y-auto border-b border-divider">
          {Object.entries(response.headers).map(([k, v]) => (
            <div key={k} className="flex items-center px-[16px] py-[2px] text-[11px] font-mono hover:bg-hover">
              <span className="text-accent w-[200px] shrink-0 truncate">{k}</span>
              <span className="text-text-secondary truncate">{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto max-h-[300px]">
        {response.error ? (
          <div className="p-[16px] space-y-[8px]">
            <div className="flex items-center gap-[6px] text-[#f93e3e]">
              <AlertCircle size={14} />
              <span className="text-[12px] font-medium">Request Failed</span>
            </div>
            <p className="text-[12px] text-text-secondary leading-[1.5]">{response.error}</p>
            {response.errorHint && (
              <div className="flex items-center gap-[6px] bg-[#fff8e1] dark:bg-[#3e3510] rounded-[5px] px-[10px] py-[6px] mt-[4px]">
                <Lightbulb size={11} className="text-[#fca130] shrink-0" />
                <span className="text-[11px] text-[#5d4037] dark:text-[#fff176]">{response.errorHint}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-[12px]">
            {activeView === "raw" || typeof response.body === "string" ? (
              <pre className="text-[11px] font-mono text-text-primary whitespace-pre-wrap break-all">{typeof response.body === "string" ? response.body : JSON.stringify(response.body)}</pre>
            ) : (
              <JsonTree data={response.body} depth={0} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── JSON Tree ── */
function JsonTree({ data, depth }) {
  const [collapsed, setCollapsed] = useState(depth > 3);

  if (data === null) return <span className="text-text-tertiary font-mono text-[11px]">null</span>;
  if (typeof data === "boolean") return <span className="text-[#ab47bc] font-mono text-[11px]">{data.toString()}</span>;
  if (typeof data === "number") return <span className="text-[#fca130] font-mono text-[11px]">{data}</span>;
  if (typeof data === "string") return <span className="text-[#49cc90] font-mono text-[11px]">"{data}"</span>;

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
      {entries.map(([key, val], i) => (
        <div key={key} style={{ paddingLeft: 14 }} className="flex items-start">
          <span className="font-mono text-[11px] shrink-0">
            {!isArray && <span className="text-[#61affe]">"{key}"</span>}
            {isArray && <span className="text-text-tertiary">{key}</span>}
            <span className="text-text-tertiary">: </span>
          </span>
          <span className="min-w-0">
            <JsonTree data={val} depth={depth + 1} />
            {i < entries.length - 1 && <span className="text-text-tertiary font-mono text-[11px]">,</span>}
          </span>
        </div>
      ))}
      <span className="text-text-tertiary font-mono text-[11px]">{bracket[1]}</span>
    </div>
  );
}

/* ── Bottom Bar ── */
function BottomBar() {
  return (
    <div className="flex items-center justify-between h-[28px] border-t border-divider bg-surface px-[12px] shrink-0">
      <div className="flex items-center gap-[16px]">
        <div className="flex items-center gap-[4px] text-[10px] text-[#49cc90]">
          <Wifi size={10} />
          <span>Online</span>
        </div>
        <button className="flex items-center gap-[4px] text-[10px] text-text-tertiary hover:text-text-primary">
          <Search size={10} />
          <span>Find and Replace</span>
        </button>
        <button className="flex items-center gap-[4px] text-[10px] text-text-tertiary hover:text-text-primary">
          <Terminal size={10} />
          <span>Console</span>
        </button>
      </div>
      <div className="flex items-center gap-[16px]">
        <button className="flex items-center gap-[4px] text-[10px] text-text-tertiary hover:text-text-primary">
          <Cookie size={10} />
          <span>Cookies</span>
        </button>
        <button className="flex items-center gap-[4px] text-[10px] text-text-tertiary hover:text-text-primary">
          <span>Capture requests</span>
        </button>
        <button className="flex items-center gap-[4px] text-[10px] text-text-tertiary hover:text-text-primary">
          <Play size={10} />
          <span>Runner</span>
        </button>
        <button className="flex items-center gap-[4px] text-[10px] text-text-tertiary hover:text-text-primary">
          <Trash2 size={10} />
          <span>Trash</span>
        </button>
      </div>
    </div>
  );
}

/* ── Environment Selector ── */
function EnvSelector({ envName, envVars, setEnvVars, showEnv, setShowEnv }) {
  return (
    <div className="relative">
      <button
        onClick={() => setShowEnv(!showEnv)}
        className="flex items-center gap-[6px] bg-surface-muted border border-divider rounded-[5px] px-[10px] py-[4px] text-[11px] text-text-primary hover:bg-hover"
      >
        <Globe size={12} className="text-[#49cc90]" />
        {envName}
        <ChevronDown size={11} className="text-text-tertiary" />
      </button>
      {showEnv && (
        <div className="absolute right-0 top-full mt-[4px] w-[320px] bg-surface-card border border-divider rounded-[8px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-[12px] py-[8px] border-b border-divider">
            <span className="text-[11px] font-medium text-text-primary">Environment Variables</span>
            <button onClick={() => setShowEnv(false)} className="p-[3px] rounded hover:bg-hover text-text-tertiary">
              <X size={12} />
            </button>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {envVars.map((v, i) => (
              <div key={i} className="flex items-center gap-[6px] px-[12px] py-[3px] text-[11px] font-mono hover:bg-hover">
                <span className="text-accent w-[90px] shrink-0 truncate">{v.key}</span>
                <input
                  value={v.value}
                  onChange={(e) => setEnvVars((p) => p.map((ev, j) => j === i ? { ...ev, value: e.target.value } : ev))}
                  className="flex-1 bg-transparent text-text-secondary outline-none truncate"
                />
                {v.secret && <Lock size={9} className="text-text-tertiary shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function PostmanViews() {
  const [collections, setCollections] = useState(INITIAL_COLLECTIONS);
  const [envVars, setEnvVars] = useState(INITIAL_ENV);
  const [sidebarSection, setSidebarSection] = useState("collections");
  const [showEnv, setShowEnv] = useState(false);

  // Active request
  const [selectedReq, setSelectedReq] = useState(null);
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [reqParams, setReqParams] = useState([]);
  const [reqHeaders, setReqHeaders] = useState([
    { key: "Content-Type", value: "application/json", description: "", enabled: true },
    { key: "Accept", value: "application/json", description: "", enabled: true },
  ]);
  const [body, setBody] = useState("");
  const [bodyType, setBodyType] = useState("none");
  const [authType, setAuthType] = useState("inherit");
  const [authToken, setAuthToken] = useState("");
  const [activeTab, setActiveTab] = useState("Params");

  // Response
  const [response, setResponse] = useState(null);
  const [sending, setSending] = useState(false);

  // Open tabs
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  // Collection panel width
  const [collPanelWidth, setCollPanelWidth] = useState(240);
  const dragging = useRef(false);

  const onDividerDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (e) => {
      if (!dragging.current) return;
      setCollPanelWidth(Math.min(400, Math.max(160, e.clientX - 48)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  // Breadcrumb path
  const getBreadcrumb = () => {
    if (!selectedReq) return [];
    const path = [];
    const find = (items, parents) => {
      for (const item of items) {
        if (item.id === selectedReq.id) {
          path.push(...parents, item.name);
          return true;
        }
        if (item.items && find(item.items, [...parents, item.name])) return true;
      }
      return false;
    };
    find(collections, []);
    return path;
  };

  // Select request
  const handleSelect = (req) => {
    setSelectedReq(req);
    setMethod(req.method || "GET");
    setUrl(req.url || "");
    setResponse(null);
    setActiveTab("Params");

    // Parse query params from URL
    try {
      const urlObj = new URL(resolveVars(req.url || "", envVars));
      const parsedParams = [];
      urlObj.searchParams.forEach((v, k) => {
        parsedParams.push({ key: k, value: v, description: "", enabled: true });
      });
      if (parsedParams.length > 0) setReqParams(parsedParams);
      else setReqParams([]);
    } catch {
      // Try to parse query string manually
      const qIdx = (req.url || "").indexOf("?");
      if (qIdx >= 0) {
        const qs = (req.url || "").substring(qIdx + 1);
        const parsed = qs.split("&").filter(Boolean).map((p) => {
          const [k, ...rest] = p.split("=");
          return { key: k, value: rest.join("="), description: "", enabled: true };
        });
        setReqParams(parsed);
      } else {
        setReqParams([]);
      }
    }

    // Add to tabs
    setOpenTabs((prev) => {
      if (prev.find((t) => t.id === req.id)) return prev;
      return [...prev, { id: req.id, name: req.name, method: req.method || "GET", hasChanges: false }];
    });
    setActiveTabId(req.id);
  };

  const handleTabSelect = (tab) => {
    const req = findReqById(collections, tab.id);
    if (req) handleSelect(req);
    else setActiveTabId(tab.id);
  };

  const handleTabClose = (tabId) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId && next.length > 0) {
        const fallback = next[next.length - 1];
        const req = findReqById(collections, fallback.id);
        if (req) handleSelect(req);
      }
      if (next.length === 0) {
        setSelectedReq(null);
        setActiveTabId(null);
      }
      return next;
    });
  };

  const findReqById = (items, id) => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.items) {
        const found = findReqById(item.items, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Add request to collection/folder
  const handleAddRequest = (parentId) => {
    const newReq = { id: uid(), name: "New Request", method: "GET", url: "" };
    const addTo = (items) => items.map((item) => {
      if (item.id === parentId) {
        return { ...item, items: [...(item.items || []), newReq] };
      }
      if (item.items) return { ...item, items: addTo(item.items) };
      return item;
    });
    setCollections((prev) => addTo(prev));
    handleSelect(newReq);
  };

  // Send request
  const handleSend = async () => {
    let resolvedUrl = resolveVars(url, envVars);

    // Append enabled params
    const enabledParams = reqParams.filter((p) => p.enabled && p.key);
    if (enabledParams.length > 0) {
      // Strip existing query string and rebuild
      const baseUrl = resolvedUrl.split("?")[0];
      const qs = enabledParams.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(resolveVars(p.value, envVars))}`).join("&");
      resolvedUrl = baseUrl + "?" + qs;
    }

    const fetchHeaders = {};
    reqHeaders.filter((h) => h.enabled && h.key).forEach((h) => {
      fetchHeaders[h.key] = resolveVars(h.value, envVars);
    });

    if (authType === "bearer" && authToken) {
      fetchHeaders["Authorization"] = `Bearer ${resolveVars(authToken, envVars)}`;
    }

    const fetchOpts = { method, headers: fetchHeaders };
    if (["POST", "PUT", "PATCH"].includes(method) && body.trim() && bodyType !== "none") {
      fetchOpts.body = body;
    }

    setSending(true);
    setResponse(null);
    const startTime = performance.now();

    try {
      const res = await fetch(resolvedUrl, fetchOpts);
      const elapsed = Math.round(performance.now() - startTime);
      const resHeaders = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });

      const rawText = await res.text();
      const sizeBytes = new TextEncoder().encode(rawText).length;
      const contentType = res.headers.get("content-type") || "";
      let resBody;
      if (contentType.includes("json")) {
        try { resBody = JSON.parse(rawText); } catch { resBody = rawText; }
      } else {
        resBody = rawText;
      }

      setResponse({
        status: res.status, statusText: res.statusText,
        time: elapsed, size: formatBytes(sizeBytes),
        headers: resHeaders, body: resBody,
      });
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      const isCors = err.message?.includes("Failed to fetch") || err.name === "TypeError";
      setResponse({
        status: 0, statusText: "Error",
        time: elapsed, size: "0 B",
        headers: {}, body: null,
        error: err.message || "Request failed",
        errorHint: isCors
          ? "This is likely a CORS error. The server must include Access-Control-Allow-Origin headers. Try an API that allows cross-origin requests (e.g. jsonplaceholder.typicode.com)."
          : "Check the URL and try again.",
      });
    }

    setSending(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" onClick={() => showEnv && setShowEnv(false)}>
      {/* Top bar */}
      <div className="flex items-center justify-between h-[36px] border-b border-divider bg-surface shrink-0 px-[12px]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[12px] font-medium text-text-primary">My Workspace</span>
          <span className="text-[10px] text-text-tertiary px-[6px] py-[1px] rounded bg-surface-muted">Personal</span>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <EnvSelector envName="Localhost" envVars={envVars} setEnvVars={setEnvVars} showEnv={showEnv} setShowEnv={setShowEnv} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Icon sidebar */}
        <IconSidebar active={sidebarSection} setActive={setSidebarSection} />

        {/* Collection panel */}
        <div className="shrink-0 border-r border-divider bg-surface overflow-hidden" style={{ width: collPanelWidth }}>
          <CollectionTree
            collections={collections}
            setCollections={setCollections}
            selected={selectedReq}
            onSelect={handleSelect}
            onAddRequest={handleAddRequest}
            onAddFolder={() => {}}
          />
        </div>

        {/* Resizer */}
        <div onMouseDown={onDividerDown} className="w-[3px] shrink-0 cursor-col-resize hover:bg-accent/40 transition-colors relative">
          <div className="absolute inset-y-0 -left-[3px] -right-[3px]" />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-surface-card">
          {openTabs.length > 0 ? (
            <>
              {/* Tab bar */}
              <TabBar tabs={openTabs} activeId={activeTabId} onSelect={handleTabSelect} onClose={handleTabClose} />

              {/* Breadcrumb */}
              <Breadcrumb path={getBreadcrumb()} />

              {/* URL bar */}
              <UrlBar method={method} setMethod={setMethod} url={url} setUrl={setUrl} onSend={handleSend} sending={sending} />

              {/* Request tabs */}
              <RequestTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                paramCount={reqParams.filter((p) => p.enabled).length}
                headerCount={reqHeaders.filter((h) => h.enabled).length}
                bodyHasContent={body.trim().length > 0 && bodyType !== "none"}
              />

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "Params" && <ParamsTable params={reqParams} setParams={setReqParams} />}
                {activeTab === "Headers" && <HeadersTable headers={reqHeaders} setHeaders={setReqHeaders} />}
                {activeTab === "Authorization" && <AuthorizationTab authType={authType} setAuthType={setAuthType} authToken={authToken} setAuthToken={setAuthToken} />}
                {activeTab === "Body" && <BodyTab body={body} setBody={setBody} bodyType={bodyType} setBodyType={setBodyType} />}
                {activeTab === "Pre-request Script" && <ScriptTab type="pre" />}
                {activeTab === "Tests" && <ScriptTab type="test" />}
                {activeTab === "Settings" && (
                  <div className="p-[16px] text-[12px] text-text-tertiary">Request settings will appear here.</div>
                )}
              </div>

              {/* Response */}
              <ResponsePanel response={response} sending={sending} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-[16px] text-text-tertiary">
              <Layers size={48} strokeWidth={1} className="text-text-tertiary/40" />
              <span className="text-[14px] text-text-secondary">Select a request from the collection</span>
              <span className="text-[12px] text-text-tertiary">Or create a new one to get started</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <BottomBar />
    </div>
  );
}
