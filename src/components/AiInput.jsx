import {
  Sparkles,
  Globe,
  SquareCode,
  Paperclip,
  Mic,
  ArrowUp,
} from "lucide-react";

function ActionPill({ icon: Icon, label }) {
  return (
    <button className="group inline-flex items-center gap-0 hover:gap-[6px] border border-divider rounded-full p-[8px] hover:pr-[14px] text-[12px] text-text-primary hover:bg-[#8AC994] hover:border-[#8AC994] hover:text-black hover:scale-105 hover:shadow-[0_2px_8px_rgba(138,201,148,0.3)] transition-all duration-250 ease-out">
      <Icon size={14} strokeWidth={1.75} className="transition-transform duration-250 group-hover:rotate-12" />
      <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[80px] group-hover:opacity-100 transition-all duration-250 ease-out whitespace-nowrap">{label}</span>
    </button>
  );
}

export default function AiInput() {
  return (
    <div className="flex-1 flex flex-col justify-end p-[16px]">
      {/* Input container */}
      <div className="w-full">
        <div className="bg-surface-card rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-divider px-[18px] pt-[14px] pb-[12px]">
          {/* Text input */}
          <textarea
            placeholder="Ask anything, or paste a brief..."
            rows={1}
            className="w-full resize-none bg-transparent text-[15px] text-text-primary placeholder:text-text-tertiary outline-none leading-[1.5] mb-[12px]"
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between gap-[8px]">
            {/* Left: action pills */}
            <div className="flex items-center gap-[6px]">
              <ActionPill icon={Sparkles} label="Reason" />
              <ActionPill icon={Globe} label="Search" />
              <ActionPill icon={SquareCode} label="Code" />
            </div>

            {/* Right: icons */}
            <div className="flex items-center gap-[4px] shrink-0">
              <button className="p-[5px] text-text-primary hover:text-text-secondary transition-colors">
                <Paperclip size={18} strokeWidth={1.75} />
              </button>
              <button className="p-[5px] text-text-primary hover:text-text-secondary transition-colors">
                <Mic size={18} strokeWidth={1.75} />
              </button>
              <button className="w-[32px] h-[32px] rounded-full bg-text-primary hover:opacity-80 flex items-center justify-center transition-colors">
                <ArrowUp size={16} strokeWidth={2} className="text-surface-card" />
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts */}
        <div className="flex items-center justify-center gap-[16px] mt-[8px] text-[11px] text-text-tertiary">
          <span className="inline-flex items-center gap-[4px]">
            <kbd className="inline-flex items-center justify-center bg-surface-pill text-text-tertiary rounded-[3px] px-[4px] py-[1px] text-[10px] font-medium leading-none">↵</kbd>
            send
          </span>
          <span className="inline-flex items-center gap-[4px]">
            <kbd className="inline-flex items-center justify-center bg-surface-pill text-text-tertiary rounded-[3px] px-[4px] py-[1px] text-[10px] font-medium leading-none">⇧</kbd>
            <kbd className="inline-flex items-center justify-center bg-surface-pill text-text-tertiary rounded-[3px] px-[4px] py-[1px] text-[10px] font-medium leading-none">↵</kbd>
            new line
          </span>
          <span className="inline-flex items-center gap-[4px]">
            <kbd className="inline-flex items-center justify-center bg-surface-pill text-text-tertiary rounded-[3px] px-[4px] py-[1px] text-[10px] font-medium leading-none">⌘</kbd>
            <kbd className="inline-flex items-center justify-center bg-surface-pill text-text-tertiary rounded-[3px] px-[4px] py-[1px] text-[10px] font-medium leading-none">V</kbd>
            paste file
          </span>
        </div>
      </div>
    </div>
  );
}
