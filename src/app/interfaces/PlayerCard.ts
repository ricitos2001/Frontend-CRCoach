import { PlayerProfile } from './PlayerProfile';
import { IconUrl } from './IconUrl';

export interface PlayerCard {
  id: number;
  cardId: number;
  name: string;
  level: number;
  maxLevel: number;
  evolutionLevel: number;
  maxEvolutionLevel: number;
  rarity: string;
  count: string;
  elixirCost: string;
  iconUrl: IconUrl;
  playerProfile: PlayerProfile;
  supportCard: Boolean;
  useType: string;
}
