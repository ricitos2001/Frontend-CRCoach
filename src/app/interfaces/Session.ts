import { User } from './User';

export interface Session {
  id: number;
  title: string;
  notes: string;
  mood: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  user: User;
}
