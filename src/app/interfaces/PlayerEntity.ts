import { Clan } from './Clan';
import { Deck } from './Deck';

export interface PlayerEntity {
  id: number;
  tag: string;
  name: string;
  startingTrophies: number;
  trophyChange: number;
  crowns: number;
  kingTowerHitPoints: number;
  princessTowerHitPoints: number[];
  clan: Clan;
  globalRank: number;
  elixirLeaked: number;
  playerDeck: Deck;
}
