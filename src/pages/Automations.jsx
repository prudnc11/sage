import {
  Zap,
  Plus,
  ToggleLeft,
  ToggleRight,
  Play,
  ChevronRight,
  ArrowRight,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { AUTOMATION_RULES, TEAMS } from "../data/store";

function RuleCard({ rule }) {
  const team = TEAMS.find((t) => t.id === rule.team);
  return (
    <div className="bg-surface-card border border-divider rounded-[12px] p-[16px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-[10px]">
        <div className="flex items-center gap-[8px]">
          <div className={`w-[8px] h-[8px] rounded-full ${rule.enabled ? "bg-[#4caf50]" : "bg-text-tertiary"}`}></div>
          <span className="text-[13px] font-medium text-text-primary">{rule.name}</span>
        </div>
        <button className="text-text-tertiary hover:text-text-primary" aria-label={rule.enabled ? "Disable rule" : "Enable rule"}>
          {rule.enabled ? <ToggleRight size={20} className="text-accent" /> : <ToggleLeft size={20} />}
        </button>
      </div>

      {/* Flow */}
      <div className="flex items-center gap-[6px] mb-[12px] flex-wrap">
        <span className="inline-flex items-center gap-[4px] bg-[#e8eaf6] dark:bg-[#2a2d4a] text-[#5e6ad2] dark:text-[#9da5f0] rounded-[4px] px-[6px] py-[3px] text-[11px] font-medium">
          <Zap size={11} />
          {rule.trigger}
        </span>
        <ArrowRight size={12} className="text-text-tertiary" />
        <span className="inline-flex items-center bg-[#fff8e1] dark:bg-[#3e3510] text-[#f57f17] dark:text-[#fff176] rounded-[4px] px-[6px] py-[3px] text-[11px] font-medium">
          {rule.condition}
        </span>
        <ArrowRight size={12} className="text-text-tertiary" />
        <span className="inline-flex items-center bg-[#e8f5e9] dark:bg-[#1b3a1e] text-[#2e7d32] dark:text-[#81c784] rounded-[4px] px-[6px] py-[3px] text-[11px] font-medium">
          {rule.action}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[12px] text-text-secondary">
        <span className="inline-flex items-center gap-[4px]">
          <Activity size={12} />
          {rule.executions} executions
        </span>
        <span>{team?.name}</span>
      </div>
    </div>
  );
}

export default function Automations() {
  const enabled = AUTOMATION_RULES.filter((r) => r.enabled);
  const disabled = AUTOMATION_RULES.filter((r) => !r.enabled);

  return (
    <div className="bg-surface min-h-full">
      <div className="px-6 pt-[24px] pb-[16px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-[20px]">
          <div>
            <h1 className="text-[18px] font-semibold text-text-primary tracking-tight">Workflow Automations</h1>
            <p className="text-[13px] text-text-secondary mt-[2px]">Automate status transitions, assignments, and notifications with rule-based triggers</p>
          </div>
          <button className="inline-flex items-center gap-[6px] bg-accent text-white rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium hover:opacity-90 transition-colors">
            <Plus size={15} />
            New Rule
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-[12px] mb-[24px]">
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">Active Rules</span>
            <div className="text-[24px] font-semibold text-text-primary mt-[2px]">{enabled.length}</div>
          </div>
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">Total Executions</span>
            <div className="text-[24px] font-semibold text-text-primary mt-[2px]">{AUTOMATION_RULES.reduce((s, r) => s + r.executions, 0)}</div>
          </div>
          <div className="bg-surface-card border border-divider rounded-[12px] p-[16px]">
            <span className="text-[12px] text-text-secondary">Auto-Transition Rate</span>
            <div className="text-[24px] font-semibold text-accent mt-[2px]">42%</div>
          </div>
        </div>

        {/* Dry-run banner */}
        <div className="flex items-center gap-[8px] bg-[#fff8e1] dark:bg-[#3e3510] border border-[#ffe082] dark:border-[#5a4a1a] rounded-[8px] px-[14px] py-[10px] mb-[20px] text-[13px]">
          <AlertTriangle size={15} className="text-[#f57f17] shrink-0" />
          <span className="text-[#5d4037] dark:text-[#fff176]">
            <strong>Dry-run mode available</strong> — test rules against existing issues before enabling
          </span>
          <button className="ml-auto inline-flex items-center gap-[4px] text-[#f57f17] font-medium hover:underline text-[12px]" aria-label="Try dry-run mode">
            <Play size={12} /> Try it
          </button>
        </div>

        {/* Active rules */}
        <div className="mb-[20px]">
          <div className="flex items-center gap-[8px] mb-[10px]">
            <span className="text-[13px] font-semibold text-text-primary">Active</span>
            <span className="text-[12px] text-text-tertiary">{enabled.length}</span>
          </div>
          <div className="grid gap-[10px]">
            {enabled.map((r) => <RuleCard key={r.id} rule={r} />)}
          </div>
        </div>

        {/* Disabled rules */}
        {disabled.length > 0 && (
          <div>
            <div className="flex items-center gap-[8px] mb-[10px]">
              <span className="text-[13px] font-semibold text-text-secondary">Disabled</span>
              <span className="text-[12px] text-text-tertiary">{disabled.length}</span>
            </div>
            <div className="grid gap-[10px]">
              {disabled.map((r) => <RuleCard key={r.id} rule={r} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
