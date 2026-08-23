export interface Utterance {
  speaker: string;
  text: string;
  timestamp: string;
  sentimentScore: number;
}

export interface CoachingCard {
  pros: string[];
  cons: string[];
}

export interface CallAnalysis {
  transcript: Utterance[];
  coaching: CoachingCard;
}
