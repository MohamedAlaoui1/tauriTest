import { TranscriptLine } from "@/data/mockNotes";

interface TranscriptViewProps {
  lines: TranscriptLine[];
  isLive: boolean;
}

const TranscriptView = ({ lines, isLive }: TranscriptViewProps) => (
  <div className="flex-1 overflow-y-auto">
    <div className="max-w-[720px] mx-auto px-[60px] py-[40px]">
      {lines.map((line, i) => (
        <div key={i} className={i < lines.length - 1 ? "mb-5" : ""}>
          <span className="text-[12px] font-semibold text-primary block mb-0.5">
            {line.speaker}
          </span>
          <p className="text-[14px] text-foreground leading-[1.8]">
            {line.text}
            {isLive && i === lines.length - 1 && (
              <span className="inline-block w-[2px] h-[16px] bg-primary ml-1 align-middle animate-blink" />
            )}
          </p>
        </div>
      ))}
      {lines.length === 0 && isLive && (
        <div className="text-muted-foreground text-[14px]">
          Waiting for speech
          <span className="inline-block w-[2px] h-[16px] bg-primary ml-1 align-middle animate-blink" />
        </div>
      )}
    </div>
  </div>
);

export default TranscriptView;
