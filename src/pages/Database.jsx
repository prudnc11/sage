import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Plus, MoreVertical, X, Trash2, Edit3, Check, Columns3 } from "lucide-react";

/* ── Seed DBML ── */
const SEED_DBML = `//// -- LEVEL 1
//// -- Tables and References

// Creating tables
Table users as U {
  id int [pk, increment] // auto-increment
  full_name varchar
  created_at timestamp
  country_code int
}

Table countries {
  code int [pk]
  name varchar
  continent_name varchar
}

// Creating references
// You can also define relationship separately

//// -- Adding column settings
Table order_items {
  order_id int [ref: > orders.id] // foreign key
  product_id int
  quantity int [default: 1] // default value
}

Ref: order_items.product_id > products.id

Table orders {
  id int [pk] // primary key
  user_id int [not null, unique]
  status varchar
  created_at varchar
}

Table products {
  id int [pk, increment]
  name varchar
  merchant_id int
  price int
  status products_status
  created_at datetime
}

Table merchants {
  id int [pk]
  country_code int
  merchant_name varchar
  created_at varchar
  admin_id int
}

Ref: merchants.country_code > countries.code
Ref: products.merchant_id > merchants.id
Ref: users.country_code > countries.code
Ref: orders.user_id > users.id

Table merchant_periods {
  id int [pk]
  merchant_id int
  country_code int
  start_date varchar
  end_date varchar
}

Ref: merchant_periods.merchant_id > merchants.id`;

const TABLE_W = 220;
const HEADER_H = 42;
const ROW_H = 34;

const INITIAL_POS = {
  users: { x: 100, y: 40 },
  countries: { x: 520, y: 40 },
  orders: { x: 100, y: 280 },
  order_items: { x: 780, y: 270 },
  merchants: { x: 520, y: 350 },
  products: { x: 100, y: 560 },
  merchant_periods: { x: 780, y: 530 },
};

/* ── DBML parser ── */
function parseDBML(text) {
  const lines = text.split("\n");
  const tables = [];
  const refs = [];
  let cur = null;

  for (const line of lines) {
    const t = line.trim();

    const tm = t.match(/^Table\s+(\w+)(?:\s+as\s+\w+)?\s*\{/i);
    if (tm) {
      cur = { name: tm[1], columns: [] };
      tables.push(cur);
      continue;
    }

    if (t === "}") { cur = null; continue; }

    if (cur) {
      if (t.startsWith("//") || !t) continue;
      const cm = t.match(/^(\S+)\s+(\S+)(?:\s*\[([^\]]*)\])?/);
      if (cm) {
        const col = { name: cm[1], type: cm[2], pk: /pk/i.test(cm[3] || "") };
        const ir = (cm[3] || "").match(/ref:\s*[><\-]\s*(\w+)\.(\w+)/i);
        if (ir) refs.push({ from: { table: cur.name, column: col.name }, to: { table: ir[1], column: ir[2] } });
        cur.columns.push(col);
      }
      continue;
    }

    const rm = t.match(/^Ref:\s*(\w+)\.(\w+)\s*[><\-]\s*(\w+)\.(\w+)/i);
    if (rm) refs.push({ from: { table: rm[1], column: rm[2] }, to: { table: rm[3], column: rm[4] } });
  }

  return { tables, refs };
}

/* ── Syntax highlight one line ── */
const TYPES = new Set(["int", "varchar", "timestamp", "datetime", "text", "boolean", "float", "decimal", "bigint", "uuid", "json", "date", "time", "serial", "products_status"]);

function highlightLine(line) {
  if (line.trim().startsWith("////")) return <span className="text-[#546e7a]">{line || " "}</span>;
  if (line.trim().startsWith("//")) return <span className="text-[#546e7a]">{line || " "}</span>;

  const parts = [];
  let k = 0;
  const re = /(\/\/.*$)|(Table|Ref:?)\b|\b(as)\b|(\[.*?\])|(\{|\})|(\b\w+\.\w+\b)|(\b\w+\b)/g;
  let last = 0;
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) parts.push(<span key={k++}>{line.slice(last, m.index)}</span>);
    const txt = m[0];
    if (m[1]) parts.push(<span key={k++} className="text-[#546e7a]">{txt}</span>);
    else if (m[2]) parts.push(<span key={k++} className="text-[#c792ea] font-semibold">{txt}</span>);
    else if (m[3]) parts.push(<span key={k++} className="text-[#c792ea]">{txt}</span>);
    else if (m[4]) parts.push(<span key={k++} className="text-[#c3e88d]">{txt}</span>);
    else if (m[5]) parts.push(<span key={k++} className="text-text-tertiary">{txt}</span>);
    else if (m[6]) parts.push(<span key={k++} className="text-[#89ddff]">{txt}</span>);
    else if (TYPES.has(txt)) parts.push(<span key={k++} className="text-[#82aaff]">{txt}</span>);
    else parts.push(<span key={k++} className="text-text-primary">{txt}</span>);
    last = m.index + txt.length;
  }
  if (last < line.length) parts.push(<span key={k++}>{line.slice(last)}</span>);
  return parts.length ? <>{parts}</> : <span> </span>;
}

