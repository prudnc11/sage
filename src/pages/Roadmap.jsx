import {
  ChevronRight,
  AlertTriangle,
  Check,
  Plus,
} from "lucide-react";
import { Avatar } from "../components/shared";
import { INITIATIVES, ISSUES, getUserById, getInitiativeProgress, TEAMS } from "../data/store";

const QUARTERS = ["Q1 2027", "Q2 2027", "Q3 2027", "Q4 2027"];

function StatusDot({ status }) {
  const colors = {
    "on-track": "bg-[#4caf50]",
    "at-risk": "bg-[#f59e0b]",
    completed: "bg-accent",
    paused: "bg-text-tertiary",
  };
  return <div className={`w-[8px] h-[8px] rounded-full ${colors[status] || colors.paused}`}></div>;
}

function InitiativeBar({ initiative }) {
  const owner = getUserById(initiative.owner);
  const progress = getInitiativeProgress(initiative);
  const linkedIssues = ISSUES.filter((i) => initiative.issueIds.includes(i.id));
  const blockedCount = linkedIssues.filter((i) => i.blockedBy).length;
  const teams = initiative.teams.map((tid) => TEAMS.find((t) => t.id === tid)?.name).filter(Boolean);

  return (
    <div className="bg-surface-card border border-divider rounded-[12px] p-[16px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-[10px]">
        <div className="flex items-center gap-[8px]">
          <StatusDot status={initiative.status} />
          <span className="text-[14px] font-medium text-text-primary">{initiative.name}</span>
          {initiative.status === "at-risk" && (
            <span className="inline-flex items-center gap-[3px] bg-[#fff3e0] dark:bg-[#3e2a10] text-[#e65100] dark:text-[#ffcc80] rounded-[4px] px-[5px] py-[1px] text-[11px] font-medium">
              <AlertTriangle size={10} /> At risk
            </span>
          )}
          {initiative.status === "completed" && (
            <span className="inline-flex items-center gap-[3px] bg-[#e8eaf6] dark:bg-[#2a2d4a] text-accent rounded-[4px] px-[5px] py-[1px] text-[11px] font-medium">
              <Check size={10} /> Completed
            </span>
          )}
        </div>
        <div className="flex items-center gap-[6px]">
          <span className="text-[12px] text-text-tertiary">{initiative.targetQuarter}</span>
          {owner && <Avatar initials={owner.initials} bg={owner.bg} size={20} />}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-[10px]">
        <div className="flex items-center justify-between mb-[4px]">
          <span className="text-[12px] text-text-secondary">{progress}% complete</span>
          <span className="text-[12px] text-text-tertiary">{linkedIssues.length} issues</span>
        </div>
        <div className="h-[6px] rounded-full bg-surface-muted">
          <div
            className={`h-[6px] rounded-full transition-all ${initiative.status === "at-risk" ? "bg-[#f59e0b]" : initiative.status === "completed" ? "bg-accent" : "bg-[#4caf50]"}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-[12px] text-[12px] text-text-secondary">
        <span className="inline-flex items-center gap-[4px]">
          {teams.join(", ")}
        </span>
        {blockedCount > 0 && (
          <span className="inline-flex items-center gap-[3px] text-[#c62828] dark:text-[#ef9a9a]">
            <AlertTriangle size={11} /> {blockedCount} blocked
          </span>
        )}
      </div>
    </div>
  );
}

export default function Roadmap() {
  const active = INITIATIVES.filter((i) => i.status !== "completed");
  const completed = INITIATIVES.filter((i) => i.status === "completed");

  return (
    <div className="bg-surface min-h-full">
      <div className="px-6 pt-[24px] pb-[16px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-[20px]">
          <div>
            <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">Roadmap</h1>
            <p className="text-[13px] text-text-secondary mt-[2px]">Cross-team initiatives and quarterly planning</p>
          </div>
          <button className="inline-flex items-center gap-[6px] bg-accent text-white rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium hover:opacity-90 transition-colors">
            <Plus size={15} />
            New Initiative
          </button>
        </div>

        {/* Quarter headers */}
        <div className="grid grid-cols-4 gap-[12px] mb-[16px]">
          {QUARTERS.map((q) => (
            <div key={q} className="text-center">
              <span className="text-[12px] font-medium text-text-tertiary uppercase tracking-wider">{q}</span>
            </div>
          ))}
        </div>
        <div className="h-px bg-divider mb-[20px]"></div>

        {/* Active initiatives */}
        <div className="mb-[24px]">
          <div className="flex items-center gap-[8px] mb-[12px]">
            <span className="text-[13px] font-semibold text-text-primary">Active</span>
            <span className="text-[12px] text-text-tertiary">{active.length}</span>
          </div>
          <div className="grid gap-[10px]">
            {active.map((init) => <InitiativeBar key={init.id} initiative={init} />)}
          </div>
        </div>

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <div className="flex items-center gap-[8px] mb-[12px]">
              <span className="text-[13px] font-semibold text-text-secondary">Completed</span>
              <span className="text-[12px] text-text-tertiary">{completed.length}</span>
            </div>
            <div className="grid gap-[10px]">
              {completed.map((init) => <InitiativeBar key={init.id} initiative={init} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
