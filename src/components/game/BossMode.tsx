import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

interface BossModeProps {
  playerHealth: number;
  setPlayerHealth: (health: number) => void;
  playerScore: number;
  setPlayerScore: (score: number) => void;
  onBackToMenu: () => void;
}

interface AttackButton {
  id: number;
  x: number;
  y: number;
  type: 'dodge' | 'attack';
}

const BossMode = ({ playerHealth, setPlayerHealth, playerScore, setPlayerScore, onBackToMenu }: BossModeProps) => {
  const [bossHealth, setBossHealth] = useState(100);
  const [phase, setPhase] = useState<'idle' | 'attack' | 'player-turn'>('idle');
  const [attackButtons, setAttackButtons] = useState<AttackButton[]>([]);
  const [playerDodgePos, setPlayerDodgePos] = useState(50);
  const [incomingProjectiles, setIncomingProjectiles] = useState<{id: number; x: number; speed: number}[]>([]);
  const [bossAttackType, setBossAttackType] = useState<'projectiles' | 'minions' | 'laser'>('projectiles');
  const [minions, setMinions] = useState<{id: number; x: number; health: number}[]>([]);

  useEffect(() => {
    if (phase === 'idle') {
      const timer = setTimeout(() => {
        startBossAttack();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'attack' && bossAttackType === 'projectiles') {
      const gameLoop = setInterval(() => {
        setIncomingProjectiles(prev => {
          const updated = prev.map(p => ({
            ...p,
            y: (p as any).y ? (p as any).y + p.speed : p.speed
          }));

          updated.forEach(p => {
            const projectileY = (p as any).y || 0;
            if (projectileY > 80 && projectileY < 90) {
              const distance = Math.abs(p.x - playerDodgePos);
              if (distance < 8) {
                setPlayerHealth(h => Math.max(0, h - 15));
              }
            }
          });

          return updated.filter(p => ((p as any).y || 0) < 100);
        });

        if (incomingProjectiles.length === 0) {
          setTimeout(() => setPhase('player-turn'), 500);
        }
      }, 50);

      return () => clearInterval(gameLoop);
    }
  }, [phase, bossAttackType, incomingProjectiles, playerDodgePos]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (phase === 'attack' && bossAttackType === 'projectiles') {
        if (e.key === 'ArrowLeft') {
          setPlayerDodgePos(p => Math.max(10, p - 5));
        } else if (e.key === 'ArrowRight') {
          setPlayerDodgePos(p => Math.min(90, p + 5));
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, bossAttackType]);

  const startBossAttack = () => {
    const attacks: ('projectiles' | 'minions' | 'laser')[] = ['projectiles', 'minions', 'laser'];
    const chosen = attacks[Math.floor(Math.random() * attacks.length)];
    setBossAttackType(chosen);
    setPhase('attack');

    if (chosen === 'projectiles') {
      const newProjectiles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: (i + 1) * 11,
        speed: 2 + Math.random(),
        y: 0
      } as any));
      setIncomingProjectiles(newProjectiles);
    } else if (chosen === 'minions') {
      const newMinions = Array.from({ length: 3 }, (_, i) => ({
        id: i,
        x: 25 + i * 25,
        health: 2
      }));
      setMinions(newMinions);
    } else if (chosen === 'laser') {
      setTimeout(() => setPhase('player-turn'), 2000);
    }
  };

  const handleAttackButton = (buttonId: number, type: 'dodge' | 'attack') => {
    if (type === 'attack') {
      const damage = 10 + Math.floor(Math.random() * 15);
      setBossHealth(h => Math.max(0, h - damage));
      setPlayerScore(s => s + damage * 10);
    }
    
    setAttackButtons(prev => prev.filter(b => b.id !== buttonId));

    if (attackButtons.length <= 1) {
      setTimeout(() => setPhase('idle'), 500);
    }
  };

  const attackMinion = (minionId: number) => {
    setMinions(prev => prev.map(m => 
      m.id === minionId ? { ...m, health: m.health - 1 } : m
    ).filter(m => m.health > 0));

    if (minions.length <= 1) {
      setTimeout(() => setPhase('player-turn'), 500);
    }
  };

  useEffect(() => {
    if (phase === 'player-turn') {
      const buttons: AttackButton[] = Array.from({ length: 4 }, (_, i) => ({
        id: i,
        x: 20 + i * 20,
        y: 70 + Math.random() * 10,
        type: Math.random() > 0.3 ? 'attack' : 'dodge'
      }));
      setAttackButtons(buttons);
    }
  }, [phase]);

  if (playerHealth <= 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 animate-scale-in">
          <h2 className="text-6xl font-bold text-red-500 glow-text-red">ПОРАЖЕНИЕ</h2>
          <p className="text-3xl text-neon-orange">Босс победил!</p>
          <Button onClick={onBackToMenu} className="bg-neon-cyan hover:bg-neon-cyan/80 text-game-bg font-bold">
            В главное меню
          </Button>
        </div>
      </div>
    );
  }

  if (bossHealth <= 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 animate-scale-in">
          <h2 className="text-6xl font-bold text-neon-cyan glow-text">ПОБЕДА!</h2>
          <p className="text-3xl text-neon-orange">Гигантский робот повержен!</p>
          <p className="text-2xl text-white">Счёт: {playerScore}</p>
          <Button onClick={onBackToMenu} className="bg-neon-cyan hover:bg-neon-cyan/80 text-game-bg font-bold">
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
            <span className="text-white font-bold">{playerHealth}%</span>
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

      <div className="relative w-full h-[calc(100vh-8rem)] mt-20 bg-gradient-to-b from-red-900/30 to-purple-900/30 rounded-xl border-2 border-red-500/50 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center space-y-3 z-10">
          <div className="text-8xl animate-pulse">🤖</div>
          <div className="text-2xl font-bold text-red-500 glow-text-red">ГИГАНТСКИЙ РОБОТ-БОСС</div>
          <Progress value={bossHealth} className="w-96 h-4 mx-auto" />
        </div>

        {phase === 'attack' && bossAttackType === 'projectiles' && (
          <div className="absolute inset-0">
            {incomingProjectiles.map(proj => (
              <div
                key={proj.id}
                className="absolute w-6 h-6 bg-red-500 rounded-full shadow-red animate-pulse"
                style={{
                  left: `${proj.x}%`,
                  top: `${(proj as any).y || 0}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 20px #ff0000'
                }}
              />
            ))}

            <div className="absolute bottom-20 left-0 right-0 h-20 bg-gradient-to-t from-game-bg/50 to-transparent">
              <div 
                className="absolute bottom-0 w-16 h-16 transition-all duration-100"
                style={{ left: `${playerDodgePos}%`, transform: 'translateX(-50%)' }}
              >
                <img 
                  src="https://cdn.poehali.dev/files/f3a83f0a-cd26-49d7-9c9d-11039da504b9.png" 
                  alt="Буба" 
                  className="w-full h-full object-contain drop-shadow-glow"
                />
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-neon-cyan font-bold text-lg">
              ← → Уворачивайся!
            </div>
          </div>
        )}

        {phase === 'attack' && bossAttackType === 'minions' && (
          <div className="absolute inset-0 flex items-center justify-center gap-12">
            {minions.map(minion => (
              <div 
                key={minion.id}
                onClick={() => attackMinion(minion.id)}
                className="cursor-pointer hover:scale-110 transition-transform text-center"
              >
                <div className="text-6xl animate-bounce">⚙️</div>
                <Progress value={(minion.health / 2) * 100} className="w-20 h-2 mt-2" />
              </div>
            ))}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-neon-cyan font-bold text-lg">
              Кликай по миньонам!
            </div>
          </div>
        )}

        {phase === 'attack' && bossAttackType === 'laser' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 animate-pulse">
              <div className="text-6xl">⚡</div>
              <div className="text-3xl font-bold text-yellow-400 glow-text">ЛАЗЕРНАЯ АТАКА!</div>
              <div className="w-full h-4 bg-yellow-500/50 animate-pulse" 
                   style={{ boxShadow: '0 0 30px #ffff00' }} />
            </div>
          </div>
        )}

        {phase === 'player-turn' && (
          <div className="absolute inset-0 flex items-end justify-center pb-20">
            <div className="space-y-6 text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-4">ВАШ ХОД!</div>
              <div className="flex gap-4">
                {attackButtons.map(button => (
                  <Button
                    key={button.id}
                    onClick={() => handleAttackButton(button.id, button.type)}
                    className={`text-2xl font-bold px-8 py-6 ${
                      button.type === 'attack' 
                        ? 'bg-neon-orange hover:bg-neon-orange/80' 
                        : 'bg-neon-cyan hover:bg-neon-cyan/80'
                    } text-game-bg transition-all hover:scale-110 animate-scale-in`}
                  >
                    {button.type === 'attack' ? '⚔️ АТАКА' : '🛡️ БЛОК'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {phase === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl text-neon-orange animate-pulse">
              Босс готовит атаку...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BossMode;
