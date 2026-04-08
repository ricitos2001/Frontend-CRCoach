import { PlayerProfile } from './PlayerProfile';

export interface Snapshot {
  id: number;
  playerProfile: PlayerProfile;
  trophies: number;
  bestTrophies: number;
  wins: number;
  loses: number;
  battleCount: number;
  threeCrownWins: number;
  challengeCardsWon: number;
  challengeMaxWins: number;
  tournamentCardsWon: number;
  tournametBattleCount: number;
  role: string;
  donations: number;
  donationsReceived: number;
  totalDonations: number;
  warDayWins: number;
  clanCardsCollected: number;
  starPoints: number;
  expPoints: number;
  capturedAt: Date;
}
