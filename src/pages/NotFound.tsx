import { useLocation } from "react-router-dom";
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

/* ── SNAKE GAME ─────────────────────────────────────── */
const COLS = 20;
const ROWS = 16;
const CELL = 18;
const DIRS = { ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0] };

function randomFood(snake: number[][]) {
  let pos: number[];
  do { pos = [Math.floor(Math.random()*COLS), Math.floor(Math.random()*ROWS)]; }
  while (snake.some(([x,y]) => x===pos[0] && y===pos[1]));
  return pos;
}

function SnakeGame() {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [[10,8],[9,8],[8,8]],
    dir: [1,0] as number[],
    nextDir: [1,0] as number[],
    food: [15,8] as number[],
    score: 0,
    alive: true,
    started: false,
  });
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [started, setStarted] = useState(false);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = stateRef.current;

    ctx.fillStyle = 'hsl(var(--secondary))';
    ctx.fillRect(0, 0, COLS*CELL, ROWS*CELL);

    // Grid dots
    ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.15)';
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        ctx.fillRect(x*CELL + CELL/2 - 1, y*CELL + CELL/2 - 1, 2, 2);

    // Food
    const [fx, fy] = s.food;
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.beginPath();
    ctx.arc(fx*CELL + CELL/2, fy*CELL + CELL/2, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'hsl(var(--foreground))';
    ctx.beginPath();
    ctx.arc(fx*CELL + CELL/2 - 2, fy*CELL + CELL/2 - 2, 2.5, 0, Math.PI*2);
    ctx.fill();

    // Snake
    s.snake.forEach(([x,y], i) => {
      const alpha = i === 0 ? 1 : 0.75 - (i / s.snake.length) * 0.3;
      ctx.fillStyle = i === 0 ? 'hsl(var(--primary))' : `hsl(var(--primary) / ${alpha})`;
      const pad = i === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(x*CELL+pad, y*CELL+pad, CELL-pad*2, CELL-pad*2, 4);
      ctx.fill();
      // Eye on head
      if (i === 0) {
        ctx.fillStyle = 'hsl(var(--primary-foreground))';
        const [dx, dy] = s.dir;
        const ex = x*CELL + CELL/2 + dx*4 + dy*3;
        const ey = y*CELL + CELL/2 + dy*4 - dx*3;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = 'hsl(var(--foreground))';
        ctx.beginPath();
        ctx.arc(ex + dx*0.8, ey + dy*0.8, 1.2, 0, Math.PI*2);
        ctx.fill();
      }
    });
  }, []);

  const loop = useCallback((ts: number) => {
    const s = stateRef.current;
    if (!s.alive || !s.started) return;
    if (ts - lastRef.current > 130) {
      lastRef.current = ts;
      s.dir = s.nextDir;
      const [hx, hy] = s.snake[0];
      const [dx, dy] = s.dir;
      const nx = hx + dx, ny = hy + dy;

      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS || s.snake.some(([x,y]) => x===nx && y===ny)) {
        s.alive = false;
        setDead(true);
        draw();
        return;
      }

      const ate = nx === s.food[0] && ny === s.food[1];
      s.snake = [[nx,ny], ...s.snake];
      if (!ate) s.snake.pop();
      else { s.score++; setScore(s.score); s.food = randomFood(s.snake); }
      draw();
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.snake = [[10,8],[9,8],[8,8]];
    s.dir = [1,0]; s.nextDir = [1,0];
    s.food = randomFood(s.snake);
    s.score = 0; s.alive = true; s.started = true;
    setScore(0); setDead(false); setStarted(true);
    lastRef.current = 0;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    draw();
    const onKey = (e: KeyboardEvent) => {
      if (DIRS[e.key]) {
        e.preventDefault();
        const s = stateRef.current;
        const nd = DIRS[e.key];
        if (nd[0] !== -s.dir[0] || nd[1] !== -s.dir[1]) s.nextDir = nd;
        if (!s.started) start();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); cancelAnimationFrame(rafRef.current); };
  }, [draw, start]);

  // Mobile controls
  const press = (key: string) => {
    const e = new KeyboardEvent('keydown', { key, bubbles: true });
    window.dispatchEvent(e);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between mb-0.5" style={{ width: COLS*CELL }}>
        <span className="uc-eyebrow">Snake</span>
        <span className="text-sm font-bold text-primary">{score} pts</span>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden border border-border shadow-sm cursor-pointer"
        onClick={() => !started && start()}
      >
        <canvas ref={canvasRef} width={COLS*CELL} height={ROWS*CELL} className="block" />

        {/* Overlay */}
        {(!started || dead) && (
          <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5">
            {dead && <p className="text-xs font-bold text-primary tracking-wide">GAME OVER · {score} pts</p>}
            <Button onClick={start} size="sm" className="font-semibold">
              {dead ? 'Play Again' : 'Start Game'}
            </Button>
            <p className="text-xs text-muted-foreground">Arrow keys or buttons below</p>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      <div className="flex flex-col items-center gap-1 mt-1">
        <button onClick={() => press('ArrowUp')} className="uc-dpad-btn">▲</button>
        <div className="flex gap-1">
          <button onClick={() => press('ArrowLeft')} className="uc-dpad-btn">◀</button>
          <button onClick={() => press('ArrowDown')} className="uc-dpad-btn">▼</button>
          <button onClick={() => press('ArrowRight')} className="uc-dpad-btn">▶</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   NOT FOUND PAGE
══════════════════════════════════════════════════════ */
const NotFound = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [dots, setDots] = useState('.');

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-secondary/40 flex items-center justify-center px-4 py-10 animate-fade-in">
      <div className="w-full max-w-lg flex flex-col items-center gap-6">
        {/* Status message */}
        <div className="text-center">
          {/* Signal icon */}
          <div className="flex items-end justify-center gap-1 mb-5 h-7">
            {[0.3, 0.55, 0.8, 1].map((h, i) => (
              <div
                key={i}
                className={`w-2 rounded ${i < 2 ? 'bg-primary animate-pulse' : 'bg-muted'}`}
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>

          <p className="uc-eyebrow mb-2">Connection Issue</p>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 leading-tight">
            Your connection seems <span className="text-primary">unstable.</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            We're having trouble reaching this page. Check your Wi-Fi or try again in a moment{dots}
          </p>
        </div>

        {/* Card with game */}
        <div className="uc-card p-6 w-full">
          <p className="text-center text-sm text-muted-foreground mb-4">
            While you wait — play a quick game 🐍
          </p>
          <SnakeGame />
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap justify-center">
          <Button onClick={() => window.location.reload()} className="font-semibold">
            Try Again
          </Button>
          <Button asChild variant="outline" className="font-semibold">
            <a href="/">Go Home</a>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
