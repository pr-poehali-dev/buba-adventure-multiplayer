import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import MainMenu from '@/components/game/MainMenu';
import AdventureMode from '@/components/game/AdventureMode';
import BossMode from '@/components/game/BossMode';

export type GameMode = 'menu' | 'adventure' | 'boss' | 'multiplayer';

const GameMain = () => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerScore, setPlayerScore] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameMode !== 'menu') {
        setGameMode('menu');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameMode]);

  const resetGame = () => {
    setPlayerHealth(100);
    setPlayerScore(0);
  };

  const handleModeSelect = (mode: GameMode) => {
    resetGame();
    setGameMode(mode);
  };

  return (
    <div className="min-h-screen bg-game-bg overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      {gameMode === 'menu' && (
        <MainMenu onSelectMode={handleModeSelect} />
      )}

      {gameMode === 'adventure' && (
        <AdventureMode 
          playerHealth={playerHealth}
          setPlayerHealth={setPlayerHealth}
          playerScore={playerScore}
          setPlayerScore={setPlayerScore}
          onBackToMenu={() => setGameMode('menu')}
        />
      )}

      {gameMode === 'boss' && (
        <BossMode
          playerHealth={playerHealth}
          setPlayerHealth={setPlayerHealth}
          playerScore={playerScore}
          setPlayerScore={setPlayerScore}
          onBackToMenu={() => setGameMode('menu')}
        />
      )}

      {gameMode === 'multiplayer' && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="text-6xl">🚧</div>
            <h2 className="text-4xl font-bold text-neon-cyan glow-text">
              Мультиплеер в разработке
            </h2>
            <p className="text-xl text-neon-orange">
              Скоро здесь можно будет играть с друзьями!
            </p>
            <Button 
              onClick={() => setGameMode('menu')}
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-game-bg font-bold text-lg px-8 py-6"
            >
              <Icon name="ArrowLeft" className="mr-2" />
              Вернуться в меню
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMain;
