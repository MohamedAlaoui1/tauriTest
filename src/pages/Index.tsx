import { useState, useEffect, useRef, useCallback } from "react";
import AppSidebar from "@/components/meeting/AppSidebar";
import MainPanel from "@/components/meeting/MainPanel";
import { mockNotes, MeetingNote, TranscriptLine } from "@/data/mockNotes";
import { useTheme } from "@/hooks/useTheme";
import { listen } from "@tauri-apps/api/event";

const simulatedLines: TranscriptLine[] = [
  { speaker: "You", text: "Let's get started with today's meeting. I want to cover the progress on the new feature rollout." },
  { speaker: "Sarah Chen", text: "Sure. We've completed the initial implementation and it's currently in QA. We're tracking two minor bugs but nothing blocking." },
  { speaker: "You", text: "Great. What's the expected timeline for the QA cycle?" },
  { speaker: "Sarah Chen", text: "We should be done by end of this week. If all goes well, we can ship to production next Monday." },
  { speaker: "Marcus Webb", text: "I'll make sure the deployment pipeline is ready. We should also coordinate with the support team for any customer-facing changes." },
];

const Index = () => {
  const { isDark, toggle } = useTheme();
  const [notes] = useState<MeetingNote[]>(mockNotes);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLiveMeeting, setIsLiveMeeting] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [liveTranscript, setLiveTranscript] = useState<TranscriptLine[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startMeeting = useCallback(() => {
    setActiveNoteId(null);
    setIsLiveMeeting(true);
    setLiveTitle("");
    setLiveTranscript([]);
    setElapsedSeconds(0);
  }, []);

  useEffect(() => {
    const unlisten = listen("start-new-meeting", () => {
      startMeeting();
    });
    return () => {
      unlisten.then(f => f());
    };
  }, [startMeeting]);

  // Timer
  useEffect(() => {
    if (isLiveMeeting) {
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLiveMeeting]);

  // Simulate transcript
  useEffect(() => {
    if (!isLiveMeeting) return;
    let index = 0;
    const addLine = () => {
      if (index < simulatedLines.length) {
        setLiveTranscript((prev) => [...prev, simulatedLines[index]]);
        index++;
        simRef.current = setTimeout(addLine, 3000 + Math.random() * 2000);
      }
    };
    simRef.current = setTimeout(addLine, 2000);
    return () => {
      if (simRef.current) clearTimeout(simRef.current);
    };
  }, [isLiveMeeting]);

  const handleSelectNote = (id: string) => {
    setIsLiveMeeting(false);
    setActiveNoteId(id);
    if (timerRef.current) clearInterval(timerRef.current);
    if (simRef.current) clearTimeout(simRef.current);
  };

  const handleSave = () => {
    setIsLiveMeeting(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (simRef.current) clearTimeout(simRef.current);
  };

  const handleDiscard = () => {
    setIsLiveMeeting(false);
    setActiveNoteId(null);
    if (timerRef.current) clearInterval(timerRef.current);
    if (simRef.current) clearTimeout(simRef.current);
  };

  const activeNote = activeNoteId ? notes.find((n) => n.id === activeNoteId) || null : null;

  return (
    <div className="flex h-screen w-full overflow-hidden transition-theme">
      <AppSidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
        onNewMeeting={startMeeting}
        isDark={isDark}
        onToggleTheme={toggle}
      />
      <MainPanel
        activeNote={activeNote}
        isLiveMeeting={isLiveMeeting}
        onNewMeeting={startMeeting}
        onSave={handleSave}
        onDiscard={handleDiscard}
        liveTranscript={liveTranscript}
        liveTitle={liveTitle}
        onTitleChange={setLiveTitle}
        elapsedSeconds={elapsedSeconds}
      />
    </div>
  );
};

export default Index;
