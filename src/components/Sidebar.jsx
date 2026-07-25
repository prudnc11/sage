import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Inbox,
  FileText,
  Search,
  HelpCircle,
  PlusCircle,
  LayoutGrid,
  PanelLeft,
  Code2,
  ArrowLeftRight,
  SquareCheckBig,
  Diamond,
  Zap,
  Map,
  Clock,
  Settings,
  Shield,
  CircleAlert,
  SignalLow,
} from "lucide-react";
import { IssueStatusIcon, Avatar } from "./shared";

function PostmanIcon({ size = 14, className = "" }) {
  return (
    <svg viewBox="0 0 256 256" width={size} height={size} className={className} fill="currentColor">
      <path d="M181.806 54.086l-52.728 52.728 22.076 22.076c1.728-0.578 3.564-0.897 5.473-0.897 9.636 0 17.449 7.813 17.449 17.449 0 1.909-0.319 3.745-0.897 5.473l20.627 20.627c35.2-35.2 35.2-82.256 0-117.456zM120.48 115.412l-53.578 53.578c32.946 35.946 86.624 38.846 122.854 8.65l-20.627-20.627c-1.728 0.578-3.564 0.897-5.473 0.897-9.636 0-17.449-7.813-17.449-17.449 0-1.909 0.319-3.745 0.897-5.473l-22.076-22.076-4.548 4.548v-2.048zM128 0C57.308 0 0 57.308 0 128s57.308 128 128 128 128-57.308 128-128S198.692 0 128 0zM58.304 177.588c-1.382-1.382-1.382-3.623 0-5.005l53.578-53.578-4.548-4.548 52.728-52.728c38.4 38.4 38.4 100.712 0 139.112-0.038 0.038-0.077 0.073-0.115 0.111l-0.339 0.339c-36.614 33.454-93.078 30.522-126.27-3.67l24.966-24.966v4.933z" />
    </svg>
  );
}

function NavItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `inline-flex items-center ${collapsed ? "justify-center p-[8px]" : "gap-[10px] px-[10px] py-[6px]"} rounded-md cursor-pointer text-[13px] overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${isActive ? "bg-white text-black font-medium" : "text-text-primary bg-surface-pill"}`
      }
    >
      <Icon size={16} strokeWidth={1.75} className="shrink-0" />
      <span className={`truncate transition-all duration-300 ease-out ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>{label}</span>
    </NavLink>
  );
}

function TeamSubItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `inline-flex items-center ${collapsed ? "justify-center p-[8px]" : "gap-[8px] ml-[18px] px-[10px] py-[5px]"} rounded-md cursor-pointer text-[13px] overflow-hidden whitespace-nowrap transition-all duration-300 ease-out ${isActive ? "bg-white text-black font-medium" : "text-text-primary bg-surface-pill"}`
      }
    >
      <Icon size={14} strokeWidth={1.75} className="shrink-0" />
      <span className={`truncate transition-all duration-300 ease-out ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [engineeringOpen, setEngineeringOpen] = useState(true);
  const [platformOpen, setPlatformOpen] = useState(false);

  return (
    <aside className={`${collapsed ? "w-[56px]" : "w-[232px]"} shrink-0 bg-sidebar h-screen flex flex-col select-none transition-all duration-300 ease-out ml-[16px]`}>
      {/* Workspace */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 h-[44px] overflow-hidden`}>
        <div className="flex items-center gap-[10px] cursor-pointer min-w-0">
          <div className="w-[22px] h-[22px] rounded-[5px] bg-[#5e6ad2] flex items-center justify-center overflow-hidden shrink-0">
            <span className="text-[11px] font-bold text-white leading-none">S</span>
          </div>
          <span className={`text-[13px] font-semibold text-text-primary whitespace-nowrap transition-all duration-300 ease-out ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>Sage</span>
          <ChevronDown size={13} className={`text-text-primary ml-[-4px] shrink-0 transition-all duration-300 ease-out ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`} />
        </div>
        <button onClick={onToggle} className={`p-[5px] rounded-md hover:bg-surface-pill text-text-primary shrink-0 transition-all duration-300 ease-out ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}>
          <PanelLeft size={16} strokeWidth={1.75} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-[6px] pt-1 pb-2 flex flex-col items-start gap-[4px]">
        <NavItem to="/" icon={LayoutGrid} label="My Issues" collapsed={collapsed} />
        <NavItem to="/inbox" icon={Inbox} label="Inbox" collapsed={collapsed} />
        <NavItem to="/notes" icon={FileText} label="My Notes" collapsed={collapsed} />

        {/* Workspace */}
        <div className="mt-6 flex flex-col items-start gap-[4px] w-full">
          <div
            onClick={() => setWorkspaceOpen(!workspaceOpen)}
            className={`inline-flex items-center gap-[5px] px-[10px] py-[4px] cursor-pointer overflow-hidden transition-all duration-300 ease-out ${collapsed ? "h-0 opacity-0" : "h-auto opacity-100"}`}
          >
            <ChevronRight size={13} className={`text-text-primary shrink-0 transition-transform duration-200 ${workspaceOpen ? "rotate-90" : ""}`} />
            <span className="text-[13px] font-normal text-text-primary whitespace-nowrap">Workspace</span>
          </div>
          <div className={`flex flex-col items-start gap-[4px] overflow-hidden transition-all duration-300 ease-out ${!collapsed && workspaceOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}>
            <NavItem to="/automations" icon={Zap} label="Automations" collapsed={collapsed} />
            <NavItem to="/roadmap" icon={Map} label="Roadmap" collapsed={collapsed} />
            <NavItem to="/time-tracking" icon={Clock} label="Time Tracking" collapsed={collapsed} />
          </div>
          {collapsed && (
            <>
              <NavItem to="/automations" icon={Zap} label="Automations" collapsed={collapsed} />
              <NavItem to="/roadmap" icon={Map} label="Roadmap" collapsed={collapsed} />
              <NavItem to="/time-tracking" icon={Clock} label="Time Tracking" collapsed={collapsed} />
            </>
          )}
        </div>

        {/* Teams */}
        <div className="mt-6 flex flex-col items-start gap-[4px] w-full">
          <div className={`inline-flex items-center gap-[5px] px-[10px] py-[4px] cursor-pointer overflow-hidden transition-all duration-300 ease-out ${collapsed ? "h-0 opacity-0" : "h-auto opacity-100"}`}>
            <span className="text-[13px] font-normal text-text-primary whitespace-nowrap">Teams</span>
          </div>

          {/* Engineering */}
          <div
            onClick={() => setEngineeringOpen(!engineeringOpen)}
            className={`inline-flex items-center ${collapsed ? "justify-center p-[8px]" : "gap-[7px] px-[10px] py-[5px]"} rounded-md cursor-pointer overflow-hidden whitespace-nowrap transition-all duration-300 ease-out`}
            title="Engineering"
          >
            <div className="w-[22px] h-[22px] rounded-[6px] bg-[#88C695] flex items-center justify-center shrink-0">
              <Code2 size={13} strokeWidth={2} className="text-black" />
            </div>
            <span className={`text-[13px] font-normal text-text-primary transition-all duration-300 ease-out ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>Engineering</span>
            <ChevronRight size={13} className={`text-text-primary shrink-0 transition-all duration-300 ease-out ${collapsed ? "w-0 opacity-0" : `w-auto opacity-100 ${engineeringOpen ? "rotate-90" : ""}`}`} />
          </div>
          <div className={`flex flex-col items-start gap-[4px] overflow-hidden transition-all duration-300 ease-out ${!collapsed && engineeringOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}>
            <TeamSubItem to="/team/engineering/triage" icon={ArrowLeftRight} label="Triage" collapsed={collapsed} />
            <TeamSubItem to="/team/engineering/issues" icon={SquareCheckBig} label="Issues" collapsed={collapsed} />
            <TeamSubItem to="/team/engineering/views" icon={PostmanIcon} label="Postman" collapsed={collapsed} />
          </div>

          {/* Platform */}
          <div
            onClick={() => setPlatformOpen(!platformOpen)}
            className={`inline-flex items-center ${collapsed ? "justify-center p-[8px]" : "gap-[7px] px-[10px] py-[5px]"} rounded-md cursor-pointer overflow-hidden whitespace-nowrap transition-all duration-300 ease-out`}
            title="Side Quests"
          >
            <div className="w-[22px] h-[22px] rounded-[6px] bg-[#B39DDB] flex items-center justify-center shrink-0">
              <Shield size={13} strokeWidth={2} className="text-black" />
            </div>
            <span className={`text-[13px] font-normal text-text-primary transition-all duration-300 ease-out ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>Side Quests</span>
            <ChevronRight size={13} className={`text-text-primary shrink-0 transition-all duration-300 ease-out ${collapsed ? "w-0 opacity-0" : `w-auto opacity-100 ${platformOpen ? "rotate-90" : ""}`}`} />
          </div>
          <div className={`flex flex-col items-start gap-[4px] overflow-hidden transition-all duration-300 ease-out ${!collapsed && platformOpen ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"}`}>
            <TeamSubItem to="/team/platform/triage" icon={ArrowLeftRight} label="Triage" collapsed={collapsed} />
            <TeamSubItem to="/team/platform/api-client" icon={Diamond} label="API Client" collapsed={collapsed} />
            <TeamSubItem to="/team/platform/views" icon={PostmanIcon} label="Postman" collapsed={collapsed} />
          </div>
        </div>

        {/* Settings */}
        <div className="mt-6 flex flex-col items-start gap-[4px] w-full">
          <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
        </div>
      </nav>

      {/* Issue detail card */}
      <div className={`mx-[8px] mb-[8px] rounded-lg border border-surface-card bg-surface-card overflow-hidden transition-all duration-300 ease-out ${collapsed ? "max-h-0 opacity-0 mb-0 border-transparent" : "max-h-[300px] opacity-100"}`}>
        <div className="p-[14px]">
          <div className="flex items-center justify-between mb-[8px]">
            <IssueStatusIcon variant="inReviewFilled" size={20} />
            <span className="text-[12px] text-text-tertiary tracking-tight">ENG-196</span>
          </div>
          <p className="text-[13px] font-normal text-text-primary leading-[1.35] mb-[10px]">
            Create Overview Section in Side Sidebar for Assignee, Labels, and Priority Stats
          </p>
          <div className="mb-[8px]">
            <span className="inline-flex items-center gap-[5px] text-[12px] text-[#2e7d32] dark:text-[#81c784] bg-[#e8f5e9] dark:bg-[#1b3a1e] rounded-[4px] px-[7px] py-[2px]">
              <span className="w-[7px] h-[7px] rounded-full bg-[#4caf50]"></span>
              Integrations
            </span>
          </div>
          <div className="flex items-center gap-[5px] text-[12px] text-text-secondary mb-[12px]">
            <CircleAlert size={13} strokeWidth={2} className="text-[#e53935]" />
            <span>Blocks</span>
            <IssueStatusIcon variant="inProgress" size={13} />
            <span>ENG-213</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[6px] text-[12px] text-text-secondary">
              <SignalLow size={14} strokeWidth={1.75} className="text-text-primary" />
              <span>Low</span>
            </div>
            <Avatar initials="AO" bg="bg-[#26a69a]" size={26} />
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className={`flex items-center ${collapsed ? "flex-col" : "justify-center"} gap-[2px] px-4 py-[10px]`}>
        <button onClick={onToggle} className={`p-[7px] rounded-md hover:bg-surface-pill text-text-primary overflow-hidden transition-all duration-300 ease-out ${collapsed ? "max-h-[40px] opacity-100" : "max-h-0 opacity-0 p-0"}`}>
          <PanelLeft size={20} strokeWidth={1.5} />
        </button>
        <button className="p-[7px] rounded-md hover:bg-surface-pill text-text-primary">
          <HelpCircle size={20} strokeWidth={1.5} />
        </button>
        <button className="p-[7px] rounded-md hover:bg-surface-pill text-text-primary">
          <PlusCircle size={20} strokeWidth={1.5} />
        </button>
        <button className="p-[7px] rounded-md hover:bg-surface-pill text-text-primary">
          <Search size={20} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
