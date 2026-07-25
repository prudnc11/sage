import { useState, useRef, useEffect } from "react";
import { FileText, Plus, Trash2, Search, X, Clock, MoreHorizontal, Edit3, Check } from "lucide-react";

const SEED_NOTES = [
  { id: "note1", title: "Sprint planning notes", content: "Key priorities for this sprint:\n- Finish ENG-210 API endpoint\n- Review ENG-201 documentation\n- Start ENG-222 loop protection research\n\nBlocked items to escalate:\n- ENG-202 waiting on Google OAuth approval", updated: "2 hours ago" },
  { id: "note2", title: "Architecture decisions", content: "Decision: Use event-driven architecture for the automation rule engine.\n\nRationale:\n- Decouples rule evaluation from issue mutations\n- Allows async execution and retry logic\n- Easier to add new trigger types\n\nTrade-offs:\n- More complex debugging\n- Need to handle event ordering", updated: "1 day ago" },
  { id: "note3", title: "Meeting with platform team", content: "Discussed cross-workspace dependency indexing (PLT-101).\n\nAction items:\n- Manoj to provide API spec by Friday\n- Fatima to review SSO/SCIM integration requirements\n- Schedule follow-up for next week", updated: "3 days ago" },
];

export default function Notes() {
  const [notes, setNotes] = useState(() => [...SEED_NOTES]);
  const [selectedId, setSelectedId] = useState(notes[0]?.id || null);
  const [search, setSearch] = useState("");
  const [nextId, setNextId] = useState(10);
  const textareaRef = useRef(null);

  const selected = notes.find((n) => n.id === selectedId);
  const filtered = search ? notes.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())) : notes;

  const handleCreate = () => {
    const newNote = { id: `note${nextId}`, title: "Untitled note", content: "", updated: "Just now" };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    setNextId((n) => n + 1);
  };

  const handleUpdate = (id, updates) => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, ...updates, updated: "Just now" } : n));
  };

  const handleDelete = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(notes.find((n) => n.id !== id)?.id || null);
  };

  return (
    <div className="bg-surface h-full flex">
      {/* Sidebar */}
      <div className="w-[260px] shrink-0 border-r border-divider flex flex-col">
        <div className="px-[14px] pt-[24px] pb-[10px] shrink-0">
          <div className="flex items-center justify-between mb-[12px]">
            <h2 className="text-[14px] font-semibold text-text-primary">My Notes</h2>
            <button onClick={handleCreate} className="p-[4px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover" title="New note"><Plus size={16} /></button>
          </div>
          <div className="flex items-center gap-[6px] bg-surface-card rounded-[8px] border border-divider px-[8px] py-[5px]">
            <Search size={13} className="text-text-tertiary shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none w-full" />
            {search && <button onClick={() => setSearch("")} className="text-text-tertiary"><X size={12} /></button>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-[8px] pb-[8px] space-y-[2px]">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedId(n.id)}
              className={`px-[10px] py-[8px] rounded-[8px] cursor-pointer transition-colors group ${selectedId === n.id ? "bg-surface-pill" : "hover:bg-hover"}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[13px] truncate ${selectedId === n.id ? "font-medium text-text-primary" : "text-text-primary"}`}>{n.title}</span>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} className="p-[2px] text-text-tertiary hover:text-[#e53935] opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 size={12} /></button>
              </div>
              <p className="text-[11px] text-text-tertiary mt-[1px] truncate">{n.content.split("\n")[0] || "Empty"}</p>
              <span className="text-[10px] text-text-tertiary mt-[2px] flex items-center gap-[3px]"><Clock size={9} />{n.updated}</span>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-[20px] text-center text-[12px] text-text-tertiary">No notes found</div>}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {selected ? (
          <>
            <div className="px-[24px] pt-[24px] pb-[10px] shrink-0">
              <input
                value={selected.title}
                onChange={(e) => handleUpdate(selected.id, { title: e.target.value })}
                className="text-[20px] font-semibold text-text-primary bg-transparent outline-none w-full"
                placeholder="Note title..."
              />
              <span className="text-[11px] text-text-tertiary flex items-center gap-[4px] mt-[4px]"><Clock size={10} /> {selected.updated}</span>
            </div>
            <div className="flex-1 px-[24px] pb-[24px]">
              <textarea
                ref={textareaRef}
                value={selected.content}
                onChange={(e) => handleUpdate(selected.id, { content: e.target.value })}
                placeholder="Start writing..."
                className="w-full h-full resize-none bg-transparent text-[14px] text-text-primary placeholder:text-text-tertiary outline-none leading-[1.7]"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-tertiary">
            <FileText size={32} strokeWidth={1.5} className="mb-[8px] opacity-40" />
            <p className="text-[14px]">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
