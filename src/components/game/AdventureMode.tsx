import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

interface AdventureModeProps {
  playerHealth: number;
  setPlayerHealth: (health: number) => void;
  playerScore: number;
  setPlayerScore: (score: number) => void;
  onBackToMenu: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Enemy {
  id: number;
  position: Position;
  health: number;
  lastShot: number;
}

interface Projectile {
  id: number;
  position: Position;
  velocity: { x: number; y: number };
  fromPlayer: boolean;
}

const AdventureMode = ({ playerHealth, setPlayerHealth, playerScore, setPlayerScore, onBackToMenu }: AdventureModeProps) => {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 50, y: 50 });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const nextEnemyId = useRef(0);
  const nextProjectileId = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
      
      if (e.key === ' ') {
        e.preventDefault();
        shoot();
      }
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

  useEffect(() => {
    if (isPaused) return;

    const gameLoop = setInterval(() => {
      setPlayerPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 0.8;

        if (keys.has('w') || keys.has('arrowup')) newY = Math.max(5, newY - speed);
        if (keys.has('s') || keys.has('arrowdown')) newY = Math.min(95, newY + speed);
        if (keys.has('a') || keys.has('arrowleft')) newX = Math.max(5, newX - speed);
        if (keys.has('d') || keys.has('arrowright')) newX = Math.min(95, newX + speed);

        return { x: newX, y: newY };
      });

      setProjectiles(prev => {
        return prev
          .map(proj => ({
            ...proj,
            position: {
              x: proj.position.x + proj.velocity.x,
              y: proj.position.y + proj.velocity.y
            }
          }))
          .filter(proj => 
            proj.position.x > 0 && proj.position.x < 100 &&
            proj.position.y > 0 && proj.position.y < 100
          );
      });

      setEnemies(prev => {
        const now = Date.now();
        return prev.map(enemy => {
          if (now - enemy.lastShot > 2000) {
            enemyShoot(enemy);
            return { ...enemy, lastShot: now };
          }
          return enemy;
        }).filter(enemy => enemy.health > 0);
      });

      checkCollisions();

    }, 16);

    const spawnEnemies = setInterval(() => {
      if (enemies.length < 5) {
        const newEnemy: Enemy = {
          id: nextEnemyId.current++,
          position: {
            x: Math.random() * 80 + 10,
            y: Math.random() * 30 + 10
          },
          health: 3,
          lastShot: Date.now()
        };
        setEnemies(prev => [...prev, newEnemy]);
      }
    }, 3000);

    return () => {
      clearInterval(gameLoop);
      clearInterval(spawnEnemies);
    };
  }, [keys, isPaused, enemies, projectiles, playerPos]);

  const shoot = () => {
    const newProjectile: Projectile = {
      id: nextProjectileId.current++,
      position: { ...playerPos },
      velocity: { x: 0, y: -2 },
      fromPlayer: true
    };
    setProjectiles(prev => [...prev, newProjectile]);
  };

  const enemyShoot = (enemy: Enemy) => {
    const angle = Math.atan2(playerPos.y - enemy.position.y, playerPos.x - enemy.position.x);
    const speed = 1.5;
    
    const newProjectile: Projectile = {
      id: nextProjectileId.current++,
      position: { ...enemy.position },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      },
      fromPlayer: false
    };
    setProjectiles(prev => [...prev, newProjectile]);
  };

  const checkCollisions = () => {
    projectiles.forEach(proj => {
      if (proj.fromPlayer) {
        enemies.forEach(enemy => {
          const dist = Math.sqrt(
            Math.pow(proj.position.x - enemy.position.x, 2) +
            Math.pow(proj.position.y - enemy.position.y, 2)
          );
          
          if (dist < 3) {
            setEnemies(prev => prev.map(e => 
              e.id === enemy.id ? { ...e, health: e.health - 1 } : e
            ));
            setProjectiles(prev => prev.filter(p => p.id !== proj.id));
            
            if (enemy.health - 1 <= 0) {
              setPlayerScore(s => s + 100);
            }
          }
        });
      } else {
        const dist = Math.sqrt(
          Math.pow(proj.position.x - playerPos.x, 2) +
          Math.pow(proj.position.y - playerPos.y, 2)
        );
        
        if (dist < 3) {
          setPlayerHealth(h => Math.max(0, h - 10));
          setProjectiles(prev => prev.filter(p => p.id !== proj.id));
        }
      }
    });
  };

  if (playerHealth <= 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 animate-scale-in">
          <h2 className="text-6xl font-bold text-red-500 glow-text-red">GAME OVER</h2>
          <p className="text-3xl text-neon-orange">Счёт: {playerScore}</p>
          <Button onClick={onBackToMenu} className="bg-neon-cyan hover:bg-neon-cyan/80 text-game-bg font-bold text-lg px-8 py-4">
            В главное меню
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
        <div className="space-y-3 bg-game-bg/80 backdrop-blur-sm p-4 rounded-xl border border-neon-cyan/30">
          <div className="flex items-center gap-3">
            <Icon name="Heart" className="text-red-500" size={24} />
            <Progress value={playerHealth} className="w-48 h-3" />
            <span className="text-white font-bold min-w-[3rem]">{playerHealth}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="Trophy" className="text-neon-orange" size={24} />
            <span className="text-neon-cyan font-bold text-xl">{playerScore}</span>
          </div>
        </div>

        <Button 
          onClick={onBackToMenu}
          variant="outline"
          className="bg-game-bg/80 backdrop-blur-sm border-neon-orange hover:bg-neon-orange/20"
        >
          <Icon name="Home" className="mr-2" />
          Меню
        </Button>
      </div>

      <div 
        ref={gameRef}
        className="relative w-full h-[calc(100vh-8rem)] mt-20 bg-gradient-to-b from-purple-900/30 to-blue-900/30 rounded-xl border-2 border-neon-cyan/50 overflow-hidden shadow-2xl"
      >
        <div 
          className="absolute w-12 h-12 transition-all duration-75 ease-linear z-10"
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <img 
            src="https://cdn.poehali.dev/files/f3a83f0a-cd26-49d7-9c9d-11039da504b9.png" 
            alt="Буба" 
            className="w-full h-full object-contain drop-shadow-glow"
          />
        </div>

        {enemies.map(enemy => (
          <div
            key={enemy.id}
            className="absolute w-16 h-16 transition-all duration-100"
            style={{
              left: `${enemy.position.x}%`,
              top: `${enemy.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <div className="text-5xl animate-pulse">🤖</div>
              <div className="absolute -bottom-2 left-0 right-0">
                <Progress value={(enemy.health / 3) * 100} className="h-1" />
              </div>
            </div>
          </div>
        ))}

        {projectiles.map(proj => (
          <div
            key={proj.id}
            className={`absolute w-3 h-3 rounded-full transition-all duration-75 ${
              proj.fromPlayer ? 'bg-neon-cyan shadow-neon-cyan' : 'bg-red-500 shadow-red'
            }`}
            style={{
              left: `${proj.position.x}%`,
              top: `${proj.position.y}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: proj.fromPlayer ? '0 0 10px #00d9ff' : '0 0 10px #ff0000'
            }}
          />
        ))}

        <div className="absolute bottom-4 left-4 text-white/50 text-sm">
          <p>Враги: {enemies.length} | Снаряды: {projectiles.length}</p>
        </div>
      </div>
    </div>
  );
};

export default AdventureMode;
