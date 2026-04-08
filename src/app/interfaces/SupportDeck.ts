import { PlayerCard } from './PlayerCard';

export interface SupportDeck {
  id: number;
  archetype: string;
  playerCards: PlayerCard[];
}
