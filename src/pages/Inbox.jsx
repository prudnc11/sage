import { useState, useRef, useEffect } from "react";
import {
  Inbox as InboxIcon, MoreHorizontal, AtSign, Paperclip, Send,
  Bell, BellOff, Share2, LayoutGrid, CheckSquare, Square, FileText,
  Video, ExternalLink, BarChart3, Plus, X, Calendar,
} from "lucide-react";
import { Avatar, IssueStatusIcon } from "../components/shared";

/* ═══════════════════════════════════════════════════════════
   USERS
   ═══════════════════════════════════════════════════════════ */
const USERS = {
  tony: { name: "Tony", initials: "TO", bg: "bg-[#546e7a]" },
  sade: { name: "Sade", initials: "SA", bg: "bg-[#43a047]" },
  dotun: { name: "Dotun", initials: "DO", bg: "bg-[#5e6ad2]" },
  sean: { name: "Sean", initials: "SE", bg: "bg-[#26a69a]" },
  cyril: { name: "Cyril", initials: "CY", bg: "bg-[#7e57c2]" },
  sanya: { name: "Sanya", initials: "SN", bg: "bg-[#ef5350]" },
  rosemary: { name: "Rosemary", initials: "RO", bg: "bg-[#ec407a]" },
  anthony: { name: "Anthony", initials: "AN", bg: "bg-[#42a5f5]" },
  you: { name: "You", initials: "YO", bg: "bg-[#7c3aed]" },
};

/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════════════════════════════ */
const SEED_NOTIFICATIONS = [
  {
    id: "n1", type: "comment", user: "tony", read: false, time: "Now",
    task: "T-123", taskTitle: "Create Custom Icons and Design System",
    preview: "Great work! I love the teddy bear icon!",
  },
  {
    id: "n2", type: "meeting", read: false, time: "",
    title: "Upcoming in 12 min - Team meeting",
    platform: "Google Meet (instruction in description)",
    schedule: "11:00 AM - 11:50 AM (50 min)",
    attendees: ["sade", "rosemary", "anthony"],
    extraCount: 3,
  },
  {
    id: "n3", type: "assignment", user: "sade", read: false, time: "12 min",
    task: "T-123", taskTitle: "Create Custom Icons and Design System",
  },
  {
    id: "n4", type: "mention", user: "dotun", read: false, time: "31 min",
    task: "T-223", taskTitle: "Build quick action menu",
    quote: 'What icon will best represent the AI search? @jags is suggesting a brain-like icon.',
    reply: "Brain? Com'on I think a Sparkle-icon would look better for that",
  },
  {
    id: "n5", type: "status", user: "sean", read: false, time: "3 min",
    project: "Dork - Tasks management App",
    from: "In Progress", to: "Completed",
  },
  {
    id: "n6", type: "comment", user: "dotun", read: false, time: "3 min",
    task: "T-123", taskTitle: "Create Custom Icons and Design System",
    preview: "Great work! I love the teddy bear icon!",
  },
  {
    id: "n7", type: "status", user: "cyril", read: true, time: "3 min",
    project: "Dork - Tasks management App",
    from: "Todo", to: "In Progress",
  },
  {
    id: "n8", type: "comment", user: "dotun", read: true, time: "3 min",
    task: "T-123", taskTitle: "Create Custom Icons and Design System",
    preview: "Great work! I love the teddy bear icon!",
  },
  {
    id: "n9", type: "comment", user: "dotun", read: true, time: "5 min",
    task: "T-123", taskTitle: "Create Custom Icons and Design System",
    preview: "Great work! I love the teddy bear icon!",
  },
];

/* ═══════════════════════════════════════════════════════════
   TASK DETAIL DATA
   ═══════════════════════════════════════════════════════════ */
