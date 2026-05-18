import { problematicCard } from './ProblematicCard';

export interface ProblematicCardsReport {
  id: number;
  playerTag: string;
  totalLosses: number;
  problematicCards: problematicCard[];
  createdAt: Date;
}
