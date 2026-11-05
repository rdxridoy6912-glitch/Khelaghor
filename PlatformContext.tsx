import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, Transaction, GameItem, PlatformSettings, MatchRoom } from '../types';
import { soundFX } from '../utils/audio';

interface PlatformContextType {
  currentPlayer: Player | null;
  players: Player[];
  transactions: Transaction[];
  games: GameItem[];
  settings: PlatformSettings;
  lang: 'bn' | 'en';
  deviceMode: 'desktop' | 'mobile';
  isAdminLoggedIn: boolean;
  activeMatch: MatchRoom | null;
  setLang: (l: 'bn' | 'en') => void;
  setDeviceMode: (m: 'desktop' | 'mobile') => void;
  setIsAdminLoggedIn: (val: boolean) => void;
  registerPlayer: (data: { name: string; phone: string; dob: string; isAge18Plus: boolean; fbName?: string }) => { success: boolean; error?: string };
  loginPlayer: (identifier: string) => { success: boolean; error?: string };
  logoutPlayer: () => void;
  createDeposit: (data: { method: 'bkash' | 'nagad'; amount: number; senderPhone: string; trxId: string }) => { success: boolean; message: string };
  createCashout: (data: { method: 'bkash' | 'nagad'; amount: number; receiverPhone: string }) => { success: boolean; error?: string };
  approveTransaction: (trxId: string) => void;
  rejectTransaction: (trxId: string, reason?: string) => void;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  addNewGame: (gameData: Omit<GameItem, 'id'>) => void;
  updateGame: (gameId: string, updates: Partial<GameItem>) => void;
  adjustPlayerBalance: (playerId: string, deltaAmount: number, reason: string) => void;
  togglePlayerBan: (playerId: string) => void;
  startMatch: (gameId: string, mode: string, entryFee: number) => { success: boolean; room?: MatchRoom; error?: string };
  completeMatch: (roomId: string, winnerPlayerId: string, customPrize?: number) => void;
  exitMatch: () => void;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformTaxRate: 10,
  bkashNumber: '01712-984521',
  bkashType: 'Personal',
  nagadNumber: '01856-321478',
  nagadType: 'Personal',
  minDeposit: 50,
  minWithdrawal: 100,
  announcementNotice: '🔥 Welcome to KhelaGhor Arena! Play Ludo & Turbo Racing with bKash/Nagad instant cash out! 18+ Only.',
  announcementNoticeBn: '🔥 খেলাঘর অ্যারেনায় স্বাগতম! বিকাশ ও নগদ দিয়ে তাৎক্ষণিক উইথড্র করুন। লুডো ও কার রেস খেলে জিতুন নগদ টাকা! (১৮+ প্রযোজ্য)',
  isAutoApproveDeposits: false,
  maintenanceMode: false,
};

