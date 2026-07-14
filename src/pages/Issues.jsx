import {
  ChevronDown,
  Plus,
  X,
  Search,
  SlidersHorizontal,
  Star,
  SignalLow,
  Layers,
  Ban,
  CircleDot,
  CircleMinusIcon,
  Diamond,
  CircleAlert,
} from "lucide-react";
import { IssueStatusIcon, Avatar, GROUP_STYLES, LabelDot, PriorityBadge } from "../components/shared";
import { ISSUES, getUserById, getIssuesByStatus } from "../data/store";

function IssueRow({ issue }) {
  const assignee = issue.assignee ? getUserById(issue.assignee) : null;
  return (
    <div className="flex items-start gap-3 px-6 pt-[8px] hover:bg-hover cursor-pointer min-h-[36px] ml-[8px]">
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

function StatusGroup({ type, issues, first }) {
  const g = GROUP_STYLES[type];
  if (!g || issues.length === 0) return null;
  return (
    <div className={first ? "mt-1" : "mt-[16px]"}>
      <div className="flex items-center gap-[4px] px-6 py-[6px]">
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
        <IssueRow key={issue.id} issue={issue} />
      ))}
    </div>
  );
}

function FilterDropdown() {
  const items = [
    { icon: CircleDot, label: "Status" },
    { icon: CircleMinusIcon, label: "Assignee" },
    { icon: Diamond, label: "Label" },
    { icon: SignalLow, label: "Priority" },
    { icon: Star, label: "Parent" },
    { icon: Layers, label: "Sub-Issue" },
    { icon: Ban, label: "Blocked issues" },
    { icon: CircleAlert, label: "Blocking issues" },
  ];

  return (
    <div className="absolute top-[90px] right-[260px] w-[200px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_24px_rgba(0,0,0,0.12)] z-20 py-[4px]">
      <div className="flex items-center gap-[6px] px-3 py-[7px] border-b border-divider mx-[4px] mb-[2px]">
        <Search size={14} className="text-text-tertiary shrink-0" />
        <span className="text-[13px] text-text-tertiary">Filter...</span>
      </div>
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-[8px] px-3 py-[6px] mx-[4px] rounded-md text-[13px] text-text-primary cursor-pointer hover:bg-hover">
          <Icon size={15} strokeWidth={1.75} className="text-text-secondary shrink-0" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function AssigneeDropdown() {
  const members = [
    { initials: "", label: "No assignee", bg: "bg-[#bdbdbd]", icon: true },
    { initials: "HM", label: "Harshith Mullapudi", bg: "bg-[#43a047]", selected: true },
    { initials: "MA", label: "Manik Aggarwal", bg: "bg-[#7e57c2]" },
    { initials: "MR", label: "Manoj Reddy", bg: "bg-[#e65100]" },
  ];

  return (
    <div className="absolute bottom-[80px] right-[24px] w-[220px] bg-surface-card rounded-lg border border-divider shadow-[0_4px_24px_rgba(0,0,0,0.12)] z-20 py-[6px]">
      {members.map((m) => (
        <div key={m.label} className="flex items-center gap-[8px] px-3 py-[5px] mx-[4px] rounded-md text-[13px] cursor-pointer hover:bg-hover">
          <div className={`w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center shrink-0 ${m.selected ? "bg-accent border-accent" : "border-divider"}`}>
            {m.selected && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          {m.icon ? (
            <div className="w-[22px] h-[22px] rounded-[8px] bg-surface-muted flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="6" r="3" stroke="currentColor" className="text-text-tertiary" strokeWidth="1.5" />
                <path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" className="text-text-tertiary" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          ) : (
            <Avatar initials={m.initials} bg={m.bg} size={22} />
          )}
          <span className="text-text-primary truncate">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Issues() {
  const engIssues = ISSUES.filter((i) => i.team === "t1");
  const groups = ["inReviewFilled", "inProgress", "backlog", "done"];

  return (
    <div className="relative h-full">
      {/* Filter bar */}
      <div className="bg-surface">
        <div className="flex items-center gap-[12px] px-6 pt-[24px] pb-[8px]">
          <button className="inline-flex items-center gap-[6px] text-[13px] text-text-primary transition-colors bg-surface-card rounded-md px-[10px] py-[5px]">
            <SlidersHorizontal size={15} strokeWidth={1.75} className="text-text-primary" />
            <span className="font-medium">Filter</span>
          </button>
          <div className="w-px h-[18px] bg-divider"></div>
          <div className="flex items-center">
            <Avatar initials="MA" bg="bg-[#7e57c2]" size={24} border />
            <div className="-ml-[6px]"><Avatar initials="HM" bg="bg-[#43a047]" size={24} border /></div>
            <div className="-ml-[6px]"><Avatar initials="MR" bg="bg-[#e65100]" size={24} border /></div>
            <div className="-ml-[6px]"><Avatar initials="AO" bg="bg-[#26a69a]" size={24} border /></div>
          </div>
        </div>
        <div className="flex items-center gap-[8px] px-6 pb-[10px]">
          <Star size={14} strokeWidth={2} className="text-[#ffb300] fill-[#ffb300] shrink-0" />
          <div className="inline-flex items-center gap-[5px] bg-surface-muted rounded-[6px] px-[8px] py-[5px] text-[12px]">
            <SignalLow size={13} strokeWidth={2} className="text-text-secondary" />
            <span className="font-medium text-text-primary">Priority</span>
            <span className="text-text-tertiary">is any of</span>
            <span className="font-medium text-text-primary">2 priorities</span>
            <button className="ml-[2px] p-[1px] text-text-tertiary hover:text-text-primary rounded" aria-label="Remove priority filter">
              <X size={13} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Issue list */}
      <div className="overflow-y-auto pb-8">
        {groups.map((g, i) => (
          <StatusGroup key={g} type={g} issues={getIssuesByStatus(engIssues, g)} first={i === 0} />
        ))}
      </div>

      <FilterDropdown />
      <AssigneeDropdown />
    </div>
  );
}
