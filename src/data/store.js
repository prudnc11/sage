/* ── Pulseboard v2 — Mock Data ── */

export const USERS = [
  { id: "u1", name: "Harshith Mullapudi", initials: "HM", bg: "bg-[#43a047]" },
  { id: "u2", name: "Manik Aggarwal", initials: "MA", bg: "bg-[#7e57c2]" },
  { id: "u3", name: "Manoj Reddy", initials: "MR", bg: "bg-[#e65100]" },
  { id: "u4", name: "Adaeze Obi", initials: "AO", bg: "bg-[#26a69a]" },
  { id: "u5", name: "Fatima Bello", initials: "FB", bg: "bg-[#5c6bc0]" },
];

export const TEAMS = [
  { id: "t1", name: "Engineering", prefix: "ENG" },
  { id: "t2", name: "Platform", prefix: "PLT" },
  { id: "t3", name: "Design", prefix: "DES" },
];

export const LABELS = [
  { name: "Bug", color: "#e53935" },
  { name: "Feature", color: "#fb8c00" },
  { name: "Improvement", color: "#5e6ad2" },
  { name: "Integrations", color: "#4caf50" },
  { name: "Security", color: "#ab47bc" },
  { name: "Infrastructure", color: "#78909c" },
  { name: "Mobile", color: "#00acc1" },
];

export const ISSUES = [
  { id: "ENG-196", title: "Create Overview Section in Side Sidebar for Assignee, Labels, and Priority Stats", variant: "inReviewFilled", assignee: "u4", labels: ["Integrations"], priority: "low", team: "t1", timeLogged: 7200 },
  { id: "ENG-201", title: "Create Slack Integration Documentation: Task creation, Sign-up, and Slack Thread linking", variant: "inReviewFilled", assignee: "u1", labels: ["Feature"], priority: "medium", team: "t1", subIssues: 2, timeLogged: 14400 },
  { id: "ENG-198", title: "Create Ticket Reference Feature in Slack", variant: "cancelled", assignee: "u2", labels: ["Feature"], priority: "high", team: "t1", timeLogged: 3600 },
  { id: "ENG-195", title: "Move API: Transfer issues between teams", variant: "todo", assignee: "u3", labels: ["Improvement"], priority: "urgent", team: "t1", timeLogged: 0 },
  { id: "ENG-202", title: "Enable Gmail Sign-up and Sign-in functionality", variant: "inReviewFilled", assignee: "u1", labels: ["Feature"], priority: "medium", team: "t1", blockedBy: "ENG-213", timeLogged: 10800 },
  { id: "ENG-199", title: "Get Google Oauth app approval", variant: "cancelled", assignee: "u4", labels: ["Security"], priority: "medium", team: "t1", timeLogged: 1800 },
  { id: "ENG-210", title: "Create backend API for sending workspace invitation", variant: "inProgress", assignee: "u2", labels: ["Feature"], priority: "high", team: "t1", timeLogged: 21600 },
  { id: "ENG-215", title: "Implement webhook event system for rule engine", variant: "backlog", assignee: null, labels: ["Infrastructure"], priority: "medium", team: "t1", timeLogged: 0 },
  { id: "ENG-190", title: "Add real-time sync for issue status updates", variant: "done", assignee: "u1", labels: ["Improvement"], priority: "high", team: "t1", timeLogged: 28800 },
  { id: "ENG-220", title: "Build workflow rule condition builder UI", variant: "todo", assignee: "u2", labels: ["Feature"], priority: "high", team: "t1", timeLogged: 0 },
  { id: "ENG-221", title: "Implement dry-run mode for automation rules", variant: "backlog", assignee: null, labels: ["Feature"], priority: "medium", team: "t1", timeLogged: 0 },
  { id: "ENG-222", title: "Add infinite-loop protection for rule chains", variant: "todo", assignee: "u1", labels: ["Infrastructure", "Security"], priority: "urgent", team: "t1", timeLogged: 0 },
  { id: "PLT-101", title: "Cross-workspace dependency indexing", variant: "inProgress", assignee: "u3", labels: ["Infrastructure"], priority: "high", team: "t2", timeLogged: 36000 },
  { id: "PLT-102", title: "Enterprise SSO/SCIM provisioning", variant: "todo", assignee: "u5", labels: ["Security"], priority: "urgent", team: "t2", timeLogged: 0 },
  { id: "PLT-103", title: "Audit log export for compliance review", variant: "backlog", assignee: null, labels: ["Feature"], priority: "medium", team: "t2", timeLogged: 0 },
  { id: "DES-050", title: "Roadmap timeline view design", variant: "done", assignee: "u4", labels: ["Feature"], priority: "high", team: "t3", timeLogged: 18000 },
  { id: "DES-051", title: "Mobile app navigation patterns", variant: "inProgress", assignee: "u4", labels: ["Mobile"], priority: "high", team: "t3", timeLogged: 7200 },
  { id: "DES-052", title: "Time tracking widget design", variant: "inReviewFilled", assignee: "u4", labels: ["Feature"], priority: "medium", team: "t3", timeLogged: 5400 },
];