/* ── Table card on canvas ── */
function TableCard({ table, pos, onMouseDown, menuOpen, onMenuToggle, onDeleteTable, onAddColumn, refDots }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function close(e) { if (menuRef.current && !menuRef.current.contains(e.target)) onMenuToggle(null); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen, onMenuToggle]);

  return (
    <div
      style={{ position: "absolute", left: pos.x, top: pos.y, width: TABLE_W }}
      className="rounded-[10px] border border-[#333333] bg-[#2A2A2A] shadow-[0_4px_24px_rgba(0,0,0,0.3)] select-none z-10"
    >
      {/* Header */}
      <div
        onMouseDown={(e) => onMouseDown(e, table.name)}
        className="flex items-center justify-between px-[14px] h-[42px] border-b border-[#333333] cursor-grab active:cursor-grabbing rounded-t-[10px] bg-[#262626]"
      >
        <span className="text-[13px] font-semibold text-text-primary flex items-center gap-[6px]">
          <span className="text-text-tertiary">/</span> {table.name}
        </span>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); onMenuToggle(menuOpen ? null : table.name); }}
            className="p-[3px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-[#333333] transition-colors"
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-[2px] w-[160px] bg-[#262626] rounded-lg border border-[#333333] shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-50 py-[4px]">
              <div
                onClick={(e) => { e.stopPropagation(); onAddColumn(table.name); onMenuToggle(null); }}
                className="flex items-center gap-[8px] px-3 py-[6px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-[#333333] text-text-primary"
              >
                <Plus size={13} /> Add column
              </div>
              <div className="border-t border-[#333333] my-[3px]" />
              <div
                onClick={(e) => { e.stopPropagation(); onDeleteTable(table.name); onMenuToggle(null); }}
                className="flex items-center gap-[8px] px-3 py-[6px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-[#333333] text-[#e53935]"
              >
                <Trash2 size={13} /> Delete table
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Columns */}
      {table.columns.map((col, ci) => {
        const hasLeftDot = refDots.some((d) => d.table === table.name && d.column === col.name && d.side === "left");
        const hasRightDot = refDots.some((d) => d.table === table.name && d.column === col.name && d.side === "right");
        return (
          <div
            key={ci}
            className="flex items-center justify-between px-[14px] relative"
            style={{ height: ROW_H }}
          >
            {hasLeftDot && (
              <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-[#5e6ad2] border-2 border-[#2A2A2A] z-20" />
            )}
            <span className="text-[13px] text-text-primary">{col.name}</span>
            <span className="text-[12px] text-text-tertiary">{col.type}</span>
            {hasRightDot && (
              <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full bg-[#5e6ad2] border-2 border-[#2A2A2A] z-20" />
            )}
          </div>
        );
      })}
      <div className="h-[6px]" />
    </div>
  );
}

