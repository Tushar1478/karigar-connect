import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";

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

    ctx.fillStyle = 'rgba(255,248,240,0.9)';
    ctx.fillRect(0, 0, COLS*CELL, ROWS*CELL);

    // Grid dots
    ctx.fillStyle = 'rgba(180,120,60,0.08)';
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        ctx.fillRect(x*CELL + CELL/2 - 1, y*CELL + CELL/2 - 1, 2, 2);

    // Food
    const [fx, fy] = s.food;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(fx*CELL + CELL/2, fy*CELL + CELL/2, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(fx*CELL + CELL/2 - 2, fy*CELL + CELL/2 - 2, 2.5, 0, Math.PI*2);
    ctx.fill();

    // Snake
    s.snake.forEach(([x,y], i) => {
      const alpha = i === 0 ? 1 : 0.75 - (i / s.snake.length) * 0.3;
      ctx.fillStyle = i === 0 ? '#c2410c' : `rgba(234,88,12,${alpha})`;
      const pad = i === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(x*CELL+pad, y*CELL+pad, CELL-pad*2, CELL-pad*2, 4);
      ctx.fill();
      // Eye on head
      if (i === 0) {
        ctx.fillStyle = '#fff';
        const [dx, dy] = s.dir;
        const ex = x*CELL + CELL/2 + dx*4 + dy*3;
        const ey = y*CELL + CELL/2 + dy*4 - dx*3;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#1a1008';
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: COLS*CELL, marginBottom: 2 }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(150,90,30,0.5)', textTransform: 'uppercase' }}>Snake</span>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.8rem', fontWeight: 700, color: '#ea580c' }}>{score} pts</span>
      </div>

      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1.5px solid rgba(255,255,255,0.75)', boxShadow: '0 4px 24px rgba(180,100,20,0.12)', cursor: 'pointer' }} onClick={() => !started && start()}>
        <canvas ref={canvasRef} width={COLS*CELL} height={ROWS*CELL} style={{ display: 'block' }} />

        {/* Overlay */}
        {(!started || dead) && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,248,240,0.82)',
            backdropFilter: 'blur(6px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            {dead && <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.75rem', color: '#ea580c', fontWeight: 700, letterSpacing: '0.1em' }}>GAME OVER · {score} pts</p>}
            <button
              onClick={start}
              style={{
                padding: '10px 28px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(90deg,#c2410c,#ea580c,#f97316)',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                fontFamily: "'Sora',sans-serif", cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(234,88,12,0.3)',
              }}
            >
              {dead ? 'Play Again' : 'Start Game'}
            </button>
            <p style={{ fontSize: '0.72rem', color: 'rgba(150,90,30,0.5)', fontFamily: "'Sora',sans-serif" }}>Arrow keys or buttons below</p>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 4 }}>
        <button onClick={() => press('ArrowUp')} style={dpad}>▲</button>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => press('ArrowLeft')} style={dpad}>◀</button>
          <button onClick={() => press('ArrowDown')} style={dpad}>▼</button>
          <button onClick={() => press('ArrowRight')} style={dpad}>▶</button>
        </div>
      </div>
    </div>
  );
}

const dpad: React.CSSProperties = {
  width: 38, height: 38, borderRadius: 10,
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(8px)',
  border: '1.5px solid rgba(255,255,255,0.8)',
  color: 'rgba(180,90,20,0.7)', fontSize: '0.8rem',
  cursor: 'pointer', fontFamily: 'inherit',
  boxShadow: '0 2px 8px rgba(180,100,20,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

/* ══════════════════════════════════════════════════════
   NOT FOUND PAGE
══════════════════════════════════════════════════════ */
const NotFound = () => {
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdf6ee 0%, #faecd8 40%, #fdf0e0 70%, #fff5e6 100%)',
      fontFamily: "'Sora', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blob1   { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.08); } }
        @keyframes blob2   { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,25px) scale(1.06); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        .fu { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both; }
        .fu2 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .15s both; }
        .fu3 { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) .28s both; }
      `}</style>

      {/* Blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,146,60,0.18) 0%, transparent 70%)', animation: 'blob1 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-12%', left: '-6%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', animation: 'blob2 10s ease-in-out infinite', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>

        {/* Status message */}
        <div className="fu" style={{ textAlign: 'center' }}>
          {/* Signal icon */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, marginBottom: 20, height: 28 }}>
            {[0.3, 0.55, 0.8, 1].map((h, i) => (
              <div key={i} style={{
                width: 8, height: `${h * 100}%`, borderRadius: 3,
                background: i < 2 ? '#ea580c' : 'rgba(180,120,60,0.2)',
                animation: i < 2 ? `pulse ${1 + i*0.3}s ease-in-out infinite` : 'none',
              }} />
            ))}
          </div>

          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(180,90,20,0.55)', marginBottom: 10 }}>
            Connection Issue
          </p>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1c0f00', marginBottom: 10, lineHeight: 1.2 }}>
            Your connection<br />seems <span style={{ color: '#ea580c' }}>unstable.</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(100,60,20,0.55)', fontWeight: 300, maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>
            We're having trouble reaching this page. Check your Wi-Fi or try again in a moment{dots}
          </p>
        </div>

        {/* Glass card with game */}
        <div className="fu2" style={{
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(255,255,255,0.75)',
          borderRadius: 24, padding: '24px 24px 20px',
          boxShadow: '0 8px 48px rgba(180,100,20,0.1), 0 2px 8px rgba(180,100,20,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
          width: '100%',
        }}>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(150,90,30,0.5)', marginBottom: 16, fontWeight: 300 }}>
            While you wait — play a quick game 🐍
          </p>
          <SnakeGame />
        </div>

        {/* Actions */}
        <div className="fu3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '11px 24px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(90deg,#c2410c,#ea580c,#f97316,#ea580c,#c2410c)',
              backgroundSize: '300% auto',
              animation: 'shimmer 4s linear infinite',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: "'Sora',sans-serif",
              boxShadow: '0 4px 20px rgba(234,88,12,0.3)',
            }}
          >
            Try Again
          </button>
          <a
            href="/"
            style={{
              padding: '11px 24px', borderRadius: 12,
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.8)',
              color: 'rgba(150,80,20,0.8)', fontWeight: 600, fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: "'Sora',sans-serif",
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(180,100,20,0.08)',
            }}
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;