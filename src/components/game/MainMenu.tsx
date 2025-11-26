import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import type { GameMode } from '@/pages/Index';

interface MainMenuProps {
  onModeSelect: (mode: GameMode) => void;
  onPlayerNameSet: (name: string) => void;
}

const MainMenu = ({ onModeSelect, onPlayerNameSet }: MainMenuProps) => {
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('adventure');

  const handleStart = () => {
    if (playerName.trim()) {
      onPlayerNameSet(playerName);
      onModeSelect(selectedMode);
    }
  };

  const handleModeClick = (mode: GameMode) => {
    setSelectedMode(mode);
    setShowNameInput(true);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://cdn.poehali.dev/files/f3a83f0a-cd26-49d7-9c9d-11039da504b9.png')] bg-center bg-no-repeat bg-contain opacity-10 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.5)] animate-pulse">
            ПРИКЛЮЧЕНИЯ БУБЫ
          </h1>
          <p className="text-lg sm:text-xl text-orange-300">Спаси город от роботов!</p>
        </div>

        {!showNameInput ? (
          <div className="flex flex-col gap-4 w-full">
            <Button
              onClick={() => handleModeClick('adventure')}
              onTouchStart={(e) => { e.preventDefault(); handleModeClick('adventure'); }}
              className="h-14 sm:h-16 text-lg sm:text-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 active:scale-95 transition-transform text-white font-bold shadow-lg shadow-cyan-500/50"
            >
              <Icon name="Sword" className="mr-2" size={24} />
              Режим приключений
            </Button>
            
            <Button
              onClick={() => handleModeClick('boss')}
              onTouchStart={(e) => { e.preventDefault(); handleModeClick('boss'); }}
              className="h-14 sm:h-16 text-lg sm:text-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 active:scale-95 transition-transform text-white font-bold shadow-lg shadow-red-500/50"
            >
              <Icon name="Skull" className="mr-2" size={24} />
              Битва с боссом
            </Button>

            <Button
              onClick={() => handleModeClick('multiplayer')}
              onTouchStart={(e) => { e.preventDefault(); handleModeClick('multiplayer'); }}
              className="h-14 sm:h-16 text-lg sm:text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:scale-95 transition-transform text-white font-bold shadow-lg shadow-purple-500/50"
            >
              <Icon name="Users" className="mr-2" size={24} />
              Мультиплеер
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full bg-slate-800/80 p-6 rounded-lg backdrop-blur-sm">
            <h2 className="text-2xl text-cyan-400 text-center">Введи свое имя</h2>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Имя игрока"
              className="h-12 text-lg bg-slate-700 border-cyan-500 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleStart()}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={handleStart}
                onTouchStart={(e) => { e.preventDefault(); if (playerName.trim()) handleStart(); }}
                disabled={!playerName.trim()}
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:scale-95 transition-transform text-white font-bold"
              >
                <Icon name="Play" className="mr-2" size={20} />
                Начать игру
              </Button>
              <Button
                onClick={() => setShowNameInput(false)}
                onTouchStart={(e) => { e.preventDefault(); setShowNameInput(false); }}
                variant="outline"
                className="h-12 border-orange-500 text-orange-400 hover:bg-orange-500/20 active:scale-95 transition-transform"
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenu;