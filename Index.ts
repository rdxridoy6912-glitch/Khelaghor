export type GameCategory = 'board' | 'racing' | 'cards' | 'action';

export interface Player {
  id: string;
  playerTag: string; // e.g. KG-8492
  name: string;
  phone: string;
  facebookId?: string;
  facebookName?: string;
  avatar: string;
  dob: string;
  isAge18PlusVerified: boolean;
  balance: number;
  matchesPlayed: number;
  wins: number;
  earnings: number;
  status: 'active' | 'banned';
  registeredAt: string;
}

export interface Transaction {
  id: string;
  playerId: string;
  playerTag: string;
  playerName: string;
  type: 'deposit' | 'cashout';
  method: 'bkash' | 'nagad';
  amount: number;
  taxDeducted: number;
  netAmount: number;
  phone: string;
  trxId?: string;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: string;
  note?: string;
}

export interface GameItem {
  id: string;
  title: string;
  titleBn: string;
  category: GameCategory;
  modes: string[]; // ['1vs1', '2vs2', '4vs4'] or ['1vs1', '2vs2', '3vs3', ..., '7vs7']
  entryFeeDefault: number;
  minEntryFee: number;
  maxEntryFee: number;
  maxPlayers: number;
  bannerUrl: string;
  isActive: boolean;
  description: string;
  descriptionBn: string;
  rules: string[];
}

export interface PlatformSettings {
  platformTaxRate: number; // percentage (e.g. 10%)
  bkashNumber: string;
  bkashType: 'Personal' | 'Merchant' | 'Agent';
  nagadNumber: string;
  nagadType: 'Personal' | 'Merchant';
  minDeposit: number;
  minWithdrawal: number;
  announcementNotice: string;
  announcementNoticeBn: string;
  isAutoApproveDeposits: boolean;
  maintenanceMode: boolean;
}

export interface MatchRoom {
  id: string;
  gameId: string;
  gameTitle: string;
  mode: string;
  entryFee: number;
  prizePool: number;
  taxRate: number;
  platformCut: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'in_progress' | 'completed';
  createdAt: string;
}
