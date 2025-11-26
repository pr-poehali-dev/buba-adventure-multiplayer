import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface AdventureModeProps {
  playerName: string;
  onBack: () => void;
  onBossFight: () => void;
  isMultiplayer?: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  shootTimer: number;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy: boolean;
}

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  health: number;
}

const AdventureMode = ({ playerName, onBack, onBossFight, isMultiplayer }: AdventureModeProps) => {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 400, y: 500 });
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [score, setScore] = useState(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [otherPlayers, setOtherPlayers] = useState<Player[]>([]);
  const [touchMoving, setTouchMoving] = useState(false);
  const [touchDirection, setTouchDirection] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const spawnEnemy = useCallback(() => {
    const newEnemy: Enemy = {
      id: Math.random().toString(),
      x: Math.random() * 700 + 50,
      y: Math.random() * 300 + 50,
      health: 3,
      shootTimer: 0,
    };
    setEnemies(prev => [...prev, newEnemy]);
  }, []);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (enemies.length < 5) {
        spawnEnemy();
      }
    }, 3000);

    return () => clearInterval(spawnInterval);
  }, [enemies.length, spawnEnemy]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setPlayerPos(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keys.has('w') || keys.has('ц')) newY = Math.max(0, prev.y - 5);
        if (keys.has('s') || keys.has('ы')) newY = Math.min(550, prev.y + 5);
        if (keys.has('a') || keys.has('ф')) newX = Math.max(0, prev.x - 5);
        if (keys.has('d') || keys.has('в')) newX = Math.min(750, prev.x + 5);

        if (touchMoving) {
          newX = Math.max(0, Math.min(750, prev.x + touchDirection.x * 5));
          newY = Math.max(0, Math.min(550, prev.y + touchDirection.y * 5));
        }

        return { x: newX, y: newY };
      });

      setBullets(prev => prev.map(bullet => ({
        ...bullet,
        x: bullet.x + bullet.vx,
        y: bullet.y + bullet.vy,
      })).filter(bullet => 
        bullet.x > 0 && bullet.x < 800 && bullet.y > 0 && bullet.y < 600
      ));

      setEnemies(prev => prev.map(enemy => ({
        ...enemy,
        shootTimer: enemy.shootTimer + 1,
      })));

      setEnemies(prev => {
        const updatedEnemies = [...prev];
        
        updatedEnemies.forEach(enemy => {
          if (enemy.shootTimer >= 60) {
            const angle = Math.atan2(playerPos.y - enemy.y, playerPos.x - enemy.x);
            const speed = 3;
            
            setBullets(prevBullets => [...prevBullets, {
              id: Math.random().toString(),
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              isEnemy: true,
            }]);

            enemy.shootTimer = 0;
          }
        });

        return updatedEnemies;
      });

      setBullets(prevBullets => {
        const remainingBullets = [...prevBullets];
        
        prevBullets.forEach(bullet => {
          if (bullet.isEnemy) {
            const distance = Math.sqrt(
              Math.pow(bullet.x - playerPos.x, 2) + Math.pow(bullet.y - playerPos.y, 2)
            );
            
            if (distance < 30) {
              setPlayerHealth(prev => Math.max(0, prev - 10));
              remainingBullets.splice(remainingBullets.indexOf(bullet), 1);
            }
          } else {
            setEnemies(prevEnemies => {
              const updatedEnemies = [...prevEnemies];
              
              prevEnemies.forEach((enemy, index) => {
                const distance = Math.sqrt(
                  Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
                );
                
                if (distance < 30) {
                  updatedEnemies[index] = { ...enemy, health: enemy.health - 1 };
                  remainingBullets.splice(remainingBullets.indexOf(bullet), 1);
                  
                  if (updatedEnemies[index].health <= 0) {
                    setScore(prev => prev + 100);
                    updatedEnemies.splice(index, 1);
                  }
                }
              });
              
              return updatedEnemies;
            });
          }
        });
        
        return remainingBullets;
      });

    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [keys, playerPos, enemies, touchMoving, touchDirection]);

  useEffect(() => {
    if (playerHealth <= 0) {
      toast.error('Игра окончена!');
      setTimeout(() => onBack(), 2000);
    }
  }, [playerHealth, onBack]);

  useEffect(() => {
    if (score >= 500) {
      toast.success('Босс появился!');
      setTimeout(() => onBossFight(), 1000);
    }
  }, [score, onBossFight]);

  const handleShoot = (direction: 'up' | 'down' | 'left' | 'right') => {
    const velocities = {
      up: { vx: 0, vy: -7 },
      down: { vx: 0, vy: 7 },
      left: { vx: -7, vy: 0 },
      right: { vx: 7, vy: 0 },
    };

    const newBullet: Bullet = {
      id: Math.random().toString(),
      x: playerPos.x,
      y: playerPos.y,
      ...velocities[direction],
      isEnemy: false,
    };

    setBullets(prev => [...prev, newBullet]);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchMoving) return;
    
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    const centerX = playerPos.x;
    const centerY = playerPos.y;
    
    const dirX = touchX - centerX;
    const dirY = touchY - centerY;
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    
    if (length > 10) {
      setTouchDirection({
        x: dirX / length,
        y: dirY / length,
      });
    }
  };

  const handleTouchEnd = () => {
    setTouchMoving(false);
    setTouchDirection({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (isMultiplayer) {
      const mockPlayers: Player[] = [
        { id: '1', name: 'Игрок 2', x: 200, y: 300, health: 100 },
        { id: '2', name: 'Игрок 3', x: 600, y: 300, health: 85 },
      ];
      setOtherPlayers(mockPlayers);
    }
  }, [isMultiplayer]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex gap-4 items-center">
          <Button onClick={onBack} variant="outline" className="border-cyan-500 text-cyan-400">
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            Меню
          </Button>
          <span className="text-cyan-400 text-xl font-bold">{playerName}</span>
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <Icon name="Heart" className="text-red-500" size={24} />
            <span className="text-white text-xl font-bold">{playerHealth}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Trophy" className="text-yellow-500" size={24} />
            <span className="text-white text-xl font-bold">{score}</span>
          </div>
        </div>
      </div>

      <div 
        className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900"
        onTouchStart={() => setTouchMoving(true)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-48 bg-slate-700 rounded"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-slate-700 rounded"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-56 bg-slate-700 rounded"></div>
        </div>

        <div
          className="absolute w-12 h-12 transition-all duration-100 z-20"
          style={{
            left: `${playerPos.x}px`,
            top: `${playerPos.y}px`,
            backgroundImage: 'url(https://cdn.poehali.dev/files/f3a83f0a-cd26-49d7-9c9d-11039da504b9.png)',
            backgroundSize: 'cover',
            filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.8))',
          }}
        />

        {otherPlayers.map(player => (
          <div
            key={player.id}
            className="absolute w-12 h-12 transition-all duration-100"
            style={{
              left: `${player.x}px`,
              top: `${player.y}px`,
              backgroundImage: 'url(https://cdn.poehali.dev/files/f3a83f0a-cd26-49d7-9c9d-11039da504b9.png)',
              backgroundSize: 'cover',
              filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))',
            }}
          >
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap">
              {player.name}
            </span>
          </div>
        ))}

        {enemies.map(enemy => (
          <div
            key={enemy.id}
            className="absolute w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center border-2 border-red-400"
            style={{
              left: `${enemy.x}px`,
              top: `${enemy.y}px`,
              boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)',
            }}
          >
            <Icon name="Bot" size={32} className="text-red-900" />
            <div className="absolute -top-2 left-0 right-0 h-1 bg-slate-700 rounded">
              <div
                className="h-full bg-green-500 rounded transition-all"
                style={{ width: `${(enemy.health / 3) * 100}%` }}
              />
            </div>
          </div>
        ))}

        {bullets.map(bullet => (
          <div
            key={bullet.id}
            className={`absolute w-3 h-3 rounded-full ${
              bullet.isEnemy ? 'bg-red-500' : 'bg-cyan-400'
            }`}
            style={{
              left: `${bullet.x}px`,
              top: `${bullet.y}px`,
              boxShadow: `0 0 10px ${bullet.isEnemy ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 211, 238, 0.8)'}`,
            }}
          />
        ))}
      </div>

      <div className="p-4 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex justify-center gap-4">
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleShoot('up')}
              onTouchStart={(e) => { e.preventDefault(); handleShoot('up'); }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-b from-cyan-500 to-blue-600 active:scale-95 transition-transform"
            >
              <Icon name="ArrowUp" size={28} />
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={() => handleShoot('left')}
                onTouchStart={(e) => { e.preventDefault(); handleShoot('left'); }}
                className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 to-blue-600 active:scale-95 transition-transform"
              >
                <Icon name="ArrowLeft" size={28} />
              </Button>
              <Button
                onClick={() => handleShoot('down')}
                onTouchStart={(e) => { e.preventDefault(); handleShoot('down'); }}
                className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-t from-cyan-500 to-blue-600 active:scale-95 transition-transform"
              >
                <Icon name="ArrowDown" size={28} />
              </Button>
              <Button
                onClick={() => handleShoot('right')}
                onTouchStart={(e) => { e.preventDefault(); handleShoot('right'); }}
                className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-l from-cyan-500 to-blue-600 active:scale-95 transition-transform"
              >
                <Icon name="ArrowRight" size={28} />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-center text-cyan-400 mt-2 text-xs sm:text-sm">
          📱 Касайтесь экрана для движения | 🎯 Кнопки для стрельбы
        </p>
      </div>
    </div>
  );
};

export default AdventureMode;