const TASK_DETAIL = {
  id: "T-120",
  title: "Implement Elasticsearch Integration",
  status: "In Progress",
  createdBy: "sanya",
  parentTask: "Nexus Project Framework",
  assignees: ["sade", "rosemary", "anthony"],
  dueDate: "Nov 16, 2024",
  labels: [{ name: "Feature", color: "#ec407a" }],
  priority: "High",
  comments: [
    {
      id: "c1", user: "sade", time: "23:46 PM",
      text: '@you we need to implement Elasticsearch integration for improved search functionality. Please review the requirements and provide an initial estimate. For God sake! @rosemary why didn\'t you review the attachment from the previous task, I am sending it again in case you missed it',
      attachment: { name: "ElasticsearchIntegration_TechnicalSpec_v1.2.pdf", size: "2.8 MB" },
    },
    {
      id: "c2", user: "you", time: "12 minutes ago",
      text: "I've looked over the requirements. We'll need to:\n1. Set up Elasticsearch cluster\n2. Develop indexing mechanism for our data\n3. Implement search API\n4. Update front-end to use new search functionality\nEstimated time: 2-3 weeks.\n@sarah, does this align with our timeline?",
    },
  ],
  activity: [
    { id: "a1", type: "subtask_done", user: "rosemary", text: "Design RESTful API endpoints for search functionality", time: "12 minutes ago" },
    { id: "a2", type: "subtask_assign", user: "sade", assignee: "you", text: "T-123 Create Custom Icons and Design System", time: "12 minutes ago" },
  ],
};

/* ═══════════════════════════════════════════════════════════
   NOTIFICATION ITEM
   ═══════════════════════════════════════════════════════════ */
