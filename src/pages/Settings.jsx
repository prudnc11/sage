import { useState, useCallback } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Users,
  Key,
  FileText,
  Bell,
  ChevronRight,
  Plus,
  X,
  Check,
  Trash2,
  Edit3,
  Copy,
  Eye,
  EyeOff,
  Download,
  Search,
} from "lucide-react";
import { Avatar } from "../components/shared";
import { USERS as SEED_USERS, TEAMS } from "../data/store";

const TABS = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "roles", label: "Roles & Permissions", icon: Shield },
  { id: "members", label: "Members", icon: Users },
  { id: "sso", label: "SSO / SCIM", icon: Key },
  { id: "audit", label: "Audit Log", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const SEED_ROLES = [
  { id: "role1", name: "Workspace Admin", permissions: "Full access to all workspace settings, teams, and data", members: 1 },
  { id: "role2", name: "Team Lead", permissions: "Manage team members, rules, cycles, and labels", members: 2 },
  { id: "role3", name: "Member", permissions: "Create and edit issues, log time, view roadmaps", members: 3 },
  { id: "role4", name: "Guest", permissions: "View-only access to assigned issues", members: 0 },
  { id: "role5", name: "Billing Manager", permissions: "Manage subscription and billing — custom enterprise role", members: 1, custom: true },
];

const SEED_AUDIT = [
  { id: "a1", action: "Rule enabled", detail: "Auto-assign bug reports", user: "u1", time: "2 hours ago" },
  { id: "a2", action: "Issue created", detail: "ENG-222: Add infinite-loop protection", user: "u1", time: "3 hours ago" },
  { id: "a3", action: "SSO configured", detail: "SAML provider added", user: "u5", time: "1 day ago" },
  { id: "a4", action: "Member invited", detail: "fatima@sage.io", user: "u1", time: "2 days ago" },
  { id: "a5", action: "Role modified", detail: "Billing Manager role created", user: "u1", time: "3 days ago" },
  { id: "a6", action: "Rule disabled", detail: "Auto-label security issues", user: "u3", time: "4 days ago" },
];

function getUserById(id) { return SEED_USERS.find((u) => u.id === id); }

export default function Settings() {
  const [tab, setTab] = useState("general");

  // General
  const [wsName, setWsName] = useState("Sage");
  const [wsSlug, setWsSlug] = useState("sage");
  const [saved, setSaved] = useState(false);

  // Roles
  const [roles, setRoles] = useState(() => [...SEED_ROLES]);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [rolePerms, setRolePerms] = useState("");

  // Members
  const [members, setMembers] = useState(() => [...SEED_USERS]);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [memberRoles, setMemberRoles] = useState(() => {
    const m = {};
    SEED_USERS.forEach((u) => { m[u.id] = "Member"; });
    m["u1"] = "Workspace Admin";
    return m;
  });

  // SSO
  const [ssoProvider, setSsoProvider] = useState("Okta");
  const [showToken, setShowToken] = useState(false);
  const token = "scim_live_xK9mP2qR5tU8vW1yA3bC6dE";

  // Audit
  const [auditLog, setAuditLog] = useState(() => [...SEED_AUDIT]);
  const [auditSearch, setAuditSearch] = useState("");

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState({
    assigned: true, mentioned: true, statusChanges: true, automationAlerts: true, crossWorkspace: false,
  });

  const handleSaveGeneral = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleCreateRole = () => {
    if (!roleName.trim()) return;
    setRoles((prev) => [...prev, { id: `role${Date.now()}`, name: roleName.trim(), permissions: rolePerms.trim() || "Custom permissions", members: 0, custom: true }]);
    setRoleName(""); setRolePerms(""); setNewRole(false);
  };

  const handleDeleteRole = (id) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) return;
    const initials = inviteEmail.split("@")[0].slice(0, 2).toUpperCase();
    const colors = ["bg-[#43a047]", "bg-[#7e57c2]", "bg-[#e65100]", "bg-[#26a69a]", "bg-[#5c6bc0]", "bg-[#e91e63]"];
    const newMember = { id: `u${Date.now()}`, name: inviteEmail.split("@")[0], initials, bg: colors[Math.floor(Math.random() * colors.length)] };
    setMembers((prev) => [...prev, newMember]);
    setMemberRoles((prev) => ({ ...prev, [newMember.id]: "Member" }));
    setAuditLog((prev) => [{ id: `a${Date.now()}`, action: "Member invited", detail: inviteEmail, user: "u1", time: "Just now" }, ...prev]);
    setInviteEmail(""); setInviting(false);
  };

  const handleRemoveMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setMemberRoles((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleExportAudit = () => {
    const csv = "Action,Detail,User,Time\n" + auditLog.map((e) => {
      const u = getUserById(e.user);
      return `"${e.action}","${e.detail}","${u?.name || "Unknown"}","${e.time}"`;
    }).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit-log.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filteredAudit = auditSearch
    ? auditLog.filter((e) => e.action.toLowerCase().includes(auditSearch.toLowerCase()) || e.detail.toLowerCase().includes(auditSearch.toLowerCase()))
    : auditLog;

  return (
    <div className="bg-surface min-h-full overflow-y-auto">
      <div className="px-6 pt-[24px] pb-[16px]">
        <h1 className="text-[18px] font-semibold text-text-primary tracking-tight mb-[20px]">Settings</h1>
        <div className="flex gap-[24px]">
          {/* Tab nav */}
          <div className="w-[180px] shrink-0 flex flex-col gap-[2px]">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`inline-flex items-center gap-[8px] px-[10px] py-[7px] rounded-[8px] text-[13px] text-left transition-colors ${tab === t.id ? "bg-surface-pill font-medium text-text-primary" : "text-text-secondary hover:bg-hover"}`}>
                <t.icon size={15} strokeWidth={1.75} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 max-w-[640px]">
            {/* ── General ── */}
            {tab === "general" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px] space-y-[16px]">
                <h2 className="text-[14px] font-semibold text-text-primary">Workspace</h2>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">Workspace Name</label>
                  <input value={wsName} onChange={(e) => setWsName(e.target.value)} className="w-full rounded-[8px] border border-border-input bg-hover px-[12px] py-[8px] text-[13px] text-text-primary focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">URL Slug</label>
                  <input value={wsSlug} onChange={(e) => setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="w-full rounded-[8px] border border-border-input bg-hover px-[12px] py-[8px] text-[13px] text-text-primary focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">Plan</label>
                  <div className="flex items-center gap-[8px]">
                    <span className="inline-flex items-center bg-[#e8eaf6] dark:bg-[#2a2d4a] text-accent rounded-[4px] px-[8px] py-[3px] text-[12px] font-medium">Enterprise</span>
                    <span className="text-[12px] text-text-tertiary">Cross-workspace, custom roles, SSO/SCIM</span>
                  </div>
                </div>
                <div className="pt-[8px] flex items-center gap-[8px]">
                  <button onClick={handleSaveGeneral} className="bg-accent text-white rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium hover:opacity-90 transition-colors">Save Changes</button>
                  {saved && <span className="inline-flex items-center gap-[4px] text-[12px] text-[#4caf50]"><Check size={13} /> Saved</span>}
                </div>
              </div>
            )}

            {/* ── Roles ── */}
            {tab === "roles" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px]">
                <div className="flex items-center justify-between mb-[16px]">
                  <h2 className="text-[14px] font-semibold text-text-primary">Roles</h2>
                  <button onClick={() => setNewRole(true)} className="text-[12px] font-medium text-accent hover:underline">+ Custom Role</button>
                </div>
                {newRole && (
                  <div className="mb-[12px] bg-surface rounded-[8px] p-[12px] border border-accent/50 space-y-[8px]">
                    <input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="Role name..." autoFocus className="w-full bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none" onKeyDown={(e) => { if (e.key === "Enter") handleCreateRole(); if (e.key === "Escape") setNewRole(false); }} />
                    <input value={rolePerms} onChange={(e) => setRolePerms(e.target.value)} placeholder="Permissions description..." className="w-full bg-transparent text-[12px] text-text-secondary placeholder:text-text-tertiary outline-none" />
                    <div className="flex gap-[6px]">
                      <button onClick={handleCreateRole} disabled={!roleName.trim()} className={`text-[11px] px-[8px] py-[4px] rounded-md ${roleName.trim() ? "bg-accent text-white" : "bg-surface-muted text-text-tertiary cursor-not-allowed"}`}>Create</button>
                      <button onClick={() => { setNewRole(false); setRoleName(""); setRolePerms(""); }} className="text-[11px] text-text-tertiary">Cancel</button>
                    </div>
                  </div>
                )}
                <div className="space-y-[2px]">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] hover:bg-hover group">
                      <Shield size={15} className={role.custom ? "text-accent" : "text-text-tertiary"} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[6px]">
                          <span className="text-[13px] font-medium text-text-primary">{role.name}</span>
                          {role.custom && <span className="text-[10px] bg-[#e8eaf6] dark:bg-[#2a2d4a] text-accent rounded px-[4px] py-[1px] font-medium">Custom</span>}
                        </div>
                        <p className="text-[12px] text-text-secondary mt-[1px] truncate">{role.permissions}</p>
                      </div>
                      <span className="text-[12px] text-text-tertiary shrink-0">{role.members} members</span>
                      {role.custom && (
                        <button onClick={() => handleDeleteRole(role.id)} className="p-[3px] text-text-tertiary hover:text-[#e53935] opacity-0 group-hover:opacity-100 transition-all" title="Delete role">
                          <Trash2 size={13} />
                        </button>
                      )}
                      <ChevronRight size={14} className="text-text-tertiary" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Members ── */}
            {tab === "members" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px]">
                <div className="flex items-center justify-between mb-[16px]">
                  <h2 className="text-[14px] font-semibold text-text-primary">Members ({members.length})</h2>
                  <button onClick={() => setInviting(true)} className="bg-accent text-white rounded-[8px] px-[12px] py-[5px] text-[12px] font-medium hover:opacity-90">Invite Member</button>
                </div>
                {inviting && (
                  <div className="mb-[12px] bg-surface rounded-[8px] p-[12px] border border-accent/50 flex items-center gap-[8px]">
                    <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@example.com" autoFocus className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none" onKeyDown={(e) => { if (e.key === "Enter") handleInvite(); if (e.key === "Escape") { setInviting(false); setInviteEmail(""); } }} />
                    <button onClick={handleInvite} disabled={!inviteEmail.includes("@")} className={`text-[11px] px-[8px] py-[4px] rounded-md ${inviteEmail.includes("@") ? "bg-accent text-white" : "bg-surface-muted text-text-tertiary cursor-not-allowed"}`}>Send Invite</button>
                    <button onClick={() => { setInviting(false); setInviteEmail(""); }} className="text-[11px] text-text-tertiary">Cancel</button>
                  </div>
                )}
                <div className="space-y-[2px]">
                  {members.map((u) => (
                    <div key={u.id} className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-[8px] hover:bg-hover group">
                      <Avatar initials={u.initials} bg={u.bg} size={28} />
                      <div className="flex-1"><span className="text-[13px] font-medium text-text-primary">{u.name}</span></div>
                      <select value={memberRoles[u.id] || "Member"} onChange={(e) => setMemberRoles((prev) => ({ ...prev, [u.id]: e.target.value }))} className="bg-transparent text-[12px] text-text-tertiary border-none outline-none cursor-pointer hover:text-text-primary">
                        {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
                      </select>
                      {u.id !== "u1" && (
                        <button onClick={() => handleRemoveMember(u.id)} className="p-[3px] text-text-tertiary hover:text-[#e53935] opacity-0 group-hover:opacity-100 transition-all" title="Remove member">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SSO ── */}
            {tab === "sso" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px] space-y-[16px]">
                <h2 className="text-[14px] font-semibold text-text-primary">SSO / SCIM Provisioning</h2>
                <p className="text-[13px] text-text-secondary">Automatically provision and deprovision users via your identity provider.</p>
                <div className="bg-[#e8f5e9] dark:bg-[#1b3a1e] border border-[#c8e6c9] dark:border-[#2e5a30] rounded-[8px] px-[14px] py-[10px] text-[13px] text-[#2e7d32] dark:text-[#81c784] flex items-center gap-[8px]">
                  <div className="w-[8px] h-[8px] rounded-full bg-[#4caf50]" />
                  SAML SSO configured — {ssoProvider}
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">SSO Provider</label>
                  <select value={ssoProvider} onChange={(e) => setSsoProvider(e.target.value)} className="w-full rounded-[8px] border border-border-input bg-hover px-[12px] py-[8px] text-[13px] text-text-primary focus:border-accent focus:outline-none cursor-pointer">
                    {["Okta", "Azure AD", "Google Workspace", "OneLogin", "Auth0"].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">SCIM Base URL</label>
                  <div className="flex items-center gap-[6px]">
                    <input defaultValue="https://api.sage.io/scim/v2" readOnly className="flex-1 rounded-[8px] border border-border-input bg-surface-pill px-[12px] py-[8px] text-[13px] text-text-tertiary" />
                    <button onClick={() => navigator.clipboard.writeText("https://api.sage.io/scim/v2")} className="p-[7px] rounded-md hover:bg-hover text-text-tertiary hover:text-text-primary" title="Copy"><Copy size={14} /></button>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-[4px]">SCIM Token</label>
                  <div className="flex items-center gap-[6px]">
                    <input value={showToken ? token : "••••••••••••••••"} readOnly className="flex-1 rounded-[8px] border border-border-input bg-surface-pill px-[12px] py-[8px] text-[13px] text-text-tertiary font-mono" />
                    <button onClick={() => setShowToken(!showToken)} className="p-[7px] rounded-md hover:bg-hover text-text-tertiary hover:text-text-primary" title={showToken ? "Hide" : "Reveal"}>
                      {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(token)} className="p-[7px] rounded-md hover:bg-hover text-text-tertiary hover:text-text-primary" title="Copy"><Copy size={14} /></button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Audit Log ── */}
            {tab === "audit" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px]">
                <div className="flex items-center justify-between mb-[12px]">
                  <h2 className="text-[14px] font-semibold text-text-primary">Audit Log</h2>
                  <button onClick={handleExportAudit} className="inline-flex items-center gap-[4px] text-[12px] font-medium text-accent hover:underline"><Download size={12} /> Export</button>
                </div>
                <div className="flex items-center gap-[6px] mb-[12px] bg-surface rounded-[8px] border border-divider px-[10px] py-[6px]">
                  <Search size={13} className="text-text-tertiary shrink-0" />
                  <input value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} placeholder="Search audit log..." className="bg-transparent text-[13px] text-text-primary placeholder:text-text-tertiary outline-none w-full" />
                  {auditSearch && <button onClick={() => setAuditSearch("")} className="text-text-tertiary"><X size={13} /></button>}
                </div>
                <div className="space-y-[2px]">
                  {filteredAudit.map((entry) => {
                    const user = getUserById(entry.user);
                    return (
                      <div key={entry.id} className="flex items-center gap-[10px] px-[12px] py-[8px] rounded-[8px] hover:bg-hover">
                        <Avatar initials={user?.initials || "?"} bg={user?.bg || "bg-[#bdbdbd]"} size={24} />
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] text-text-primary">{entry.action}</span>
                          <span className="text-[13px] text-text-tertiary"> — {entry.detail}</span>
                        </div>
                        <span className="text-[12px] text-text-tertiary shrink-0">{entry.time}</span>
                      </div>
                    );
                  })}
                  {filteredAudit.length === 0 && <div className="py-[16px] text-center text-[13px] text-text-tertiary">No matching entries</div>}
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {tab === "notifications" && (
              <div className="bg-surface-card border border-divider rounded-[12px] p-[20px] space-y-[12px]">
                <h2 className="text-[14px] font-semibold text-text-primary">Notification Preferences</h2>
                {[
                  { key: "assigned", label: "Assigned to me", desc: "When an issue is assigned to you" },
                  { key: "mentioned", label: "Mentioned", desc: "When you're @mentioned in a comment" },
                  { key: "statusChanges", label: "Status changes", desc: "When an assigned issue changes status" },
                  { key: "automationAlerts", label: "Automation alerts", desc: "When a rule is disabled due to loop detection" },
                  { key: "crossWorkspace", label: "Cross-workspace blocks", desc: "When a dependency in another workspace is blocked" },
                ].map((n) => (
                  <label key={n.key} className="flex items-center justify-between py-[6px] cursor-pointer group">
                    <div>
                      <span className="text-[13px] text-text-primary">{n.label}</span>
                      <p className="text-[12px] text-text-tertiary">{n.desc}</p>
                    </div>
                    <div
                      onClick={(e) => { e.preventDefault(); setNotifPrefs((prev) => ({ ...prev, [n.key]: !prev[n.key] })); }}
                      className={`w-[36px] h-[20px] rounded-full flex items-center px-[2px] cursor-pointer transition-colors ${notifPrefs[n.key] ? "bg-accent" : "bg-surface-muted"}`}
                    >
                      <div className={`w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-transform ${notifPrefs[n.key] ? "translate-x-[16px]" : "translate-x-0"}`} />
                    </div>
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