export const INITIATIVES = [
  {
    id: "init-1",
    name: "Workflow Automation Engine",
    owner: "u1",
    targetQuarter: "Q3 2027",
    status: "on-track",
    issueIds: ["ENG-220", "ENG-221", "ENG-222", "ENG-215"],
    teams: ["t1"],
  },
  {
    id: "init-2",
    name: "Native Mobile Apps",
    owner: "u4",
    targetQuarter: "Q4 2027",
    status: "on-track",
    issueIds: ["DES-051"],
    teams: ["t1", "t3"],
  },
  {
    id: "init-3",
    name: "Enterprise Scale & Security",
    owner: "u5",
    targetQuarter: "Q4 2027",
    status: "at-risk",
    issueIds: ["PLT-101", "PLT-102", "PLT-103"],
    teams: ["t2"],
  },
  {
    id: "init-4",
    name: "Time Tracking & Reporting",
    owner: "u2",
    targetQuarter: "Q3 2027",
    status: "on-track",
    issueIds: ["DES-052", "ENG-210"],
    teams: ["t1", "t3"],
  },
  {
    id: "init-5",
    name: "Roadmap & Initiative Planning",
    owner: "u4",
    targetQuarter: "Q3 2027",
    status: "completed",
    issueIds: ["DES-050"],
    teams: ["t3"],
  },
];

export const AUTOMATION_RULES = [
  { id: "r1", name: "Auto-assign bug reports", trigger: "Issue created", condition: "Label contains 'Bug'", action: "Assign to round-robin (Engineering)", enabled: true, team: "t1", executions: 47 },
  { id: "r2", name: "Move to In Review on PR merge", trigger: "PR merged", condition: "Status = In Progress", action: "Change status to In Review", enabled: true, team: "t1", executions: 132 },
  { id: "r3", name: "SLA alert for urgent issues", trigger: "Age > 24h", condition: "Priority = Urgent AND Status ≠ Done", action: "Send Slack notification to Team Lead", enabled: true, team: "t1", executions: 18 },
  { id: "r4", name: "Auto-label security issues", trigger: "Issue created", condition: "Title contains 'SSO' OR 'auth' OR 'permission'", action: "Add label 'Security'", enabled: false, team: "t2", executions: 0 },
  { id: "r5", name: "Close stale backlog items", trigger: "Age > 90 days", condition: "Status = Backlog AND no comments in 60 days", action: "Change status to Cancelled, post comment", enabled: true, team: "t1", executions: 23 },
];

export const TIME_ENTRIES = [
  { id: "te1", issueId: "ENG-210", user: "u2", date: "2026-07-12", duration: 7200, source: "timer", note: "API endpoint implementation" },
  { id: "te2", issueId: "ENG-201", user: "u1", date: "2026-07-12", duration: 5400, source: "timer", note: "Documentation drafting" },
  { id: "te3", issueId: "PLT-101", user: "u3", date: "2026-07-12", duration: 10800, source: "timer", note: "Index optimization" },
  { id: "te4", issueId: "ENG-196", user: "u4", date: "2026-07-11", duration: 7200, source: "manual", note: "UI component work" },
  { id: "te5", issueId: "DES-051", user: "u4", date: "2026-07-11", duration: 3600, source: "timer", note: "Navigation prototyping" },
  { id: "te6", issueId: "ENG-190", user: "u1", date: "2026-07-10", duration: 14400, source: "timer", note: "Real-time sync finalization" },
  { id: "te7", issueId: "ENG-202", user: "u1", date: "2026-07-10", duration: 10800, source: "manual", note: "OAuth flow research" },
  { id: "te8", issueId: "DES-050", user: "u4", date: "2026-07-09", duration: 9000, source: "timer", note: "Timeline view iterations" },
  { id: "te9", issueId: "PLT-102", user: "u5", date: "2026-07-11", duration: 5400, source: "timer", note: "SCIM spec review" },
  { id: "te10", issueId: "ENG-222", user: "u1", date: "2026-07-09", duration: 3600, source: "manual", note: "Loop detection research" },
];

export function getUserById(id) {
  return USERS.find((u) => u.id === id);
}

export function getIssuesByStatus(issues, variant) {
  return issues.filter((i) => i.variant === variant);
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getInitiativeProgress(initiative) {
  const linked = ISSUES.filter((i) => initiative.issueIds.includes(i.id));
  const done = linked.filter((i) => i.variant === "done").length;
  return linked.length > 0 ? Math.round((done / linked.length) * 100) : 0;
}
