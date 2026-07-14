import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  MoreHorizontal,
  Code2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function TopBar({ icon: Icon = Code2, iconColor = "text-[#5e6ad2]", breadcrumb = ["Engineering", "All issues"] }) {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  return (
    <div className="h-[44px] flex items-center px-4 gap-[6px] shrink-0 bg-chrome">
      <button onClick={() => navigate(-1)} className="p-[4px] rounded-md hover:bg-surface-pill text-text-primary" aria-label="Go back">
        <ArrowLeft size={18} strokeWidth={1.75} />
      </button>
      <button onClick={() => navigate(1)} className="p-[4px] rounded-md hover:bg-surface-pill text-text-primary" aria-label="Go forward">
        <ArrowRight size={18} strokeWidth={1.75} />
      </button>
      <div className="flex items-center gap-[8px] ml-4 text-[14px]">
        <div className="w-[24px] h-[24px] rounded-[6px] bg-[#88C695] flex items-center justify-center">
          <Icon size={14} strokeWidth={2} className="text-black" />
        </div>
        {breadcrumb.map((item, i) => (
          <span key={i} className="flex items-center gap-[8px]">
            {i > 0 && <ChevronRight size={14} className="text-text-primary mx-[-2px]" />}
            <span className="font-normal text-text-primary">{item}</span>
          </span>
        ))}

        <button className="p-[4px] rounded-md hover:bg-surface-pill text-text-primary ml-[2px]">
          <MoreHorizontal size={18} strokeWidth={1.75} />
        </button>
      </div>
      <div className="flex-1" />
      <button
        onClick={toggle}
        className="p-[6px] rounded-md hover:bg-surface-pill text-text-primary transition-colors"
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
      </button>
    </div>
  );
}
