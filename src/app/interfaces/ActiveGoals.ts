import { MostAdvanced } from './MostAdvanced';

export interface ActiveGoals {
  id: number;
  count: number;
  nearestDeadLine: number;
  mostAdvanced: MostAdvanced;
}