function NotificationItem({ n, selected, onSelect }) {
  const user = USERS[n.user];

  if (n.type === "meeting") {
    return (
      <div onClick={() => onSelect(n.id)} className={`flex items-start gap-[10px] px-[14px] py-[12px] rounded-[10px] cursor-pointer transition-colors ${selected ? "bg-surface-active" : "hover:bg-hover"}`}>
        {!n.read && <div className="w-[6px] h-[6px] rounded-full bg-[#ef4444] mt-[8px] shrink-0" />}
        {n.read && <div className="w-[6px] shrink-0" />}
        <div className="w-[32px] h-[32px] rounded-full bg-[#ef4444]/15 flex items-center justify-center shrink-0">
          <Calendar size={16} className="text-[#ef4444]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-text-primary">{n.title}</div>
          <div className="text-[12px] text-text-tertiary mt-[2px]">{n.platform}</div>
          <div className="text-[12px] text-text-tertiary mt-[1px]">{n.schedule}</div>
        </div>
        <div className="flex items-center gap-[8px] shrink-0">
          <div className="flex items-center">
            {n.attendees.slice(0, 3).map((uid, i) => {
              const u = USERS[uid];
              return <div key={uid} className={i > 0 ? "-ml-[6px]" : ""}><Avatar initials={u.initials} bg={u.bg} size={22} border /></div>;
            })}
            {n.extraCount > 0 && <span className="text-[11px] text-text-tertiary ml-[4px]">+{n.extraCount}</span>}
          </div>
          <button className="text-[12px] font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] rounded-[6px] px-[12px] py-[5px] transition-colors">Join</button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onSelect(n.id)} className={`flex items-start gap-[10px] px-[14px] py-[12px] rounded-[10px] cursor-pointer transition-colors ${selected ? "bg-surface-active" : "hover:bg-hover"}`}>
      {!n.read && <div className="w-[6px] h-[6px] rounded-full bg-[#3b82f6] mt-[8px] shrink-0" />}
      {n.read && <div className="w-[6px] shrink-0" />}
      {user && <Avatar initials={user.initials} bg={user.bg} size={32} />}
      <div className="flex-1 min-w-0">
        {n.type === "comment" && (
          <>
            <p className="text-[13px] text-text-primary leading-[1.4]">
              <span className="font-semibold">{user?.name}</span>
              <span className="text-text-secondary"> commented on </span>
              <span className="font-semibold">{n.task} {n.taskTitle}</span>
            </p>
            <p className="text-[12px] text-text-tertiary mt-[4px] leading-[1.45]">{n.preview}</p>
          </>
        )}
        {n.type === "assignment" && (
          <p className="text-[13px] text-text-primary leading-[1.4]">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-text-secondary"> assigned you a subtask </span>
            <span className="font-semibold">{n.task} {n.taskTitle}</span>
          </p>
        )}
        {n.type === "mention" && (
          <>
            <p className="text-[13px] text-text-primary leading-[1.4]">
              <span className="font-semibold">{user?.name}</span>
              <span className="text-text-secondary"> replied you on </span>
              <span className="font-semibold">{n.task} {n.taskTitle}</span>
            </p>
            {n.quote && (
              <div className="mt-[6px] border-l-[3px] border-divider pl-[10px]">
                <p className="text-[12px] text-text-tertiary leading-[1.5]">{n.quote}</p>
              </div>
            )}
            {n.reply && <p className="text-[12px] text-text-secondary mt-[6px] leading-[1.45]">{n.reply}</p>}
          </>
        )}
        {n.type === "status" && (
          <p className="text-[13px] text-text-primary leading-[1.4]">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-text-secondary"> changed </span>
            <span className="text-[#3b82f6]">{n.project}</span>
            <span className="text-text-secondary"> status from </span>
            <span className="font-medium">{n.from}</span>
            <span className="text-text-secondary"> to </span>
            <span className="font-medium">{n.to}</span>
          </p>
        )}
        <div className="flex items-center gap-[4px] mt-[4px]">
          {!n.read && <div className="w-[5px] h-[5px] rounded-full bg-[#3b82f6]" />}
          <span className="text-[11px] text-text-tertiary">{n.time}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TASK DETAIL PANEL
   ═══════════════════════════════════════════════════════════ */
function TaskDetailPanel({ task, onClose }) {
  const [activeTab, setActiveTab] = useState("comments");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(() => [...task.comments]);
  const [subscribed, setSubscribed] = useState(true);
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    setComments((prev) => [...prev, {
      id: `c${Date.now()}`, user: "you", time: "Just now", text: newComment.trim(),
    }]);
    setNewComment("");
  };

  const tabs = [
    { key: "description", label: "Description" },
    { key: "comments", label: "Comments", count: comments.length },
    { key: "subtasks", label: "Subtasks", count: 12 },
    { key: "attachments", label: "Attachments", count: 2 },
    { key: "notes", label: "Notes" },
  ];

  const renderHighlightedText = (text) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? <span key={i} className="text-[#3b82f6] font-medium">{part}</span> : <span key={i}>{part}</span>
    );
  };

  return (
    <div className="flex-1 flex flex-col border-l border-divider min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-[20px] h-[48px] border-b border-divider shrink-0">
        <div className="flex items-center gap-[8px] min-w-0">
          <span className="text-[13px] font-semibold text-text-secondary shrink-0">{task.id}</span>
          <span className="text-[14px] font-semibold text-text-primary truncate">{task.title}</span>
          <button className="p-[3px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover shrink-0">
            <MoreHorizontal size={16} />
          </button>
        </div>
        <div className="flex items-center gap-[6px] shrink-0">
          <button onClick={() => setSubscribed(!subscribed)} className={`flex items-center gap-[5px] text-[12px] font-medium px-[10px] py-[4px] rounded-[6px] border transition-colors ${subscribed ? "border-divider bg-surface-card text-text-primary" : "border-divider text-text-tertiary hover:bg-hover"}`}>
            {subscribed ? <Bell size={13} /> : <BellOff size={13} />}
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
          <button className="flex items-center gap-[5px] text-[12px] font-medium text-text-primary px-[10px] py-[4px] rounded-[6px] border border-divider hover:bg-hover transition-colors">
            <Share2 size={13} /> Share
          </button>
          <button onClick={onClose} className="p-[4px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover">
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* Properties + Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Properties */}
        <div className="px-[24px] py-[20px] space-y-[14px]">
          {/* Status */}
          <div className="flex items-center gap-[40px]">
            <span className="text-[13px] text-text-tertiary w-[100px] shrink-0">Status</span>
            <div className="flex items-center gap-[6px]">
              <IssueStatusIcon variant="inProgress" size={16} />
              <span className="text-[13px] text-text-primary font-medium">{task.status}</span>
            </div>
          </div>
          {/* Created by */}
          <div className="flex items-center gap-[40px]">
            <span className="text-[13px] text-text-tertiary w-[100px] shrink-0">Created by</span>
            <div className="flex items-center gap-[6px]">
              <Avatar initials={USERS[task.createdBy].initials} bg={USERS[task.createdBy].bg} size={20} />
              <span className="text-[13px] text-text-primary">{USERS[task.createdBy].name}</span>
            </div>
          </div>
          {/* Parent Task */}
          <div className="flex items-center gap-[40px]">
            <span className="text-[13px] text-text-tertiary w-[100px] shrink-0">Parent Task</span>
            <div className="flex items-center gap-[6px]">
              <IssueStatusIcon variant="inReviewFilled" size={16} />
              <span className="text-[13px] text-text-primary">{task.parentTask}</span>
            </div>
          </div>
          {/* Assignees */}
          <div className="flex items-center gap-[40px]">
            <span className="text-[13px] text-text-tertiary w-[100px] shrink-0">Assignees</span>
            <div className="flex items-center gap-[6px] flex-wrap">
              {task.assignees.map((uid) => (
                <div key={uid} className="flex items-center gap-[4px] bg-surface-card rounded-[6px] px-[6px] py-[3px] border border-divider">
                  <Avatar initials={USERS[uid].initials} bg={USERS[uid].bg} size={18} />
                  <span className="text-[12px] text-text-primary">{USERS[uid].name}</span>
                </div>
              ))}
              <button className="w-[24px] h-[24px] rounded-[6px] border border-dashed border-divider flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-text-tertiary transition-colors">
                <Plus size={12} />
              </button>
            </div>
          </div>
          {/* Due date */}
          <div className="flex items-center gap-[40px]">
            <span className="text-[13px] text-text-tertiary w-[100px] shrink-0">Due date</span>
            <span className="text-[13px] text-text-primary">{task.dueDate}</span>
          </div>
          {/* Labels */}
          <div className="flex items-center gap-[40px]">
            <span className="text-[13px] text-text-tertiary w-[100px] shrink-0">Labels</span>
            <div className="flex items-center gap-[6px]">
              {task.labels.map((l) => (
                <span key={l.name} className="flex items-center gap-[5px] bg-surface-card rounded-[6px] px-[8px] py-[3px] border border-divider text-[12px] text-text-primary font-medium">
                  <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: l.color }} />
                  {l.name}
                </span>
              ))}
              <button className="w-[24px] h-[24px] rounded-[6px] border border-dashed border-divider flex items-center justify-center text-text-tertiary hover:text-text-primary hover:border-text-tertiary transition-colors">
                <Plus size={12} />
              </button>
            </div>
          </div>
          {/* Priority */}
          <div className="flex items-center gap-[40px]">
            <span className="text-[13px] text-text-tertiary w-[100px] shrink-0">Priority</span>
            <span className="flex items-center gap-[5px] bg-surface-card rounded-[6px] px-[8px] py-[3px] border border-divider text-[12px] text-text-primary font-medium">
              <BarChart3 size={13} className="text-[#f59e0b]" />
              {task.priority}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-[2px] px-[24px] border-b border-divider">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`text-[13px] px-[10px] py-[8px] border-b-2 transition-colors ${activeTab === t.key ? "border-text-primary text-text-primary font-medium" : "border-transparent text-text-tertiary hover:text-text-secondary"}`}
            >
              {t.label}
              {t.count != null && <span className="ml-[4px] text-text-tertiary">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-[24px] py-[16px]">
          {activeTab === "comments" && (
            <div className="space-y-[4px]">
              {comments.map((c) => {
                const u = USERS[c.user];
                const isYou = c.user === "you";
                return (
                  <div key={c.id} className="py-[12px]">
                    {/* Comment header */}
                    <div className="flex items-center justify-between mb-[8px]">
                      <div className="flex items-center gap-[8px]">
                        {!isYou && <Avatar initials={u.initials} bg={u.bg} size={24} />}
                        {!isYou && <span className="text-[13px] font-semibold text-text-primary">{u.name}</span>}
                        {!isYou && <span className="text-[12px] text-text-tertiary">{c.time}</span>}
                        {isYou && <button className="p-[3px] text-text-tertiary hover:text-text-primary"><MoreHorizontal size={14} /></button>}
                      </div>
                      {isYou && (
                        <div className="flex items-center gap-[6px]">
                          <span className="text-[12px] text-text-tertiary">{c.time}</span>
                          <span className="text-[12px] text-text-tertiary">&middot;</span>
                          <span className="text-[13px] font-semibold text-text-primary">You</span>
                          <Avatar initials={u.initials} bg={u.bg} size={24} />
                        </div>
                      )}
                    </div>
                    {/* Comment body */}
                    <div className={`${isYou ? "bg-surface-card border border-divider rounded-[10px] px-[14px] py-[10px]" : "bg-surface-card border border-divider rounded-[10px] px-[14px] py-[10px]"}`}>
                      <p className="text-[13px] text-text-secondary leading-[1.65] whitespace-pre-line">
                        {renderHighlightedText(c.text)}
                      </p>
                      {c.attachment && (
                        <div className="flex items-center gap-[10px] mt-[10px] bg-surface rounded-[8px] border border-divider px-[12px] py-[8px]">
                          <div className="w-[36px] h-[36px] rounded-[6px] bg-[#ef4444]/15 flex items-center justify-center shrink-0">
                            <FileText size={18} className="text-[#ef4444]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] text-text-primary font-medium truncate">{c.attachment.name}</div>
                            <div className="flex items-center gap-[8px] text-[11px] mt-[1px]">
                              <span className="text-text-tertiary">{c.attachment.size}</span>
                              <span className="text-[#3b82f6] hover:underline cursor-pointer">Downloading file</span>
                            </div>
                          </div>
                          <button className="p-[4px] text-text-tertiary hover:text-text-primary"><MoreHorizontal size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Activity items */}
              <div className="border-t border-divider pt-[8px] mt-[8px] space-y-[8px]">
                {task.activity.map((a) => (
                  <div key={a.id} className="flex items-center gap-[8px] py-[6px]">
                    <Avatar initials={USERS[a.user].initials} bg={USERS[a.user].bg} size={22} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-text-secondary leading-[1.4]">
                        <span className="font-semibold text-text-primary">{USERS[a.user].name}</span>
                        {a.type === "subtask_done" && (
                          <> completed a subtask <CheckSquare size={13} className="inline text-[#4caf50] mx-[3px] -mt-[1px]" /> <span className="text-text-primary">{a.text}</span></>
                        )}
                        {a.type === "subtask_assign" && (
                          <> assigned <span className="font-semibold text-text-primary">{USERS[a.assignee]?.name || "you"}</span> a subtask <Square size={13} className="inline text-text-tertiary mx-[3px] -mt-[1px]" /> <span className="text-text-primary">{a.text}</span></>
                        )}
                      </p>
                    </div>
                    <span className="text-[11px] text-text-tertiary shrink-0">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "description" && (
            <p className="text-[13px] text-text-secondary leading-[1.65]">
              Implement Elasticsearch integration to provide improved full-text search capabilities across the application. This includes setting up the cluster, developing indexing mechanisms, building search APIs, and updating the front-end interface.
            </p>
          )}

          {activeTab === "subtasks" && (
            <div className="space-y-[6px]">
              {[
                { done: true, text: "Design RESTful API endpoints for search functionality" },
                { done: true, text: "Set up Elasticsearch cluster configuration" },
                { done: false, text: "Develop indexing mechanism for existing data" },
                { done: false, text: "Implement search API endpoints" },
                { done: false, text: "Build search UI components" },
                { done: false, text: "Add autocomplete and suggestions" },
                { done: false, text: "Write integration tests" },
                { done: false, text: "Performance benchmarking" },
                { done: false, text: "Security audit for search queries" },
                { done: false, text: "Documentation and API reference" },
                { done: false, text: "Migrate legacy search to Elasticsearch" },
                { done: false, text: "Deploy to staging environment" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-[8px] py-[6px] px-[4px] rounded-[6px] hover:bg-hover cursor-pointer">
                  {s.done ? <CheckSquare size={15} className="text-[#4caf50] shrink-0" /> : <Square size={15} className="text-text-tertiary shrink-0" />}
                  <span className={`text-[13px] ${s.done ? "text-text-tertiary line-through" : "text-text-primary"}`}>{s.text}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="space-y-[8px]">
              {[
                { name: "ElasticsearchIntegration_TechnicalSpec_v1.2.pdf", size: "2.8 MB", type: "pdf" },
                { name: "SearchArchitecture_Diagram.png", size: "540 KB", type: "img" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-[10px] bg-surface-card border border-divider rounded-[8px] px-[12px] py-[10px] hover:bg-hover cursor-pointer transition-colors">
                  <div className={`w-[36px] h-[36px] rounded-[6px] flex items-center justify-center shrink-0 ${f.type === "pdf" ? "bg-[#ef4444]/15" : "bg-[#3b82f6]/15"}`}>
                    <FileText size={18} className={f.type === "pdf" ? "text-[#ef4444]" : "text-[#3b82f6]"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-text-primary font-medium truncate">{f.name}</div>
                    <div className="text-[11px] text-text-tertiary mt-[1px]">{f.size}</div>
                  </div>
                  <ExternalLink size={14} className="text-text-tertiary" />
                </div>
              ))}
            </div>
          )}

          {activeTab === "notes" && (
            <p className="text-[13px] text-text-tertiary italic">No notes yet. Click to add one.</p>
          )}
        </div>
      </div>

      {/* Comment input */}
      {activeTab === "comments" && (
        <div className="px-[20px] py-[12px] border-t border-divider shrink-0">
          <div className="flex items-center gap-[10px]">
            <Avatar initials="YO" bg="bg-[#7c3aed]" size={28} />
            <div className="flex-1 flex items-center bg-surface-card border border-divider rounded-[10px] px-[12px] py-[8px] focus-within:border-accent transition-colors">
              <input
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="Leave a comment..."
                className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none"
              />
              <div className="flex items-center gap-[4px] shrink-0 ml-[8px]">
                <button className="p-[4px] rounded-md text-text-tertiary hover:text-text-primary transition-colors"><AtSign size={15} /></button>
                <button className="p-[4px] rounded-md text-text-tertiary hover:text-text-primary transition-colors"><Paperclip size={15} /></button>
                <button onClick={handleSubmit} className={`p-[4px] rounded-md transition-colors ${newComment.trim() ? "text-accent hover:text-accent/80" : "text-text-tertiary"}`}><Send size={15} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN INBOX
   ═══════════════════════════════════════════════════════════ */
export default function Inbox() {
  const [notifications, setNotifications] = useState(() => SEED_NOTIFICATIONS.map((n) => ({ ...n })));
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("n1");
  const [showDetail, setShowDetail] = useState(true);

  const filtered = filter === "updates"
    ? notifications.filter((n) => ["comment", "status", "assignment"].includes(n.type))
    : filter === "mentions"
    ? notifications.filter((n) => n.type === "mention")
    : notifications;

  const handleSelect = (id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setSelectedId(id);
    setShowDetail(true);
  };

  return (
    <div className="bg-surface h-full flex">
      {/* Left: Notification feed */}
      <div className={`${showDetail && selectedId ? "w-[420px]" : "flex-1"} shrink-0 flex flex-col border-r border-divider`}>
        {/* Tab bar */}
        <div className="flex items-center justify-between px-[14px] pt-[24px] pb-[12px] shrink-0 border-b border-divider">
          <div className="flex items-center gap-[2px]">
            {[
              { key: "all", label: "All Inboxes" },
              { key: "updates", label: "Updates" },
              { key: "mentions", label: "Mentions" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-[13px] px-[10px] py-[5px] rounded-[6px] transition-colors ${filter === f.key ? "bg-surface-active font-medium text-text-primary" : "text-text-secondary hover:bg-hover hover:text-text-primary"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-[2px]">
            <button className="p-[5px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover"><InboxIcon size={15} /></button>
            <button className="p-[5px] rounded-md text-text-tertiary hover:text-text-primary hover:bg-hover"><Bell size={15} /></button>
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto px-[8px] py-[8px]">
          <div className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-[14px] py-[6px]">Today</div>
          <div className="space-y-[2px]">
            {filtered.map((n) => (
              <NotificationItem key={n.id} n={n} selected={selectedId === n.id} onSelect={handleSelect} />
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-[40px] text-text-tertiary">
                <InboxIcon size={32} strokeWidth={1.5} className="mb-[8px] opacity-40" />
                <p className="text-[14px]">No notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Task detail */}
      {showDetail && selectedId && (
        <TaskDetailPanel task={TASK_DETAIL} onClose={() => { setShowDetail(false); setSelectedId(null); }} />
      )}
    </div>
  );
}
