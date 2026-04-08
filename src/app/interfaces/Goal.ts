import { User } from './User';

export interface Goal {
  id: number;
  title: string;
  description: string;
  metrycType: string;
  targetValue: number;
  currentValue: number;
  status: string;
  deadline: string;
  createdAt: Date;
  user: User;
}
