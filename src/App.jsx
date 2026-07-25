import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Code2, Zap, Map, Clock, Settings, Shield, Terminal, Layers, Inbox, FileText, Database as DatabaseIcon } from "lucide-react";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import AiInput from "./components/AiInput";
import Issues from "./pages/Issues";
import Automations from "./pages/Automations";
import Roadmap from "./pages/Roadmap";
import TimeTracking from "./pages/TimeTracking";
import SettingsPage from "./pages/Settings";
import ApiClient from "./pages/ApiClient";
import PostmanViews from "./pages/PostmanViews";
import InboxPage from "./pages/Inbox";
import Notes from "./pages/Notes";
import DatabasePage from "./pages/Database";

const ROUTE_CONFIG = {
  "/": { icon: Code2, iconColor: "text-[#5e6ad2]", breadcrumb: ["Engineering", "All issues"] },
  "/inbox": { icon: Inbox, iconColor: "text-[#5e6ad2]", breadcrumb: ["Inbox"] },
  "/notes": { icon: FileText, iconColor: "text-[#5e6ad2]", breadcrumb: ["My Notes"] },
  "/automations": { icon: Zap, iconColor: "text-[#f59e0b]", breadcrumb: ["Workspace", "Automations"] },
  "/roadmap": { icon: Map, iconColor: "text-[#4caf50]", breadcrumb: ["Workspace", "Roadmap"] },
  "/time-tracking": { icon: Clock, iconColor: "text-[#5e6ad2]", breadcrumb: ["Workspace", "Time Tracking"] },
  "/settings": { icon: Settings, iconColor: "text-[#757575]", breadcrumb: ["Settings"] },
  "/team/engineering/database": { icon: DatabaseIcon, iconColor: "text-[#88C695]", breadcrumb: ["Engineering", "Database"] },
  "/team/engineering/issues": { icon: Code2, iconColor: "text-[#88C695]", breadcrumb: ["Engineering", "Issues"] },
  "/team/engineering/views": { icon: Layers, iconColor: "text-[#88C695]", breadcrumb: ["Engineering", "Postman"] },
  "/team/platform/database": { icon: DatabaseIcon, iconColor: "text-[#B39DDB]", breadcrumb: ["Side Quests", "Database"] },
  "/team/platform/issues": { icon: Shield, iconColor: "text-[#B39DDB]", breadcrumb: ["Side Quests", "Issues"] },
  "/team/platform/api-client": { icon: Terminal, iconColor: "text-[#B39DDB]", breadcrumb: ["Side Quests", "API Client"] },
  "/team/platform/views": { icon: Layers, iconColor: "text-[#B39DDB]", breadcrumb: ["Side Quests", "Postman"] },
};

const HIDE_AI_CHAT = ["/roadmap", "/automations", "/time-tracking", "/settings", "/team/platform/api-client", "/team/platform/views", "/team/engineering/views", "/team/engineering/database", "/team/platform/database"];

function Layout() {
  const location = useLocation();
  const config = ROUTE_CONFIG[location.pathname] || ROUTE_CONFIG["/"];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const hideAiChat = HIDE_AI_CHAT.includes(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-chrome relative">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar icon={config.icon} iconColor={config.iconColor} breadcrumb={config.breadcrumb} />
        <div className="flex-1 flex min-w-0 gap-2 mx-2 mb-2 mt-2">
          <div className="flex-1 flex flex-col min-w-0 rounded-[24px] overflow-hidden border border-surface-card bg-surface">
            <Routes>
              <Route path="/" element={<Issues />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/automations" element={<Automations />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/time-tracking" element={<TimeTracking />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/team/engineering/database" element={<DatabasePage />} />
              <Route path="/team/engineering/issues" element={<Issues />} />
              <Route path="/team/engineering/views" element={<PostmanViews />} />
              <Route path="/team/platform/database" element={<DatabasePage />} />
              <Route path="/team/platform/issues" element={<Issues />} />
              <Route path="/team/platform/api-client" element={<ApiClient />} />
              <Route path="/team/platform/views" element={<PostmanViews />} />
              <Route path="*" element={<Issues />} />
            </Routes>
          </div>
          {!hideAiChat && (
            <div className="w-[30%] shrink-0 flex flex-col rounded-[24px] border border-surface-card bg-surface overflow-hidden">
              <AiInput />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  );
}
