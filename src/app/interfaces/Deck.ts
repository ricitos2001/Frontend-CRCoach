import { PlayerCard } from './PlayerCard';

export interface Deck {
  id: number;
  archetype: string;
  playerCards: PlayerCard[];
}
