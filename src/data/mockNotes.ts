export interface TranscriptLine {
  speaker: string;
  text: string;
}

export interface MeetingNote {
  id: string;
  title: string;
  date: string;
  transcript: TranscriptLine[];
}

export const mockNotes: MeetingNote[] = [
  {
    id: "1",
    title: "Q1 Product Roadmap Review",
    date: "Feb 28, 2026",
    transcript: [
      { speaker: "Sarah Chen", text: "Let's start with the Q1 review. We shipped the new dashboard, the notification system, and the mobile responsive update. All three were on time." },
      { speaker: "Marcus Webb", text: "The dashboard adoption has been strong. We're seeing about 68% of active users engaging with the new layout within the first week." },
      { speaker: "Sarah Chen", text: "That's great. Any friction points we should address before moving to Q2 planning?" },
      { speaker: "Lina Torres", text: "Some users mentioned the filter panel is hard to find. We might want to make it more prominent or add a tooltip on first visit." },
      { speaker: "Marcus Webb", text: "Agreed. I'll add that to the backlog. For Q2, our main priorities should be the API integrations and the collaboration features." },
    ],
  },
  {
    id: "2",
    title: "Design System Sync",
    date: "Feb 26, 2026",
    transcript: [
      { speaker: "Lina Torres", text: "I've updated the color tokens in Figma to match what we discussed last week. The new palette is much more cohesive." },
      { speaker: "James Park", text: "Nice. Are we keeping the warm neutrals for the light theme?" },
      { speaker: "Lina Torres", text: "Yes, warm neutrals for light, cool grays for dark. The accent colors stay consistent across both." },
    ],
  },
  {
    id: "3",
    title: "Sprint 14 Retrospective",
    date: "Feb 24, 2026",
    transcript: [
      { speaker: "Marcus Webb", text: "Overall the sprint went well. We completed 34 out of 38 story points." },
      { speaker: "Sarah Chen", text: "The four remaining points were from the export feature. What blocked that?" },
      { speaker: "James Park", text: "We hit an edge case with large file exports. The memory usage was spiking. I've got a fix in progress." },
    ],
  },
  {
    id: "4",
    title: "Client Feedback Session",
    date: "Feb 21, 2026",
    transcript: [
      { speaker: "Sarah Chen", text: "We had three client calls this week. The general sentiment is very positive about the new features." },
      { speaker: "Lina Torres", text: "One client specifically asked about custom branding options. Is that something we're considering?" },
      { speaker: "Marcus Webb", text: "It's on the roadmap for Q3. We can share the timeline with them." },
    ],
  },
  {
    id: "5",
    title: "Engineering Standup",
    date: "Feb 19, 2026",
    transcript: [
      { speaker: "James Park", text: "I'm wrapping up the API rate limiting today. Should be ready for review by end of day." },
      { speaker: "Marcus Webb", text: "Great. I'll review it first thing tomorrow morning." },
    ],
  },
  {
    id: "6",
    title: "Onboarding Flow Review",
    date: "Feb 17, 2026",
    transcript: [
      { speaker: "Lina Torres", text: "The new onboarding flow has reduced drop-off by 23%. The progressive disclosure approach is working." },
      { speaker: "Sarah Chen", text: "Excellent results. Let's document this pattern for future reference." },
    ],
  },
];