/* ── Main ── */
export default function Database() {
  const [dbml, setDbml] = useState(SEED_DBML);
  const [positions, setPositions] = useState({});
  const [title, setTitle] = useState("Untitled Database");
  const [editingTitle, setEditingTitle] = useState(false);
  const [saved, setSaved] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const preRef = useRef(null);
  const taRef = useRef(null);
  const lineNumRef = useRef(null);
  const dragRef = useRef(null);
  const canvasRef = useRef(null);

  const { tables, refs } = useMemo(() => parseDBML(dbml), [dbml]);

  // Initialize positions
  useEffect(() => {
    setPositions((prev) => {
      const next = { ...prev };
      let ax = 100, ay = 40;
      tables.forEach((t) => {
        if (!next[t.name]) {
          if (INITIAL_POS[t.name]) next[t.name] = { ...INITIAL_POS[t.name] };
          else {
            next[t.name] = { x: ax, y: ay };
            ax += 280;
            if (ax > 900) { ax = 100; ay += 300; }
          }
        }
      });
      return next;
    });
  }, [tables]);

  // Drag handlers
  const handleMouseDown = useCallback((e, tableName) => {
    e.preventDefault();
    const pos = positions[tableName];
    if (!pos) return;
    dragRef.current = { table: tableName, offX: e.clientX - pos.x, offY: e.clientY - pos.y };

    const onMove = (ev) => {
      if (!dragRef.current) return;
      setPositions((p) => ({
        ...p,
        [dragRef.current.table]: {
          x: ev.clientX - dragRef.current.offX,
          y: ev.clientY - dragRef.current.offY,
        },
      }));
    };
    const onUp = () => {
      dragRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [positions]);

  // Scroll sync — textarea drives, pre + line numbers follow via transform
  const syncScroll = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const top = ta.scrollTop;
    const left = ta.scrollLeft;
    if (preRef.current) preRef.current.style.transform = `translate(-${left}px, -${top}px)`;
    if (lineNumRef.current) lineNumRef.current.style.transform = `translateY(-${top}px)`;
  }, []);

  // Compute ref dots (which columns have dots and on which side)
  const refDots = useMemo(() => {
    const dots = [];
    refs.forEach((r) => {
      const fp = positions[r.from.table];
      const tp = positions[r.to.table];
      if (!fp || !tp) return;
      const fromRight = fp.x + TABLE_W / 2 <= tp.x + TABLE_W / 2;
      dots.push({ table: r.from.table, column: r.from.column, side: fromRight ? "right" : "left" });
      dots.push({ table: r.to.table, column: r.to.column, side: fromRight ? "left" : "right" });
    });
    return dots;
  }, [refs, positions]);

  // Compute SVG line paths
  const linePaths = useMemo(() => {
    return refs.map((r) => {
      const ft = tables.find((t) => t.name === r.from.table);
      const tt = tables.find((t) => t.name === r.to.table);
      if (!ft || !tt) return null;
      const fp = positions[r.from.table];
      const tp = positions[r.to.table];
      if (!fp || !tp) return null;
      const fi = ft.columns.findIndex((c) => c.name === r.from.column);
      const ti = tt.columns.findIndex((c) => c.name === r.to.column);
      if (fi === -1 || ti === -1) return null;

      const fromRight = fp.x + TABLE_W / 2 <= tp.x + TABLE_W / 2;
      const fx = fromRight ? fp.x + TABLE_W : fp.x;
      const tx = fromRight ? tp.x : tp.x + TABLE_W;
      const fy = fp.y + HEADER_H + fi * ROW_H + ROW_H / 2;
      const ty = tp.y + HEADER_H + ti * ROW_H + ROW_H / 2;

      const dx = Math.abs(tx - fx);
      const cp = Math.max(60, dx * 0.45);
      const c1x = fromRight ? fx + cp : fx - cp;
      const c2x = fromRight ? tx - cp : tx + cp;

      return {
        d: `M ${fx} ${fy} C ${c1x} ${fy}, ${c2x} ${ty}, ${tx} ${ty}`,
        key: `${r.from.table}.${r.from.column}-${r.to.table}.${r.to.column}`,
      };
    }).filter(Boolean);
  }, [tables, refs, positions]);

  // DBML manipulation
  const addColumnToTable = useCallback((tableName) => {
    const lines = dbml.split("\n");
    let inTable = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().match(new RegExp(`^Table\\s+${tableName}(\\s|$)`, "i"))) { inTable = true; continue; }
      if (inTable && lines[i].trim() === "}") {
        lines.splice(i, 0, "  new_column varchar");
        setDbml(lines.join("\n"));
        setSaved(false);
        return;
      }
    }
  }, [dbml]);

  const deleteTable = useCallback((tableName) => {
    const lines = dbml.split("\n");
    let start = -1, inT = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().match(new RegExp(`^Table\\s+${tableName}(\\s|$)`, "i"))) { start = i; inT = true; continue; }
      if (inT && lines[i].trim() === "}") {
        lines.splice(start, i - start + 1);
        setDbml(lines.join("\n"));
        setSaved(false);
        setPositions((p) => { const n = { ...p }; delete n[tableName]; return n; });
        return;
      }
    }
  }, [dbml]);

  const addNewTable = useCallback(() => {
    const name = `table_${Date.now().toString(36)}`;
    const block = `\nTable ${name} {\n  id int [pk]\n}\n`;
    setDbml((prev) => prev + block);
    setSaved(false);
  }, []);

  const handleSave = () => setSaved(true);

  const dbmlLines = dbml.split("\n");

  // Canvas size
  const canvasW = useMemo(() => {
    let maxX = 1200;
    Object.values(positions).forEach((p) => { if (p.x + TABLE_W + 80 > maxX) maxX = p.x + TABLE_W + 80; });
    return maxX;
  }, [positions]);
  const canvasH = useMemo(() => {
    let maxY = 900;
    tables.forEach((t) => {
      const p = positions[t.name];
      if (p) {
        const h = HEADER_H + t.columns.length * ROW_H + 6;
        if (p.y + h + 60 > maxY) maxY = p.y + h + 60;
      }
    });
    return maxY;
  }, [tables, positions]);

  return (
    <div className="bg-[#1E1E1E] h-full flex">
      {/* ── Left: Code editor ── */}
      <div className="w-[340px] shrink-0 border-r border-[#333333] flex flex-col bg-[#1E1E1E]">
        {/* Title bar */}
        <div className="flex items-center gap-[10px] px-6 pt-[24px] pb-[12px] border-b border-[#333333] shrink-0">
          <div className="w-[8px] h-[8px] rounded-full bg-[#5e6ad2] shrink-0" />
          {editingTitle ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === "Enter") setEditingTitle(false); }}
              autoFocus
              className="text-[14px] font-semibold text-text-primary bg-transparent outline-none flex-1 border-b border-accent"
            />
          ) : (
            <span
              onClick={() => setEditingTitle(true)}
              className="text-[14px] font-semibold text-text-primary cursor-text hover:text-accent transition-colors truncate"
            >
              {title}
            </span>
          )}
          <span className={`text-[11px] px-[8px] py-[2px] rounded-full shrink-0 ${saved ? "text-[#4caf50] bg-[#4caf50]/10" : "text-text-tertiary bg-surface-muted"}`}>
            {saved ? "Saved" : "Unsaved"}
          </span>
        </div>

        {/* Editor */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Line numbers gutter */}
          <div className="w-[40px] shrink-0 overflow-hidden select-none relative">
            <div ref={lineNumRef} className="pt-[14px] pb-[14px]" style={{ willChange: "transform" }}>
              {dbmlLines.map((_, i) => (
                <div key={i} className="text-[12px] text-text-tertiary text-right pr-[8px] h-[20px] leading-[20px] font-mono">{i + 1}</div>
              ))}
            </div>
          </div>

          {/* Code area — textarea scrolls, highlighted pre follows */}
          <div className="flex-1 relative min-w-0 overflow-hidden">
            {/* Highlighted layer (follows textarea scroll via transform) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <pre
                ref={preRef}
                aria-hidden="true"
                className="pt-[14px] pb-[14px] pr-[14px] font-mono text-[12px] leading-[20px] whitespace-pre"
                style={{ willChange: "transform" }}
              >
                {dbmlLines.map((line, i) => (
                  <div key={i} className="h-[20px]">{highlightLine(line)}</div>
                ))}
              </pre>
            </div>
            {/* Editable textarea — the only scrollable element */}
            <textarea
              ref={taRef}
              value={dbml}
              onChange={(e) => { setDbml(e.target.value); setSaved(false); }}
              onScroll={syncScroll}
              spellCheck={false}
              className="absolute inset-0 w-full h-full pt-[14px] pb-[14px] pr-[14px] font-mono text-[12px] leading-[20px] text-transparent caret-text-primary bg-transparent resize-none outline-none whitespace-pre overflow-auto z-10"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-6 h-[40px] border-t border-[#333333] shrink-0">
          <span className="text-[11px] text-text-tertiary">{tables.length} table{tables.length !== 1 ? "s" : ""} &middot; {refs.length} ref{refs.length !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-[4px]">
            <button onClick={addNewTable} className="flex items-center gap-[4px] text-[11px] text-text-secondary hover:text-text-primary px-[8px] py-[3px] rounded-md hover:bg-[#333333] transition-colors">
              <Plus size={12} /> Table
            </button>
            <button onClick={handleSave} className="flex items-center gap-[4px] text-[11px] text-accent hover:text-accent/80 px-[8px] py-[3px] rounded-md hover:bg-[#333333] transition-colors">
              <Check size={12} /> Save
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Canvas ── */}
      <div className="flex-1 overflow-auto" style={{ backgroundImage: "radial-gradient(circle, #333333 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
        <div ref={canvasRef} className="relative" style={{ width: canvasW, height: canvasH, minWidth: "100%", minHeight: "100%" }}>
          {/* SVG relationship lines */}
          <svg className="absolute inset-0 pointer-events-none" width={canvasW} height={canvasH} style={{ minWidth: "100%", minHeight: "100%" }}>
            {linePaths.map((lp) => (
              <path
                key={lp.key}
                d={lp.d}
                fill="none"
                stroke="#5e6ad2"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
            ))}
          </svg>

          {/* Table cards */}
          {tables.map((t) => {
            const pos = positions[t.name];
            if (!pos) return null;
            return (
              <TableCard
                key={t.name}
                table={t}
                pos={pos}
                onMouseDown={handleMouseDown}
                menuOpen={menuOpen === t.name}
                onMenuToggle={setMenuOpen}
                onDeleteTable={deleteTable}
                onAddColumn={addColumnToTable}
                refDots={refDots}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
