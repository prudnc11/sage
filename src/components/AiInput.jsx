import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Globe,
  SquareCode,
  Paperclip,
  Mic,
  ArrowUp,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { ISSUES, USERS, TEAMS, INITIATIVES, AUTOMATION_RULES, TIME_ENTRIES, getUserById, formatDuration, getInitiativeProgress } from "../data/store";

function ActionPill({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-0 hover:gap-[6px] border rounded-full p-[8px] hover:pr-[14px] text-[12px] transition-all duration-250 ease-out ${
        active
          ? "border-[#8AC994] bg-[#8AC994] text-black gap-[6px] pr-[14px]"
          : "border-divider text-text-primary hover:bg-[#8AC994] hover:border-[#8AC994] hover:text-black hover:scale-105 hover:shadow-[0_2px_8px_rgba(138,201,148,0.3)]"
      }`}
    >
      <Icon size={14} strokeWidth={1.75} className={`transition-transform duration-250 ${active ? "rotate-12" : "group-hover:rotate-12"}`} />
      <span className={`overflow-hidden whitespace-nowrap transition-all duration-250 ease-out ${active ? "max-w-[80px] opacity-100" : "max-w-0 opacity-0 group-hover:max-w-[80px] group-hover:opacity-100"}`}>{label}</span>
    </button>
  );
}

function MessageBubble({ message, onCopy }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex gap-[10px] ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 mt-[2px] ${isUser ? "bg-[#5e6ad2]" : "bg-[#8AC994]"}`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-black" />}
      </div>
      <div className={`flex flex-col gap-[4px] max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-[16px] px-[14px] py-[10px] text-[13px] leading-[1.55] whitespace-pre-wrap ${
          isUser
            ? "bg-[#5e6ad2] text-white rounded-br-[4px]"
            : "bg-surface-card border border-divider text-text-primary rounded-bl-[4px]"
        }`}>
          {message.content}
        </div>
        {!isUser && (
          <button onClick={handleCopy} className="p-[4px] text-text-tertiary hover:text-text-primary transition-colors">
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

function generateResponse(query, mode) {
  const q = query.toLowerCase();

  // Issue lookups
  if (q.match(/eng-\d+|plt-\d+|des-\d+/i)) {
    const issueId = q.match(/(eng-\d+|plt-\d+|des-\d+)/i)[1].toUpperCase();
    const issue = ISSUES.find(i => i.id === issueId);
    if (issue) {
      const assignee = issue.assignee ? getUserById(issue.assignee)?.name : "Unassigned";
      const time = issue.timeLogged > 0 ? formatDuration(issue.timeLogged) : "None";
      return `**${issue.id}: ${issue.title}**\n\nStatus: ${issue.variant.replace(/([A-Z])/g, ' $1').trim()}\nPriority: ${issue.priority}\nAssignee: ${assignee}\nLabels: ${issue.labels.join(", ")}\nTime logged: ${time}${issue.blockedBy ? `\nBlocked by: ${issue.blockedBy}` : ""}${issue.subIssues ? `\nSub-issues: ${issue.subIssues}` : ""}`;
    }
    return `No issue found with ID "${issueId}".`;
  }

  // Team queries
  if (q.includes("team") || q.includes("member") || q.includes("who")) {
    if (q.includes("engineering") || q.includes("eng")) {
      const engIssues = ISSUES.filter(i => i.team === "t1");
      const inProgress = engIssues.filter(i => i.variant === "inProgress").length;
      const done = engIssues.filter(i => i.variant === "done").length;
      return `**Engineering Team**\n\n${engIssues.length} total issues\nIn Progress: ${inProgress}\nCompleted: ${done}\n\nMembers working on Engineering issues:\n${[...new Set(engIssues.filter(i => i.assignee).map(i => getUserById(i.assignee)?.name))].map(n => `- ${n}`).join("\n")}`;
    }
    const teamSummary = TEAMS.map(t => {
      const count = ISSUES.filter(i => i.team === t.id).length;
      return `- **${t.name}** (${t.prefix}): ${count} issues`;
    }).join("\n");
    return `**Teams Overview**\n\n${teamSummary}\n\n**Members:**\n${USERS.map(u => `- ${u.name}`).join("\n")}`;
  }

  // Status / summary queries
  if (q.includes("status") || q.includes("summary") || q.includes("overview") || q.includes("how") || q.includes("dashboard")) {
    const byStatus = {
      inProgress: ISSUES.filter(i => i.variant === "inProgress").length,
      inReviewFilled: ISSUES.filter(i => i.variant === "inReviewFilled").length,
      todo: ISSUES.filter(i => i.variant === "todo").length,
      backlog: ISSUES.filter(i => i.variant === "backlog").length,
      done: ISSUES.filter(i => i.variant === "done").length,
      cancelled: ISSUES.filter(i => i.variant === "cancelled").length,
    };
    return `**Project Status Overview**\n\nTotal issues: ${ISSUES.length}\n\nIn Progress: ${byStatus.inProgress}\nIn Review: ${byStatus.inReviewFilled}\nTodo: ${byStatus.todo}\nBacklog: ${byStatus.backlog}\nDone: ${byStatus.done}\nCancelled: ${byStatus.cancelled}\n\nUrgent items: ${ISSUES.filter(i => i.priority === "urgent").length}\nBlocked items: ${ISSUES.filter(i => i.blockedBy).length}`;
  }

  // Urgent / priority queries
  if (q.includes("urgent") || q.includes("priority") || q.includes("critical") || q.includes("important") || q.includes("blocked")) {
    const urgent = ISSUES.filter(i => i.priority === "urgent");
    const blocked = ISSUES.filter(i => i.blockedBy);
    let res = `**High Priority Items**\n\nUrgent issues (${urgent.length}):\n`;
    res += urgent.map(i => `- ${i.id}: ${i.title} [${i.variant}]`).join("\n");
    if (blocked.length > 0) {
      res += `\n\nBlocked issues (${blocked.length}):\n`;
      res += blocked.map(i => `- ${i.id}: ${i.title} (blocked by ${i.blockedBy})`).join("\n");
    }
    return res;
  }

  // Automation queries
  if (q.includes("automation") || q.includes("rule") || q.includes("workflow")) {
    const active = AUTOMATION_RULES.filter(r => r.enabled);
    const totalExec = AUTOMATION_RULES.reduce((s, r) => s + r.executions, 0);
    let res = `**Automation Rules**\n\nActive: ${active.length}/${AUTOMATION_RULES.length}\nTotal executions: ${totalExec}\n\nRules:\n`;
    res += AUTOMATION_RULES.map(r => `- ${r.enabled ? "ON" : "OFF"} | ${r.name}\n  Trigger: ${r.trigger} | Action: ${r.action} (${r.executions} runs)`).join("\n");
    return res;
  }

  // Roadmap / initiative queries
  if (q.includes("roadmap") || q.includes("initiative") || q.includes("quarter") || q.includes("plan")) {
    let res = "**Initiatives & Roadmap**\n\n";
    res += INITIATIVES.map(init => {
      const progress = getInitiativeProgress(init);
      const owner = getUserById(init.owner)?.name || "Unknown";
      return `- **${init.name}** (${init.status})\n  Owner: ${owner} | Target: ${init.targetQuarter} | Progress: ${progress}%`;
    }).join("\n");
    return res;
  }

  // Time tracking queries
  if (q.includes("time") || q.includes("hour") || q.includes("track") || q.includes("log")) {
    const totalSeconds = TIME_ENTRIES.reduce((s, e) => s + e.duration, 0);
    const byUser = {};
    TIME_ENTRIES.forEach(e => {
      const name = getUserById(e.user)?.name || e.user;
      byUser[name] = (byUser[name] || 0) + e.duration;
    });
    let res = `**Time Tracking Summary**\n\nTotal logged: ${formatDuration(totalSeconds)}\nEntries: ${TIME_ENTRIES.length}\n\nBy team member:\n`;
    res += Object.entries(byUser).sort((a, b) => b[1] - a[1]).map(([name, secs]) => `- ${name}: ${formatDuration(secs)}`).join("\n");
    return res;
  }

  // Assignee queries
  if (q.includes("assign") || q.includes("workload") || q.includes("who is")) {
    const byAssignee = {};
    ISSUES.forEach(i => {
      const name = i.assignee ? getUserById(i.assignee)?.name : "Unassigned";
      byAssignee[name] = (byAssignee[name] || 0) + 1;
    });
    let res = "**Workload Distribution**\n\n";
    res += Object.entries(byAssignee).sort((a, b) => b[1] - a[1]).map(([name, count]) => `- ${name}: ${count} issues`).join("\n");
    return res;
  }

  // Search issues by keyword
  const matchingIssues = ISSUES.filter(i => i.title.toLowerCase().includes(q) || i.labels.some(l => l.toLowerCase().includes(q)));
  if (matchingIssues.length > 0 && matchingIssues.length <= 8) {
    let res = `Found ${matchingIssues.length} matching issue${matchingIssues.length > 1 ? "s" : ""}:\n\n`;
    res += matchingIssues.map(i => {
      const assignee = i.assignee ? getUserById(i.assignee)?.name : "Unassigned";
      return `- **${i.id}**: ${i.title}\n  ${i.variant} | ${i.priority} | ${assignee}`;
    }).join("\n");
    return res;
  }

  // Default contextual help
  return `I can help you explore the Sage workspace. Try asking about:\n\n- **Issue details** — "Tell me about ENG-210"\n- **Project status** — "Give me a status overview"\n- **Urgent items** — "What's urgent or blocked?"\n- **Teams** — "Show me the engineering team"\n- **Automations** — "What automation rules are active?"\n- **Roadmap** — "What are the current initiatives?"\n- **Time tracking** — "How much time has been logged?"\n- **Workload** — "Who has the most issues?"`;
}

export default function AiInput() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { role: "user", content: text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(text, mode);
      setMessages(prev => [...prev, { role: "assistant", content: response, id: Date.now() }]);
      setIsTyping(false);
    }, 400 + Math.random() * 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setMode(null);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages area */}
      {hasMessages ? (
        <div className="flex-1 overflow-y-auto p-[16px] flex flex-col gap-[16px] min-h-0">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className="flex gap-[10px]">
              <div className="w-[28px] h-[28px] rounded-full bg-[#8AC994] flex items-center justify-center shrink-0 mt-[2px]">
                <Bot size={14} className="text-black" />
              </div>
              <div className="rounded-[16px] rounded-bl-[4px] px-[14px] py-[10px] bg-surface-card border border-divider">
                <div className="flex gap-[4px]">
                  <span className="w-[6px] h-[6px] rounded-full bg-text-tertiary animate-bounce [animation-delay:0ms]" />
                  <span className="w-[6px] h-[6px] rounded-full bg-text-tertiary animate-bounce [animation-delay:150ms]" />
                  <span className="w-[6px] h-[6px] rounded-full bg-text-tertiary animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-[16px] gap-[8px]">
          <div className="w-[40px] h-[40px] rounded-full bg-[#8AC994]/15 flex items-center justify-center">
            <Sparkles size={20} className="text-[#8AC994]" />
          </div>
          <p className="text-[14px] font-medium text-text-primary">Sage AI</p>
          <p className="text-[12px] text-text-tertiary text-center max-w-[220px]">Ask about issues, teams, roadmap, automations, or time tracking</p>
        </div>
      )}

      {/* Input container */}
      <div className="p-[16px] pt-0">
        <div className="bg-surface-card rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-divider px-[18px] pt-[14px] pb-[12px]">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything, or paste a brief..."
            rows={1}
            className="w-full resize-none bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary outline-none leading-[1.5] mb-[12px]"
          />

          <div className="flex items-center justify-between gap-[8px]">
            <div className="flex items-center gap-[6px]">
              <ActionPill icon={Sparkles} label="Reason" active={mode === "reason"} onClick={() => setMode(mode === "reason" ? null : "reason")} />
              <ActionPill icon={Globe} label="Search" active={mode === "search"} onClick={() => setMode(mode === "search" ? null : "search")} />
              <ActionPill icon={SquareCode} label="Code" active={mode === "code"} onClick={() => setMode(mode === "code" ? null : "code")} />
            </div>

            <div className="flex items-center gap-[4px] shrink-0">
              {hasMessages && (
                <button onClick={handleClear} className="p-[5px] text-text-tertiary hover:text-[#e53935] transition-colors" title="Clear chat">
                  <Trash2 size={16} strokeWidth={1.75} />
                </button>
              )}
              <button className="p-[5px] text-text-primary hover:text-text-secondary transition-colors">
                <Paperclip size={18} strokeWidth={1.75} />
              </button>
              <button className="p-[5px] text-text-primary hover:text-text-secondary transition-colors">
                <Mic size={18} strokeWidth={1.75} />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all ${
                  input.trim() && !isTyping
                    ? "bg-[#8AC994] hover:bg-[#78b883] cursor-pointer"
                    : "bg-text-tertiary/30 cursor-not-allowed"
                }`}
              >
                <ArrowUp size={16} strokeWidth={2} className="text-black" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-[16px] mt-[8px] text-[11px] text-text-tertiary">
          <span className="inline-flex items-center gap-[4px]">
            <kbd className="inline-flex items-center justify-center bg-surface-pill text-text-tertiary rounded-[3px] px-[4px] py-[1px] text-[10px] font-medium leading-none">↵</kbd>
            send
          </span>
          <span className="inline-flex items-center gap-[4px]">
            <kbd className="inline-flex items-center justify-center bg-surface-pill text-text-tertiary rounded-[3px] px-[4px] py-[1px] text-[10px] font-medium leading-none">⇧</kbd>
            <kbd className="inline-flex items-center justify-center bg-surface-pill text-text-tertiary rounded-[3px] px-[4px] py-[1px] text-[10px] font-medium leading-none">↵</kbd>
            new line
          </span>
        </div>
      </div>
    </div>
  );
}
