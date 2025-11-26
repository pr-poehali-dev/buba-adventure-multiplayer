import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { GameMode } from '@/pages/GameMain';

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
}

const MainMenu = ({ onSelectMode }: MainMenuProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-neon-cyan/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-neon-orange/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center space-y-12 px-4">
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-center mb-8">
            <img 
              src="https://cdn.poehali.dev/files/f3a83f0a-cd26-49d7-9c9d-11039da504b9.png" 
              alt="Буба" 
              className="w-48 h-48 object-contain animate-scale-in drop-shadow-2xl hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          <h1 className="text-7xl font-bold text-neon-cyan glow-text tracking-wider">
            ПРИКЛЮЧЕНИЯ БУБЫ
          </h1>
          
          <p className="text-2xl text-neon-orange font-medium">
            Битва с роботами в открытом мире
          </p>
        </div>

        <div className="space-y-4 max-w-md mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Button
            onClick={() => onSelectMode('adventure')}
            className="w-full bg-neon-cyan hover:bg-neon-cyan/80 text-game-bg font-bold text-xl py-8 transition-all hover:scale-105 hover:shadow-neon-cyan shadow-lg group"
          >
            <Icon name="Map" className="mr-3 group-hover:rotate-12 transition-transform" size={28} />
            Режим приключений
          </Button>

          <Button
            onClick={() => onSelectMode('boss')}
            className="w-full bg-neon-orange hover:bg-neon-orange/80 text-game-bg font-bold text-xl py-8 transition-all hover:scale-105 hover:shadow-neon-orange shadow-lg group"
          >
            <Icon name="Skull" className="mr-3 group-hover:rotate-12 transition-transform" size={28} />
            Битва с боссом
          </Button>

          <Button
            onClick={() => onSelectMode('multiplayer')}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xl py-8 transition-all hover:scale-105 hover:shadow-purple shadow-lg group"
          >
            <Icon name="Users" className="mr-3 group-hover:rotate-12 transition-transform" size={28} />
            Мультиплеер
          </Button>
        </div>

        <div className="text-sm text-gray-400 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p>Управление: WASD или стрелки для движения, SPACE для атаки</p>
          <p className="mt-2">ESC - вернуться в меню</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
