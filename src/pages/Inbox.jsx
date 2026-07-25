import { useState } from "react";
import { Inbox as InboxIcon, Check, Archive, Star, Bell, X, ChevronRight, MoreHorizontal } from "lucide-react";
import { Avatar } from "../components/shared";
import { getUserById } from "../data/store";

const SEED_NOTIFICATIONS = [
  { id: "n1", type: "assigned", title: "You were assigned to ENG-222", detail: "Add infinite-loop protection for rule chains", from: "u1", time: "2 hours ago", read: false, starred: false },
  { id: "n2", type: "mention", title: "Mentioned in ENG-210", detail: "@you can you review the API endpoint implementation?", from: "u2", time: "3 hours ago", read: false, starred: true },
  { id: "n3", type: "status", title: "ENG-190 moved to Done", detail: "Add real-time sync for issue status updates", from: "u1", time: "5 hours ago", read: false, starred: false },
  { id: "n4", type: "comment", title: "New comment on ENG-201", detail: "The Slack integration docs look great, just one more revision needed.", from: "u4", time: "1 day ago", read: true, starred: false },
  { id: "n5", type: "assigned", title: "You were assigned to ENG-195", detail: "Move API: Transfer issues between teams", from: "u3", time: "1 day ago", read: true, starred: false },
  { id: "n6", type: "automation", title: "Automation triggered", detail: "Auto-assign bug reports executed on 3 new issues", from: "u1", time: "2 days ago", read: true, starred: false },
  { id: "n7", type: "mention", title: "Mentioned in PLT-101", detail: "Need your input on the dependency indexing approach", from: "u3", time: "3 days ago", read: true, starred: true },
];

export default function Inbox() {
  const [notifications, setNotifications] = useState(() => [...SEED_NOTIFICATIONS]);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : filter === "starred" ? notifications.filter((n) => n.starred) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const toggleStar = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, starred: !n.starred } : n));
  const archive = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="bg-surface min-h-full overflow-y-auto">
      <div className="px-6 pt-[24px] pb-[16px]">
        <div className="flex items-center justify-between mb-[20px]">
          <div className="flex items-center gap-[10px]">
            <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">Inbox</h1>
            {unreadCount > 0 && <span className="bg-accent text-white text-[11px] font-semibold rounded-full px-[7px] py-[1px]">{unreadCount}</span>}
          </div>
          <button onClick={markAllRead} className="text-[12px] text-accent hover:underline font-medium">Mark all read</button>
        </div>
        <div className="flex items-center gap-[4px] mb-[16px]">
          {[{ key: "all", label: "All" }, { key: "unread", label: "Unread" }, { key: "starred", label: "Starred" }].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`text-[13px] px-[10px] py-[5px] rounded-md transition-colors ${filter === f.key ? "bg-surface-pill font-medium text-text-primary" : "text-text-secondary hover:bg-hover"}`}>{f.label}</button>
          ))}
        </div>
        <div className="space-y-[2px]">
          {filtered.map((n) => {
            const user = getUserById(n.from);
            return (
              <div key={n.id} onClick={() => markRead(n.id)} className={`flex items-start gap-[10px] px-[14px] py-[12px] rounded-[10px] cursor-pointer transition-colors group ${n.read ? "hover:bg-hover" : "bg-surface-card hover:bg-hover border border-divider"}`}>
                {!n.read && <div className="w-[6px] h-[6px] rounded-full bg-accent mt-[6px] shrink-0" />}
                {n.read && <div className="w-[6px] mt-[6px] shrink-0" />}
                {user && <Avatar initials={user.initials} bg={user.bg} size={28} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[6px]">
                    <span className={`text-[13px] ${n.read ? "text-text-secondary" : "font-medium text-text-primary"}`}>{n.title}</span>
                  </div>
                  <p className="text-[12px] text-text-tertiary mt-[1px] truncate">{n.detail}</p>
                  <span className="text-[11px] text-text-tertiary mt-[2px] block">{n.time}</span>
                </div>
                <div className="flex items-center gap-[2px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); toggleStar(n.id); }} className={`p-[4px] rounded-md hover:bg-surface-muted ${n.starred ? "text-[#ffb300]" : "text-text-tertiary"}`}><Star size={14} strokeWidth={n.starred ? 0 : 1.75} fill={n.starred ? "currentColor" : "none"} /></button>
                  <button onClick={(e) => { e.stopPropagation(); archive(n.id); }} className="p-[4px] rounded-md hover:bg-surface-muted text-text-tertiary" title="Archive"><Archive size={14} /></button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-[40px] text-text-tertiary">
              <InboxIcon size={32} strokeWidth={1.5} className="mb-[8px] opacity-40" />
              <p className="text-[14px]">{filter === "unread" ? "All caught up!" : "No notifications"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
