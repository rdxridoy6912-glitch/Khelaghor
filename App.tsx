/**
· @license
· SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { LudoGame } from './components/LudoGame';
import { CarRacingGame } from './components/CarRacingGame';
import { WalletModal } from './components/WalletModal';
import { RegistrationModal } from './components/RegistrationModal';
import { AdminPanel } from './components/AdminPanel';
import { Smartphone, Monitor, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeMatch, deviceMode, setDeviceMode, lang } = usePlatform();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'games' | 'tournaments' | 'leaderboard' | 'admin'>('games');

  // Modals
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const mainView = (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      <div>
        <Navbar
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        <main className="pt-4">
          {activeMatch ? (
            activeMatch.gameId === 'game_ludo' ? (
              <LudoGame />
            ) : (
              <CarRacingGame />
            )
          ) : (
            <Lobby
              onOpenWallet={() => setIsWalletOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
              currentTab={currentTab === 'admin' ? 'games' : currentTab}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">খেলাঘর প্রো</span>
            <span>·</span>
            <span>© 2026 KhelaGhor Arena Bangladesh</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 text-rose-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>১৮+ শুধুমাত্র</span>
            </span>
            <span>·</span>
            <span>bKash &amp; Nagad Authorized</span>
            <span>·</span>
            <span>Fair Play Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />

      <RegistrationModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          if (currentTab === 'admin') setCurrentTab('games');
        }}
      />
    </div>
  );

  // If mobile app preview frame is toggled
  if (deviceMode === 'mobile') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6">
        {/* Frame Toolbar */}
        <div className="mb-3 flex items-center justify-between gap-4 w-full max-w-[430px] px-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Smartphone className="w-4 h-4" />
            <span>Mobile App Preview</span>
          </span>
          <button
            onClick={() => setDeviceMode('desktop')}
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg transition-colors"

            <Monitor className="w-3.5 h-3.5" />
            <span>Switch to Desktop</span>
          </button>
        </div>

        {/* Smartphone Shell Mockup */}
        <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800 overflow-hidden flex flex-col">
          {/* Dynamic Island notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
          </div>

          {/* Internal Screen Viewport */}
          <div className="w-full h-full rounded-[38px] overflow-y-auto overflow-x-hidden relative bg-[#090d16]">
            {mainView}
          </div>

          {/* Home indicator bar */}
          <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
        </div>
      </div>
    );
  }

  return mainView;
};

export default function App() {
  return (
    <PlatformProvider>
      <AppContent />
    </PlatformProvider>
  );
}
