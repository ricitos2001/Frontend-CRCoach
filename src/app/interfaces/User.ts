export interface User {
  id: number;
  name: string;
  surnames: string;
  username: string;
  email: string;
  phoneNumber: number;
  passwordHash: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
  playerTag: string;
  enabled: boolean;
}
