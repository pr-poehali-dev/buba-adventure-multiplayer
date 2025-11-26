import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface BossModeProps {
  playerName: string;
  onBack: () => void;
  onWin: () => void;
}

interface Attack {
  id: string;
  type: 'projectile' | 'summon' | 'laser';
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  width?: number;
}

interface MiniRobot {
  id: string;
  x: number;
  y: number;
  health: number;
}

const BossMode = ({ playerName, onBack, onWin }: BossModeProps) => {
  const [bossHealth, setBossHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [miniRobots, setMiniRobots] = useState<MiniRobot[]>([]);
  const [playerX, setPlayerX] = useState(400);
  const [attackPhase, setAttackPhase] = useState(0);
  const [canDodge, setCanDodge] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const spawnProjectile = useCallback(() => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3;
    
    setAttacks(prev => [...prev, {
      id: Math.random().toString(),
      type: 'projectile',
      x: 400,
      y: 100,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    }]);
  }, []);

  const spawnLaser = useCallback(() => {
    const laserX = Math.random() * 700 + 50;
    
    setAttacks(prev => [...prev, {
      id: Math.random().toString(),
      type: 'laser',
      x: laserX,
      y: 0,
      width: 50,
    }]);

    setTimeout(() => {
      setAttacks(prev => prev.filter(a => a.x !== laserX));
    }, 2000);
  }, []);

  const summonMiniRobots = useCallback(() => {
    const newRobots: MiniRobot[] = [];
    for (let i = 0; i < 3; i++) {
      newRobots.push({
        id: Math.random().toString(),
        x: Math.random() * 600 + 100,
        y: Math.random() * 200 + 200,
        health: 2,
      });
    }
    setMiniRobots(prev => [...prev, ...newRobots]);
  }, []);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setAttackPhase(prev => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(phaseInterval);
  }, []);

  useEffect(() => {
    const attackInterval = setInterval(() => {
      if (bossHealth > 0) {
        switch (attackPhase) {
          case 0:
            for (let i = 0; i < 5; i++) {
              setTimeout(() => spawnProjectile(), i * 200);
            }
            break;
          case 1:
            summonMiniRobots();
            break;
          case 2:
            for (let i = 0; i < 3; i++) {
              setTimeout(() => spawnLaser(), i * 500);
            }
            break;
        }
      }
    }, 3000);

    return () => clearInterval(attackInterval);
  }, [attackPhase, bossHealth, spawnProjectile, spawnLaser, summonMiniRobots]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setAttacks(prev => prev.map(attack => {
        if (attack.type === 'projectile' && attack.vx && attack.vy) {
          return {
            ...attack,
            x: attack.x + attack.vx,
            y: attack.y + attack.vy,
          };
        }
        return attack;
      }).filter(attack => {
        if (attack.type === 'projectile') {
          return attack.x > 0 && attack.x < 800 && attack.y > 0 && attack.y < 600;
        }
        return true;
      }));

      setAttacks(prevAttacks => {
        prevAttacks.forEach(attack => {
          if (attack.type === 'projectile') {
            const distance = Math.sqrt(
              Math.pow(attack.x - playerX, 2) + Math.pow(attack.y - 500, 2)
            );
            
            if (distance < 30) {
              setPlayerHealth(prev => Math.max(0, prev - 5));
              setAttacks(prev => prev.filter(a => a.id !== attack.id));
            }
          }
          
          if (attack.type === 'laser') {
            const isInLaser = playerX > attack.x && playerX < attack.x + (attack.width || 50);
            if (isInLaser) {
              setPlayerHealth(prev => Math.max(0, prev - 2));
            }
          }
        });

        return prevAttacks;
      });

      setMiniRobots(prevRobots => {
        prevRobots.forEach(robot => {
          const distance = Math.sqrt(
            Math.pow(robot.x - playerX, 2) + Math.pow(robot.y - 500, 2)
          );
          
          if (distance < 40) {
            setPlayerHealth(prev => Math.max(0, prev - 3));
          }
        });

        return prevRobots;
      });

    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [playerX]);

  useEffect(() => {
    if (playerHealth <= 0) {
      toast.error('Поражение!');
      setTimeout(() => onBack(), 2000);
    }
  }, [playerHealth, onBack]);

  useEffect(() => {
    if (bossHealth <= 0) {
      toast.success('Победа! Босс повержен!');
      setTimeout(() => onWin(), 2000);
    }
  }, [bossHealth, onWin]);

  const handleDodge = (direction: 'left' | 'right') => {
    if (!canDodge) return;

    const dodgeDistance = 100;
    setPlayerX(prev => {
      if (direction === 'left') {
        return Math.max(50, prev - dodgeDistance);
      } else {
        return Math.min(750, prev + dodgeDistance);
      }
    });

    setCanDodge(false);
    setTimeout(() => setCanDodge(true), 500);
  };

  const handleAttack = (attackType: 'punch' | 'heavy' | 'special') => {
    if (isAttacking) return;

    setIsAttacking(true);
    
    const damages = {
      punch: 5,
      heavy: 10,
      special: 15,
    };

    setBossHealth(prev => Math.max(0, prev - damages[attackType]));

    if (attackType === 'special') {
      setMiniRobots([]);
    }

    setTimeout(() => setIsAttacking(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || !canDodge) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleDodge('right');
      } else {
        handleDodge('left');
      }
      setTouchStartX(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex gap-4 items-center">
          <Button onClick={onBack} variant="outline" className="border-cyan-500 text-cyan-400">
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            Назад
          </Button>
          <span className="text-cyan-400 text-xl font-bold">{playerName}</span>
        </div>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <Icon name="Heart" className="text-red-500" size={24} />
            <span className="text-white text-xl font-bold">{playerHealth}</span>
          </div>
        </div>
      </div>

      <div 
        className="flex-1 relative overflow-hidden bg-gradient-to-b from-red-900 via-slate-900 to-slate-800"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Skull" className="text-red-500" size={32} />
            <span className="text-red-400 text-2xl font-bold">ГИГАНТСКИЙ РОБОТ</span>
          </div>
          <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
              style={{ width: `${bossHealth}%` }}
            />
          </div>
        </div>

        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(127, 29, 29, 0.8)',
            border: '4px solid rgba(220, 38, 38, 0.6)',
            boxShadow: '0 0 40px rgba(220, 38, 38, 0.8)',
          }}
        >
          <Icon name="Bot" size={120} className="text-red-300" />
        </div>

        {attacks.map(attack => {
          if (attack.type === 'projectile') {
            return (
              <div
                key={attack.id}
                className="absolute w-6 h-6 rounded-full bg-orange-500"
                style={{
                  left: `${attack.x}px`,
                  top: `${attack.y}px`,
                  boxShadow: '0 0 15px rgba(249, 115, 22, 0.9)',
                }}
              />
            );
          }
          
          if (attack.type === 'laser') {
            return (
              <div
                key={attack.id}
                className="absolute h-full bg-red-500/60 animate-pulse"
                style={{
                  left: `${attack.x}px`,
                  width: `${attack.width}px`,
                  boxShadow: '0 0 30px rgba(239, 68, 68, 0.9)',
                }}
              />
            );
          }
          
          return null;
        })}

        {miniRobots.map(robot => (
          <div
            key={robot.id}
            className="absolute w-12 h-12 bg-red-700 rounded flex items-center justify-center"
            style={{
              left: `${robot.x}px`,
              top: `${robot.y}px`,
              boxShadow: '0 0 15px rgba(185, 28, 28, 0.7)',
            }}
          >
            <Icon name="Bot" size={24} className="text-red-300" />
          </div>
        ))}

        <div
          className="absolute w-12 h-12 transition-all duration-200"
          style={{
            left: `${playerX}px`,
            bottom: '80px',
            backgroundImage: 'url(https://cdn.poehali.dev/files/f3a83f0a-cd26-49d7-9c9d-11039da504b9.png)',
            backgroundSize: 'cover',
            filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 0.9))',
          }}
        />
      </div>

      <div className="p-4 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex justify-center gap-4 sm:gap-8">
          <div className="flex flex-col gap-2">
            <span className="text-cyan-400 text-xs sm:text-sm text-center">Уворот</span>
            <div className="flex gap-2">
              <Button
                onClick={() => handleDodge('left')}
                onTouchStart={(e) => { e.preventDefault(); handleDodge('left'); }}
                disabled={!canDodge}
                className="w-16 h-14 sm:w-20 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-700 disabled:opacity-50 active:scale-95 transition-transform"
              >
                <Icon name="ChevronsLeft" size={28} />
              </Button>
              <Button
                onClick={() => handleDodge('right')}
                onTouchStart={(e) => { e.preventDefault(); handleDodge('right'); }}
                disabled={!canDodge}
                className="w-16 h-14 sm:w-20 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-700 disabled:opacity-50 active:scale-95 transition-transform"
              >
                <Icon name="ChevronsRight" size={28} />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-cyan-400 text-xs sm:text-sm text-center">Атаки</span>
            <div className="flex gap-2">
              <Button
                onClick={() => handleAttack('punch')}
                onTouchStart={(e) => { e.preventDefault(); handleAttack('punch'); }}
                disabled={isAttacking}
                className="w-16 h-14 sm:w-20 sm:h-16 bg-gradient-to-r from-cyan-500 to-blue-600 active:scale-95 transition-transform"
              >
                <Icon name="Zap" size={24} />
              </Button>
              <Button
                onClick={() => handleAttack('heavy')}
                onTouchStart={(e) => { e.preventDefault(); handleAttack('heavy'); }}
                disabled={isAttacking}
                className="w-16 h-14 sm:w-20 sm:h-16 bg-gradient-to-r from-orange-500 to-red-600 active:scale-95 transition-transform"
              >
                <Icon name="Flame" size={24} />
              </Button>
              <Button
                onClick={() => handleAttack('special')}
                onTouchStart={(e) => { e.preventDefault(); handleAttack('special'); }}
                disabled={isAttacking}
                className="w-16 h-14 sm:w-20 sm:h-16 bg-gradient-to-r from-yellow-500 to-orange-600 active:scale-95 transition-transform"
              >
                <Icon name="Sparkles" size={24} />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-center text-cyan-400 mt-2 text-xs sm:text-sm">
          📱 Проведи пальцем для уворота | 👊 Нажми для атаки
        </p>
      </div>
    </div>
  );
};

export default BossMode;