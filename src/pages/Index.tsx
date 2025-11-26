import { useState } from 'react';
import MainMenu from '@/components/game/MainMenu';
import AdventureMode from '@/components/game/AdventureMode';
import BossMode from '@/components/game/BossMode';

export type GameMode = 'menu' | 'adventure' | 'boss' | 'multiplayer';

const Index = () => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [playerName, setPlayerName] = useState('');

  const renderGameMode = () => {
    switch (gameMode) {
      case 'menu':
        return <MainMenu onModeSelect={setGameMode} onPlayerNameSet={setPlayerName} />;
      case 'adventure':
        return <AdventureMode playerName={playerName} onBack={() => setGameMode('menu')} onBossFight={() => setGameMode('boss')} />;
      case 'boss':
        return <BossMode playerName={playerName} onBack={() => setGameMode('adventure')} onWin={() => setGameMode('adventure')} />;
      case 'multiplayer':
        return <AdventureMode playerName={playerName} onBack={() => setGameMode('menu')} onBossFight={() => setGameMode('boss')} isMultiplayer />;
      default:
        return <MainMenu onModeSelect={setGameMode} onPlayerNameSet={setPlayerName} />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {renderGameMode()}
    </div>
  );
};

export default Index;