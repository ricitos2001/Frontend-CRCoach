import { problematicCard } from './ProblematicCard';

export interface problematicCardsReport {
  id: number;
  playerTag: string;
  totalLosses: number;
  problematicCards: problematicCard[];
  createdAt: Date;
}