const DEFAULT_GAMES: GameItem[] = [
  {
    id: 'game_ludo',
    title: 'Ludo Battle Arena',
    titleBn: 'লুডো ব্যাটল অ্যারেনা',
    category: 'board',
    modes: ['1vs1', '2vs2', '4vs4'],
    entryFeeDefault: 50,
    minEntryFee: 10,
    maxEntryFee: 5000,
    maxPlayers: 4,
    bannerUrl: '/src/assets/images/ludo_championship_banner_1793894271009.jpg',
    isActive: true,
    description: 'Real-time multiplayer Ludo board with 1v1 duels, 2v2 team matches, and 4-player knockout battles.',
    descriptionBn: 'রিয়েল-টাইম মাল্টিপ্লেয়ার লুডো গেম। ১ বনাম ১, ২ বনাম ২ টিম ম্যাচ এবং ৪ জনের নকআউট যুদ্ধ।',
    rules: [
      'Roll 6 to open pawn from base.',
      'Safe zones (Stars) protect pawns from capture.',
      'Teammates do not capture each other in 2vs2.',
      'Platform fee/tax deducted from winner prize pool.'
    ]
  },
  {
    id: 'game_carrace',
    title: 'Nitro Speed Drift (1v1 to 7v7)',
    titleBn: 'নাইট্রো কার রেস (১vs১ থেকে ৭vs৭)',
    category: 'racing',
    modes: ['1vs1', '2vs2', '3vs3', '4vs4', '5vs5', '6vs6', '7vs7'],
    entryFeeDefault: 50,
    minEntryFee: 20,
    maxEntryFee: 5000,
    maxPlayers: 14,
    bannerUrl: '/src/assets/images/car_race_nitro_banner_1793894271859.jpg',
    isActive: true,
    description: 'High-speed 2D arcade car racing supporting duels and massive team battles from 1v1 up to 7v7 (14 cars on grid).',
    descriptionBn: 'উচ্চগতির আর্কেড কার রেসিং। ১vs১ একক থেকে শুরু করে ৭vs৭ (১৪ টি কারের মেগা শোডাউন)।',
    rules: [
      'Arrow keys / WASD or touch to steer, accelerate and brake.',
      'Collect Nitro orbs for hyper-speed boost.',
      'Avoid oil slicks that reduce steering control.',
      'First car (or team) wins tournament pool!'
    ]
  }
];

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p_1',
    playerTag: 'KG-7821',
    name: 'Ridoy Hossain',
    phone: '01712345678',
    facebookId: 'fb_ridoy',
    facebookName: 'Ridoy Hossain Pro',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RidoyPro&backgroundColor=10b981',
    dob: '1998-05-14',
    isAge18PlusVerified: true,
    balance: 850,
    matchesPlayed: 24,
    wins: 18,
    earnings: 3420,
    status: 'active',
    registeredAt: '2026-02-10'
  }
];

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [activeMatch, setActiveMatch] = useState<MatchRoom | null>(null);

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    try {
      const stored = localStorage.getItem('khelaghor_settings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [games, setGames] = useState<GameItem[]>(() => {
    try {
      const stored = localStorage.getItem('khelaghor_games');
      return stored ? JSON.parse(stored) : DEFAULT_GAMES;
    } catch {
      return DEFAULT_GAMES;
    }
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const stored = localStorage.getItem('khelaghor_players');
      return stored ? JSON.parse(stored) : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  });

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(() => {
    try {
      const storedId = localStorage.getItem('khelaghor_active_player_id');
      if (storedId) {
        const found = INITIAL_PLAYERS.find(p => p.id === storedId);
        if (found) return found;
      }
      return INITIAL_PLAYERS[0];
    } catch {
      return INITIAL_PLAYERS[0];
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem('khelaghor_transactions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('khelaghor_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('khelaghor_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('khelaghor_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('khelaghor_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (currentPlayer) {
      localStorage.setItem('khelaghor_active_player_id', currentPlayer.id);
    } else {
      localStorage.removeItem('khelaghor_active_player_id');
    }
  }, [currentPlayer]);

  const registerPlayer = (data: { name: string; phone: string; dob: string; isAge18Plus: boolean; fbName?: string }) => {
    if (!data.isAge18Plus) {
      return { success: false, error: lang === 'bn' ? 'প্লেয়ার রেজিস্ট্রেশন করতে হলে অবশ্যই ১৮+ বছর বয়সী হতে হবে!' : 'Player must be 18+ years old to register!' };
    }

    const birthDate = new Date(data.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      return { success: false, error: lang === 'bn' ? 'আপনার বয়স ১৮ বছরের কম। রেজিস্ট্রেশন সম্ভব নয়।' : 'Under 18 years old. Registration not allowed.' };
    }

    const cleanPhone = data.phone.trim();
    if (players.some(p => p.phone === cleanPhone)) {
      return { success: false, error: lang === 'bn' ? 'এই ফোন নম্বর দিয়ে ইতিমধ্যে একটি একাউন্ট খোলা আছে।' : 'Account already exists with this phone number.' };
    }

    const randomTagNum = Math.floor(1000 + Math.random() * 9000);
    const newPlayer: Player = {
      id: 'p_' + Date.now(),
      playerTag: `KG-${randomTagNum}`,
      name: data.name.trim(),
      phone: cleanPhone,
      facebookId: data.fbName ? `fb_${Date.now()}` : undefined,
      facebookName: data.fbName || undefined,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=059669`,
      dob: data.dob,
      isAge18PlusVerified: true,
      balance: 50, // Welcome signup bonus
      matchesPlayed: 0,
      wins: 0,
      earnings: 50,
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0]
    };

    setPlayers(prev => [newPlayer, ...prev]);
    setCurrentPlayer(newPlayer);
    soundFX.playWinFanfare();

    return { success: true };
  };

  const loginPlayer = (identifier: string) => {
    const clean = identifier.trim().toLowerCase();
    const found = players.find(p => p.phone === clean || p.playerTag.toLowerCase() === clean);
    if (!found) {
      return { success: false, error: lang === 'bn' ? 'প্লেয়ার খুঁজে পাওয়া যায়নি।' : 'Player not found.' };
    }
    if (found.status === 'banned') {
      return { success: false, error: lang === 'bn' ? 'একাউন্টটি নিষিদ্ধ (Banned) করা হয়েছে।' : 'Account is banned by Admin.' };
    }
    setCurrentPlayer(found);
    return { success: true };
  };

  const logoutPlayer = () => setCurrentPlayer(null);

  const createDeposit = (data: { method: 'bkash' | 'nagad'; amount: number; senderPhone: string; trxId: string }) => {
    if (!currentPlayer) return { success: false, message: 'Please login first' };
    if (data.amount < settings.minDeposit) {
      return {
        success: false,
        message: lang === 'bn' ? `সর্বনিম্ন ডিপোজিট ৳${settings.minDeposit}` : `Minimum deposit is ৳${settings.minDeposit}`
      };
    }

    const newTrx: Transaction = {
      id: 'trx_' + Date.now(),
      playerId: currentPlayer.id,
      playerTag: currentPlayer.playerTag,
      playerName: currentPlayer.name,
      type: 'deposit',
      method: data.method,
      amount: data.amount,
      taxDeducted: 0,
      netAmount: data.amount,
      phone: data.senderPhone,
      trxId: data.trxId.trim().toUpperCase(),
      status: 'pending',
      timestamp: new Date().toLocaleString(),
      note: `${data.method.toUpperCase()} Deposit by player`
    };

    setTransactions(prev => [newTrx, ...prev]);
    soundFX.playCoin();
    return {
      success: true,
      message: lang === 'bn' ? `ডিপোজিট রিকোয়েস্ট সফল হয়েছে! ট্রানজেকশন আইডি: ${data.trxId} অ্যাডমিন ভেরিফাই করে ব্যালেন্স যোগ করবেন।` : `Deposit submitted! TrxID: ${data.trxId}. Admin will review shortly.`
    };
  };

  const createCashout = (data: { method: 'bkash' | 'nagad'; amount: number; receiverPhone: string }) => {
    if (!currentPlayer) return { success: false, error: 'Please login first' };
    if (data.amount < settings.minWithdrawal) {
      return {
        success: false,
        error: lang === 'bn' ? `সর্বনিম্ন ক্যাশ আউট ৳${settings.minWithdrawal}` : `Minimum cash out is ৳${settings.minWithdrawal}`
      };
    }
    if (data.amount > currentPlayer.balance) {
      return {
        success: false,
        error: lang === 'bn' ? 'পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient wallet balance!'
      };
    }

    const taxAmount = Math.round((data.amount * settings.platformTaxRate) / 100);
    const netPayout = data.amount - taxAmount;

    const updatedBalance = currentPlayer.balance - data.amount;
    const updatedPlayer = { ...currentPlayer, balance: updatedBalance };
    setCurrentPlayer(updatedPlayer);
    setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? updatedPlayer : p));

    const newTrx: Transaction = {
      id: 'trx_' + Date.now(),
      playerId: currentPlayer.id,
      playerTag: currentPlayer.playerTag,
      playerName: currentPlayer.name,
      type: 'cashout',
      method: data.method,
      amount: data.amount,
      taxDeducted: taxAmount,
      netAmount: netPayout,
      phone: data.receiverPhone,
      status: 'pending',
      timestamp: new Date().toLocaleString(),
      note: `Platform fee: ${settings.platformTaxRate}% (৳${taxAmount}), Net: ৳${netPayout}`
    };

    setTransactions(prev => [newTrx, ...prev]);
    soundFX.playCoin();
    return { success: true };
  };

  const approveTransaction = (trxId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === trxId && t.status === 'pending') {
        if (t.type === 'deposit') {
          setPlayers(pList => pList.map(p => {
            if (p.id === t.playerId) {
              const updated = { ...p, balance: p.balance + t.netAmount };
              if (currentPlayer && currentPlayer.id === p.id) {
                setCurrentPlayer(updated);
              }
              return updated;
            }
            return p;
          }));
        }
        return { ...t, status: 'approved', note: (t.note || '') + ' - Approved by Admin' };
      }
      return t;
    }));
    soundFX.playWinFanfare();
  };

  const rejectTransaction = (trxId: string, reason: string = 'Verification failed') => {
    setTransactions(prev => prev.map(t => {
      if (t.id === trxId && t.status === 'pending') {
        if (t.type === 'cashout') {
          setPlayers(pList => pList.map(p => {
            if (p.id === t.playerId) {
              const updated = { ...p, balance: p.balance + t.amount };
              if (currentPlayer && currentPlayer.id === p.id) {
                setCurrentPlayer(updated);
              }
              return updated;
            }
            return p;
          }));
        }
        return { ...t, status: 'rejected', note: `Rejected: ${reason}` };
      }
      return t;
    }));
  };

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addNewGame = (gameData: Omit<GameItem, 'id'>) => {
    const newGame: GameItem = { ...gameData, id: 'game_' + Date.now() };
    setGames(prev => [newGame, ...prev]);
  };

  const updateGame = (gameId: string, updates: Partial<GameItem>) => {
    setGames(prev => prev.map(g => g.id === gameId ? { ...g, ...updates } : g));
  };

  const adjustPlayerBalance = (playerId: string, deltaAmount: number, reason: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const newBal = Math.max(0, p.balance + deltaAmount);
        const updated = { ...p, balance: newBal };
        if (currentPlayer && currentPlayer.id === playerId) {
          setCurrentPlayer(updated);
        }
        return updated;
      }
      return p;
    }));
  };

  const togglePlayerBan = (playerId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const newStatus = p.status === 'active' ? 'banned' : 'active';
        const updated = { ...p, status: newStatus as 'active' | 'banned' };
        if (currentPlayer && currentPlayer.id === playerId) {
          setCurrentPlayer(updated);
        }
        return updated;
      }
      return p;
    }));
  };

  const startMatch = (gameId: string, mode: string, entryFee: number) => {
    if (!currentPlayer) return { success: false, error: 'Please login first' };
    if (currentPlayer.balance < entryFee) {
      return { success: false, error: lang === 'bn' ? 'ম্যাচে যোগ দেওয়ার মতো পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient balance to join match!' };
    }

    const game = games.find(g => g.id === gameId);
    if (!game) return { success: false, error: 'Game not found' };

    let numPlayers = 2;
    if (mode === '1vs1') numPlayers = 2;
    else if (mode === '2vs2') numPlayers = 4;
    else if (mode === '3vs3') numPlayers = 6;
    else if (mode === '4vs4') numPlayers = 8;
    else if (mode === '5vs5') numPlayers = 10;
    else if (mode === '6vs6') numPlayers = 12;
    else if (mode === '7vs7') numPlayers = 14;

    const totalCollected = entryFee * numPlayers;
    const taxRate = settings.platformTaxRate;
    const platformCut = Math.round((totalCollected * taxRate) / 100);
    const prizePool = totalCollected - platformCut;

    const updatedBalance = currentPlayer.balance - entryFee;
    const updatedPlayer = { ...currentPlayer, balance: updatedBalance, matchesPlayed: currentPlayer.matchesPlayed + 1 };
    setCurrentPlayer(updatedPlayer);
    setPlayers(prev => prev.map(p => p.id === currentPlayer.id ? updatedPlayer : p));

    const room: MatchRoom = {
      id: 'room_' + Date.now(),
      gameId,
      gameTitle: lang === 'bn' ? game.titleBn : game.title,
      mode,
      entryFee,
      prizePool,
      taxRate,
      platformCut,
      maxPlayers: numPlayers,
      currentPlayers: numPlayers,
      status: 'in_progress',
      createdAt: new Date().toLocaleTimeString()
    };

    setActiveMatch(room);
    soundFX.playCoin();
    return { success: true, room };
  };

  const completeMatch = (roomId: string, winnerPlayerId: string, customPrize?: number) => {
    const prize = customPrize !== undefined ? customPrize : (activeMatch?.prizePool || 0);

    setPlayers(prev => prev.map(p => {
      if (p.id === winnerPlayerId) {
        const updated = {
          ...p,
          balance: p.balance + prize,
          wins: p.wins + 1,
          earnings: p.earnings + prize
        };
        if (currentPlayer && currentPlayer.id === winnerPlayerId) {
          setCurrentPlayer(updated);
        }
        return updated;
      }
      return p;
    }));

    soundFX.playWinFanfare();
    setActiveMatch(prev => prev ? { ...prev, status: 'completed' } : null);
  };

  const exitMatch = () => setActiveMatch(null);

  return (
    <PlatformContext.Provider
      value={{
        currentPlayer,
        players,
        transactions,
        games,
        settings,
        lang,
        deviceMode,
        isAdminLoggedIn,
        activeMatch,
        setLang,
        setDeviceMode,
        setIsAdminLoggedIn,
        registerPlayer,
        loginPlayer,
        logoutPlayer,
        createDeposit,
        createCashout,
        approveTransaction,
        rejectTransaction,
        updateSettings,
        addNewGame,
        updateGame,
        adjustPlayerBalance,
        togglePlayerBan,
        startMatch,
        completeMatch,
        exitMatch
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error('usePlatform must be used within a PlatformProvider');
  return context;
};
