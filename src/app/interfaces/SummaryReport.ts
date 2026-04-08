export interface SummaryReport {
  id: number;
  playerTag: string;
  trophies: number;
  winRateLast25: number;
  winRateLast7d: number;
  currentStreak: number;
  totalBattles: number;
  weakestArchetype: string;
  strongestArchetype: string;
  avgElisxirLastDeck: number;
  createdAt: Date;
}
