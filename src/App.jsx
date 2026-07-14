import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Code2, Zap, Map, Clock, Settings, Shield, Terminal, Layers } from "lucide-react";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import AiInput from "./components/AiInput";
import Issues from "./pages/Issues";
import Automations from "./pages/Automations";
import Roadmap from "./pages/Roadmap";
import TimeTracking from "./pages/TimeTracking";
import SettingsPage from "./pages/Settings";
import PlatformIssues from "./pages/PlatformIssues";
import ApiClient from "./pages/ApiClient";
import PostmanViews from "./pages/PostmanViews";

const ROUTE_CONFIG = {
  "/": { icon: Code2, iconColor: "text-[#5e6ad2]", breadcrumb: ["Engineering", "All issues"] },
  "/automations": { icon: Zap, iconColor: "text-[#f59e0b]", breadcrumb: ["Workspace", "Automations"] },
  "/roadmap": { icon: Map, iconColor: "text-[#4caf50]", breadcrumb: ["Workspace", "Roadmap"] },
  "/time-tracking": { icon: Clock, iconColor: "text-[#5e6ad2]", breadcrumb: ["Workspace", "Time Tracking"] },
  "/settings": { icon: Settings, iconColor: "text-[#757575]", breadcrumb: ["Settings"] },
  "/team/platform/issues": { icon: Shield, iconColor: "text-[#B39DDB]", breadcrumb: ["Side Quests", "Ventryl"] },
  "/team/platform/api-client": { icon: Terminal, iconColor: "text-[#B39DDB]", breadcrumb: ["Side Quests", "API Client"] },
  "/team/platform/views": { icon: Layers, iconColor: "text-[#B39DDB]", breadcrumb: ["Side Quests", "Postman"] },
  "/team/engineering/views": { icon: Layers, iconColor: "text-[#88C695]", breadcrumb: ["Engineering", "Postman"] },
};

function Layout() {
  const location = useLocation();
  const config = ROUTE_CONFIG[location.pathname] || ROUTE_CONFIG["/"];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const hideAiChat = location.pathname === "/team/platform/issues" || location.pathname === "/team/platform/api-client" || location.pathname === "/team/platform/views" || location.pathname === "/team/engineering/views";

  return (
    <div className="flex h-screen overflow-hidden bg-chrome relative">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <TopBar icon={config.icon} iconColor={config.iconColor} breadcrumb={config.breadcrumb} />
        <div className="flex-1 flex min-w-0 gap-2 mx-2 mb-2 mt-2">
          {/* Left — Content */}
          <div className="flex-1 flex flex-col min-w-0 rounded-[24px] overflow-hidden border border-surface-card bg-surface">
            <Routes>
              <Route path="/" element={<Issues />} />
              <Route path="/automations" element={<Automations />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/time-tracking" element={<TimeTracking />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/team/platform/issues" element={<PlatformIssues />} />
              <Route path="/team/platform/api-client" element={<ApiClient />} />
              <Route path="/team/platform/views" element={<PostmanViews />} />
              <Route path="/team/engineering/views" element={<PostmanViews />} />
              <Route path="*" element={<Issues />} />
            </Routes>
          </div>
          {/* Right — AI Input */}
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
