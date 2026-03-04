import { Sun, Moon } from "lucide-react";
import MemoLogo from "./MemoLogo";
import { MeetingNote } from "@/data/mockNotes";

interface AppSidebarProps {
  notes: MeetingNote[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onNewMeeting: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const AppSidebar = ({
  notes,
  activeNoteId,
  onSelectNote,
  onNewMeeting,
  isDark,
  onToggleTheme,
}: AppSidebarProps) => {
  return (
    <aside className="w-[220px] min-w-[220px] h-screen flex flex-col bg-surface border-r border-border transition-theme">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <MemoLogo size={18} />
          <span className="text-[15px] font-semibold text-foreground">memo</span>
        </div>
        <button
          onClick={onToggleTheme}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-theme"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* New Meeting Button */}
      <div className="px-3">
        <button
          onClick={onNewMeeting}
          className="w-full rounded-lg bg-primary text-primary-foreground text-[13px] font-medium py-2 hover:opacity-90 transition-theme"
        >
          + New Meeting
        </button>
      </div>

      {/* Section Label */}
      <div className="px-4 mt-6 mb-2">
        <span className="text-[10px] uppercase tracking-[2px] text-muted-foreground font-medium">
          Previous Notes
        </span>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-1">
        {notes.map((note) => {
          const isActive = note.id === activeNoteId;
          return (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`w-full text-left h-[40px] flex flex-col justify-center px-3 rounded-md transition-theme relative ${
                isActive
                  ? "bg-primary/10 border-l-2 border-l-primary"
                  : "hover:bg-primary/5 border-l-2 border-l-transparent"
              }`}
            >
              <span className="text-[13px] text-foreground truncate block leading-tight">
                {note.title}
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">
                {note.date}
              </span>
            </button>
          );
        })}
      </div>

      {/* User */}
      <div className="border-t border-border px-4 py-3 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
          AJ
        </div>
        <span className="text-[11px] text-muted-foreground">Alex Johnson</span>
      </div>
    </aside>
  );
};

export default AppSidebar;
