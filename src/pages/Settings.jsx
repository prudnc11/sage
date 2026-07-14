import { useState } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Users,
  Key,
  FileText,
  Bell,
  ChevronRight,
} from "lucide-react";
import { Avatar } from "../components/shared";
import { USERS, TEAMS } from "../data/store";

const TABS = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "members", label: "Members", icon: Users },
  { id: "sso", label: "SSO / SCIM", icon: Key },
  { id: "audit", label: "Audit Log", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const CUSTOM_ROLES = [
  { name: "Workspace Admin", permissions: "Full access to all workspace settings, teams, and data", members: 1 },
  { name: "Team Lead", permissions: "Manage team members, rules, cycles, and labels", members: 2 },
  { name: "Member", permissions: "Create and edit issues, log time, view roadmaps", members: 3 },
  { name: "Guest", permissions: "View-only access to assigned issues", members: 0 },
  { name: "Billing Manager", permissions: "Manage subscription and billing — custom enterprise role", members: 1, custom: true },
];

const AUDIT_LOG = [
  { action: "Rule enabled", detail: "Auto-assign bug reports", user: "u1", time: "2 hours ago" },
  { action: "Issue created", detail: "ENG-222: Add infinite-loop protection", user: "u1", time: "3 hours ago" },
  { action: "SSO configured", detail: "SAML provider added", user: "u5", time: "1 day ago" },
  { action: "Member invited", detail: "fatima@pulseboard.io", user: "u1", time: "2 days ago" },
  { action: "Role modified", detail: "Billing Manager role created", user: "u1", time: "3 days ago" },
  { action: "Rule disabled", detail: "Auto-label security issues", user: "u3", time: "4 days ago" },
];

export default function Settings() {
  const [tab, setTab] = useState("general");

  return (
    <div className="bg-surface min-h-full">
      <div className="px-6 pt-[24px] pb-[16px]">
        <h1 className="text-[18px] font-semibold text-text-primary tracking-tight mb-[20px]">Settings</h1>

        <div className="flex gap-[24px]">
          {/* Tab nav */}
          <div className="w-[180px] shrink-0 flex flex-col gap-[2px]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-[8px] px-[10px] py-[7px] rounded-[8px] text-[13px] text-left transition-colors ${tab === t.id ? "bg-surface-pill font-medium text-text-primary" : "text-text-secondary hover:bg-hover"}`}
              >
                <t.icon size={15} strokeWidth={1.75} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 max-w-[640px]">
            {/* General */}
            {tab === "general" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px] space-y-[16px]">
                <h2 className="text-[14px] font-semibold text-text-primary">Workspace</h2>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">Workspace Name</label>
                  <input defaultValue="Pulseboard" className="w-full rounded-[8px] border border-border-input bg-hover px-[12px] py-[8px] text-[13px] text-text-primary focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">URL Slug</label>
                  <input defaultValue="pulseboard" className="w-full rounded-[8px] border border-border-input bg-hover px-[12px] py-[8px] text-[13px] text-text-primary focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">Plan</label>
                  <div className="flex items-center gap-[8px]">
                    <span className="inline-flex items-center bg-[#e8eaf6] dark:bg-[#2a2d4a] text-accent rounded-[4px] px-[8px] py-[3px] text-[12px] font-medium">Enterprise</span>
                    <span className="text-[12px] text-text-tertiary">Cross-workspace, custom roles, SSO/SCIM</span>
                  </div>
                </div>
                <div className="pt-[8px]">
                  <button className="bg-accent text-white rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium hover:opacity-90 transition-colors">Save Changes</button>
                </div>
              </div>
            )}

            {/* Roles */}
            {tab === "roles" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px]">
                <div className="flex items-center justify-between mb-[16px]">
                  <h2 className="text-[14px] font-semibold text-text-primary">Roles</h2>
                  <button className="text-[12px] font-medium text-accent hover:underline">+ Custom Role</button>
                </div>
                <div className="space-y-[2px]">
                  {CUSTOM_ROLES.map((role) => (
                    <div key={role.name} className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] hover:bg-hover cursor-pointer">
                      <Shield size={15} className={role.custom ? "text-accent" : "text-text-tertiary"} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[6px]">
                          <span className="text-[13px] font-medium text-text-primary">{role.name}</span>
                          {role.custom && <span className="text-[10px] bg-[#e8eaf6] dark:bg-[#2a2d4a] text-accent rounded px-[4px] py-[1px] font-medium">Custom</span>}
                        </div>
                        <p className="text-[12px] text-text-secondary mt-[1px] truncate">{role.permissions}</p>
                      </div>
                      <span className="text-[12px] text-text-tertiary shrink-0">{role.members} members</span>
                      <ChevronRight size={14} className="text-text-tertiary" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            {tab === "members" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px]">
                <div className="flex items-center justify-between mb-[16px]">
                  <h2 className="text-[14px] font-semibold text-text-primary">Members</h2>
                  <button className="bg-accent text-white rounded-[8px] px-[12px] py-[5px] text-[12px] font-medium hover:opacity-90">Invite Member</button>
                </div>
                <div className="space-y-[2px]">
                  {USERS.map((u) => (
                    <div key={u.id} className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-[8px] hover:bg-hover">
                      <Avatar initials={u.initials} bg={u.bg} size={28} />
                      <div className="flex-1">
                        <span className="text-[13px] font-medium text-text-primary">{u.name}</span>
                      </div>
                      <span className="text-[12px] text-text-tertiary">Member</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SSO */}
            {tab === "sso" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px] space-y-[16px]">
                <h2 className="text-[14px] font-semibold text-text-primary">SSO / SCIM Provisioning</h2>
                <p className="text-[13px] text-text-secondary">Automatically provision and deprovision users via your identity provider.</p>
                <div className="bg-[#e8f5e9] dark:bg-[#1b3a1e] border border-[#c8e6c9] dark:border-[#2e5a30] rounded-[8px] px-[14px] py-[10px] text-[13px] text-[#2e7d32] dark:text-[#81c784] flex items-center gap-[8px]">
                  <div className="w-[8px] h-[8px] rounded-full bg-[#4caf50]"></div>
                  SAML SSO configured — Okta
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">SCIM Base URL</label>
                  <input defaultValue="https://api.pulseboard.io/scim/v2" readOnly className="w-full rounded-[8px] border border-border-input bg-surface-pill px-[12px] py-[8px] text-[13px] text-text-tertiary" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">SCIM Token</label>
                  <input defaultValue="••••••••••••••••" readOnly className="w-full rounded-[8px] border border-border-input bg-surface-pill px-[12px] py-[8px] text-[13px] text-text-tertiary" />
                </div>
              </div>
            )}

            {/* Audit Log */}
            {tab === "audit" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px]">
                <div className="flex items-center justify-between mb-[16px]">
                  <h2 className="text-[14px] font-semibold text-text-primary">Audit Log</h2>
                  <button className="text-[12px] font-medium text-accent hover:underline">Export</button>
                </div>
                <div className="space-y-[2px]">
                  {AUDIT_LOG.map((entry, i) => {
                    const user = getUserById(entry.user);
                    return (
                      <div key={i} className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-[8px] hover:bg-hover">
                        <Avatar initials={user?.initials || "?"} bg={user?.bg || "bg-[#bdbdbd]"} size={24} />
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] text-text-primary">{entry.action}</span>
                          <span className="text-[13px] text-text-tertiary"> — {entry.detail}</span>
                        </div>
                        <span className="text-[12px] text-text-tertiary shrink-0">{entry.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notifications */}
            {tab === "notifications" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px] space-y-[12px]">
                <h2 className="text-[14px] font-semibold text-text-primary">Notification Preferences</h2>
                {[
                  { label: "Assigned to me", desc: "When an issue is assigned to you", on: true },
                  { label: "Mentioned", desc: "When you're @mentioned in a comment", on: true },
                  { label: "Status changes", desc: "When an assigned issue changes status", on: true },
                  { label: "Automation alerts", desc: "When a rule is disabled due to loop detection", on: true },
                  { label: "Cross-workspace blocks", desc: "When a dependency in another workspace is blocked", on: false },
                ].map((n) => (
                  <label key={n.label} className="flex items-center justify-between py-[6px] cursor-pointer">
                    <div>
                      <span className="text-[13px] text-text-primary">{n.label}</span>
                      <p className="text-[12px] text-text-tertiary">{n.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked={n.on} className="w-[16px] h-[16px] rounded accent-accent" />
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getUserById(id) {
  return USERS.find((u) => u.id === id);
}
