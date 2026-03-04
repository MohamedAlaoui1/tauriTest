import MemoLogo from "./MemoLogo";

interface EmptyStateProps {
  onNewMeeting: () => void;
}

const EmptyState = ({ onNewMeeting }: EmptyStateProps) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4">
    <MemoLogo size={48} faded />
    <p className="text-[16px] text-muted-foreground">
      Start a new meeting or select a previous note
    </p>
    <button
      onClick={onNewMeeting}
      className="rounded-lg bg-primary text-primary-foreground text-[13px] font-medium px-5 py-2 hover:opacity-90 transition-theme"
    >
      + New Meeting
    </button>
  </div>
);

export default EmptyState;
