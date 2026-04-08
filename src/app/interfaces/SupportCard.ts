import { IconUrl } from './IconUrl';
import { PlayerProfile } from './PlayerProfile';

export interface SupportCard {
  id: number;
  cardId: number;
  name: string;
  level: number;
  maxLevel: number;
  maxEvolutionLevel: number;
  rarity: string;
  count: string;
  iconUrl: IconUrl;
  playerProfile: PlayerProfile;
  supportCard: Boolean;
}
