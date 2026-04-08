import { Arena } from './Arena';
import { GameMode } from './GameMode';
import { PlayerEntity } from './PlayerEntity';

export interface Battle {
  id: number;
  type: string;
  battleTime: string;
  isLadderTournament: boolean;
  deckSelection: string;
  isHostedMatch: boolean;
  leagueNumber: string;
  arena: Arena;
  gameMode: GameMode;
  team: PlayerEntity;
  opponent: PlayerEntity;
}
