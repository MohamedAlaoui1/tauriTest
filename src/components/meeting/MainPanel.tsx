import { useState, useEffect, useRef } from "react";
import { MeetingNote, TranscriptLine } from "@/data/mockNotes";
import TranscriptView from "./TranscriptView";
import EmptyState from "./EmptyState";
import { Bell } from "lucide-react";

interface MainPanelProps {
  activeNote: MeetingNote | null;
  isLiveMeeting: boolean;
  onNewMeeting: () => void;
  onSave: () => void;
  onDiscard: () => void;
  liveTranscript: TranscriptLine[];
  liveTitle: string;
  onTitleChange: (title: string) => void;
  elapsedSeconds: number;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const notifications = [
  { text: "Sarah shared Q1 roadmap document", time: "2m ago" },
  { text: "New comment on Sprint 14 Retro", time: "15m ago" },
  { text: "Marcus invited you to Design Review", time: "1h ago" },
];

const MainPanel = ({
  activeNote,
  isLiveMeeting,
  onNewMeeting,
  onSave,
  onDiscard,
  liveTranscript,
  liveTitle,
  onTitleChange,
  elapsedSeconds,
}: MainPanelProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // No active note and not live
  if (!activeNote && !isLiveMeeting) {
    return (
      <div className="flex-1 flex flex-col bg-background transition-theme">
        {/* Top bar */}
        <div className="h-[52px] flex items-center justify-end px-6 border-b border-border">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-theme relative"
            >
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            {showNotifications && <NotifDropdown />}
          </div>
        </div>
        <EmptyState onNewMeeting={onNewMeeting} />
      </div>
    );
  }

  const isReadOnly = activeNote && !isLiveMeeting;
  const transcript = isLiveMeeting ? liveTranscript : activeNote?.transcript || [];
  const title = isLiveMeeting ? liveTitle : activeNote?.title || "";

  return (
    <div className="flex-1 flex flex-col bg-background transition-theme">
      {/* Top bar */}
      <div className="h-[52px] flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-4">
          {isLiveMeeting ? (
            <input
              value={liveTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Untitled Meeting"
              className="text-[18px] font-medium bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-[300px]"
            />
          ) : (
            <h1 className="text-[18px] font-medium text-foreground">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isLiveMeeting && (
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
                Recording
              </span>
              <span className="font-mono text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          )}
          {isReadOnly && (
            <span className="text-[11px] text-muted-foreground">{activeNote?.date}</span>
          )}
          <button className="text-[13px] text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1 transition-theme">
            Export
          </button>
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-theme relative"
            >
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
            </button>
            {showNotifications && <NotifDropdown />}
          </div>
        </div>
      </div>

      {/* Transcript */}
      <TranscriptView lines={transcript} isLive={isLiveMeeting} />

      {/* Bottom bar - only for live meetings */}
      {isLiveMeeting && (
        <div className="h-[48px] border-t border-border flex items-center justify-between px-6">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            AI is listening
            <span className="inline-flex gap-0.5 ml-1">
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-listening" style={{ animationDelay: "0s" }} />
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-listening" style={{ animationDelay: "0.2s" }} />
              <span className="w-1 h-1 rounded-full bg-muted-foreground animate-listening" style={{ animationDelay: "0.4s" }} />
            </span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="text-[13px] bg-primary text-primary-foreground rounded-md px-4 py-1 hover:opacity-90 transition-theme"
            >
              Save Note
            </button>
            <button
              onClick={onDiscard}
              className="text-[13px] text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1 transition-theme"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NotifDropdown = () => (
  <div className="absolute right-0 top-full mt-1 w-[260px] bg-surface border border-border rounded-lg py-2 z-50 transition-theme">
    {notifications.map((n, i) => (
      <div key={i} className="px-3 py-2 flex items-start gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
        <div>
          <p className="text-[12px] text-foreground leading-snug">{n.text}</p>
          <span className="text-[10px] text-muted-foreground">{n.time}</span>
        </div>
      </div>
    ))}
  </div>
);

export default MainPanel;
