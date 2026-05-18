import { LeagueStadistics } from './LeagueStadistics';
import { Arena } from './Arena';
import { WinRate } from './WinRate';
import { Streak } from './Streak';
import { BattleStat } from './BattleStat';
import { ActiveGoals } from './ActiveGoals';
import { PlayerProfile } from './PlayerProfile';
import { LossRate } from './LossRate';

export interface Metric {
  id: number;
  name: string;
  generatedAt: Date;
  trophies: number;
  bestTrophies: number;
  changeTrophiesIn24h: number;
  arena: Arena;
  leagueStadistics: LeagueStadistics;
  winRate: WinRate;
  lossRate: LossRate;
  streak: Streak;
  battles: BattleStat;
  activeGoals: ActiveGoals;
  unreadNotifications: number;
  donations: number;
  playerProfile: PlayerProfile;
}
