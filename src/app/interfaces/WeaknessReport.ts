import { ArchetypeStat } from './ArchetypeStat';

export interface WeaknessReport {
  id: number;
  playerTag: string;
  totalBattles: number;
  periodFrom: string;
  periodTo: string;
  byArchetypeJson: string;
  weakestArchetype: ArchetypeStat;
  strongestArchetype: string;
  createdAt: Date;
}
