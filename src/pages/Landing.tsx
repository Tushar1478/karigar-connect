import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Users, Wrench, Zap, Droplets, Hammer, Home, CheckCircle, ArrowRight, Sun, Moon, Star } from "lucide-react";

/* ─── KARIGAR MOCK DATA ─────────────────────────────── */
const karigarData = {
  Electricians:  { name: "Ramesh Kumar", exp: "8 yrs",  rating: 4.9, jobs: 312, avatar: "RK", color: "#f97316" },
  Plumbers:      { name: "Suresh Verma", exp: "6 yrs",  rating: 4.8, jobs: 241, avatar: "SV", color: "#38bdf8" },
  Carpenters:    { name: "Anil Sharma",  exp: "10 yrs", rating: 4.7, jobs: 198, avatar: "AS", color: "#a78bfa" },
  "Home Repairs":{ name: "Vijay Singh",  exp: "5 yrs",  rating: 4.9, jobs: 289, avatar: "VS", color: "#34d399" },
};

const MAP_PINS = [
  { top: "22%", left: "28%", name: "Ramesh K.", delay: 0   },
  { top: "48%", left: "58%", name: "Suresh V.", delay: 0.4 },
  { top: "62%", left: "23%", name: "Anil S.",   delay: 0.8 },
  { top: "28%", left: "72%", name: "Priya M.",  delay: 1.2 },
  { top: "72%", left: "62%", name: "Vijay S.",  delay: 0.6 },
  { top: "18%", left: "50%", name: "Mohan L.",  delay: 1.0 },
];

/* ─── HOOKS ─────────────────────────────────────────── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

function useCountUp(target, duration = 1800, visible) {
  const [count, setCount] = useState(0);
  const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
  const suffix  = target.replace(/[0-9.]/g, "");
  useEffect(() => {
    if (!visible) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(eased * numeric);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible]);
  const display = target.includes(".") ? count.toFixed(1) : Math.floor(count).toLocaleString();
  return display + suffix;
}

/* ─── STAT ITEM ─────────────────────────────────────── */
function StatItem({ value, label, visible }) {
  const display = useCountUp(value, 1600, visible);
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{
        fontFamily: "'Space Mono',monospace",
        fontSize: "clamp(2rem,5vw,3rem)",
        fontWeight: 700,
        background: "linear-gradient(135deg,#fb923c,#fde68a)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        lineHeight: 1,
      }}>{display}</p>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: 8, fontWeight: 300 }}>{label}</p>
    </div>
  );
}

/* ─── REVEAL WRAPPER ────────────────────────────────── */
function Reveal({ children, delay = 0, dir = "up" }) {
  const [ref, visible] = useScrollReveal();
  const t = { up: "translateY(36px)", left: "translateX(-36px)", right: "translateX(36px)" };
  return (
    <div ref={ref} style={{
      transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translate(0)" : t[dir],
    }}>
      {children}
    </div>
  );
}

/* ─── HOW IT WORKS CARD ─────────────────────────────── */
function HowCard({ step, title, desc, delay, visible }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--glass)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${hov ? "rgba(251,146,60,0.45)" : "var(--glass-border)"}`,
        borderRadius: 20, padding: "32px 28px",
        textAlign: "left", cursor: "default",
        transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
        transitionDelay: visible ? `${delay}s` : "0s",
        transform: visible ? (hov ? "translateY(-6px)" : "translateY(0)") : "translateY(40px)",
        opacity: visible ? 1 : 0,
        boxShadow: hov ? "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(251,146,60,0.12)" : "none",
        position: "relative", overflow: "hidden", minHeight: 160,
      }}
    >
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.65rem", color: "#fb923c", letterSpacing: "0.12em", fontWeight: 700, display: "block", marginBottom: 12 }}>{step}</span>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--fg)", marginBottom: 0 }}>{title}</h3>

      {/* Slide-in desc */}
      <div style={{
        maxHeight: hov ? "120px" : "0px",
        opacity: hov ? 1 : 0,
        transform: hov ? "translateX(0)" : "translateX(-18px)",
        transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
        overflow: "hidden",
        marginTop: hov ? 12 : 0,
      }}>
        <p style={{ color: "var(--muted)", lineHeight: 1.75, fontSize: "0.875rem", fontWeight: 300 }}>{desc}</p>
      </div>

      <ArrowRight size={15} style={{
        position: "absolute", bottom: 20, right: 22,
        color: "#fb923c", opacity: hov ? 0 : 0.3,
        transition: "opacity 0.3s",
      }} />
    </div>
  );
}

/* ─── SERVICE CARD WITH KARIGAR POPUP ───────────────── */
function ServiceCard({ label, icon, delay, visible }) {
  const [hov, setHov] = useState(false);
  const k = karigarData[label];
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        background: "var(--glass)", backdropFilter: "blur(16px)",
        border: `1px solid ${hov ? "rgba(251,146,60,0.4)" : "var(--glass-border)"}`,
        borderRadius: 20, padding: "28px 20px", textAlign: "center", cursor: "default",
        transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
        transitionDelay: visible ? `${delay}s` : "0s",
        transform: visible ? (hov ? "translateY(-6px)" : "translateY(0)") : "translateY(40px)",
        opacity: visible ? 1 : 0,
        boxShadow: hov ? "0 16px 48px rgba(0,0,0,0.35)" : "none",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
        }}>{icon}</div>
        <p style={{ color: "var(--fg)", fontWeight: 600, fontSize: "1rem" }}>{label}</p>
      </div>

      {/* Karigar popup */}
      <div style={{
        position: "absolute", bottom: "calc(100% + 14px)", left: "50%",
        transform: hov ? "translateX(-50%) translateY(0) scale(1)" : "translateX(-50%) translateY(10px) scale(0.94)",
        opacity: hov ? 1 : 0,
        pointerEvents: "none",
        transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
        zIndex: 50, width: 224,
      }}>
        <div style={{
          background: "var(--popup-bg)", backdropFilter: "blur(24px)",
          border: "1px solid rgba(251,146,60,0.25)", borderRadius: 16, padding: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <span style={{
              background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.4)",
              color: "#34d399", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
              padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "blink 1.5s infinite" }} />
              AVAILABLE NOW
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `linear-gradient(135deg,${k.color}30,${k.color}60)`,
              border: `2px solid ${k.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: "0.7rem",
              color: k.color, flexShrink: 0,
            }}>{k.avatar}</div>
            <div>
              <p style={{ color: "var(--fg)", fontWeight: 700, fontSize: "0.9rem", marginBottom: 3 }}>{k.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={11} fill="#fb923c" color="#fb923c" />
                <span style={{ color: "#fb923c", fontSize: "0.75rem", fontWeight: 700 }}>{k.rating}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>· {k.jobs} jobs</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>Experience</span>
            <span style={{ color: "var(--fg)", fontSize: "0.75rem", fontWeight: 600 }}>{k.exp}</span>
          </div>
        </div>
        <div style={{
          width: 10, height: 10, background: "var(--popup-bg)",
          border: "1px solid rgba(251,146,60,0.25)", borderTop: "none", borderLeft: "none",
          transform: "rotate(45deg)", margin: "-5px auto 0",
        }} />
      </div>
    </div>
  );
}

/* ─── MAP PIN ───────────────────────────────────────── */
function MapPinItem({ top, left, name, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ position: "absolute", top, left, transform: "translate(-50%,-100%)" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {[40, 60].map((s, i) => (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: s, height: s, borderRadius: "50%",
          border: `${i === 0 ? 2 : 1.5}px solid rgba(251,146,60,${i === 0 ? 0.45 : 0.22})`,
          animation: `mapPulse 2.2s ease-out ${delay + i * 0.35}s infinite`,
          pointerEvents: "none",
        }} />
      ))}
      <div style={{
        width: 30, height: 30, borderRadius: "50% 50% 50% 0",
        background: "linear-gradient(135deg,#f97316,#fb923c)",
        transform: hov ? "rotate(-45deg) scale(1.25)" : "rotate(-45deg)",
        boxShadow: "0 4px 20px rgba(249,115,22,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "transform 0.2s ease",
      }}>
        <Wrench size={11} style={{ transform: "rotate(45deg)", color: "#fff" }} />
      </div>
      <div style={{
        position: "absolute", bottom: "calc(100% + 10px)", left: "50%",
        transform: hov ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(5px)",
        opacity: hov ? 1 : 0, transition: "all 0.22s ease",
        background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(251,146,60,0.3)", borderRadius: 8,
        padding: "3px 10px", whiteSpace: "nowrap",
        fontSize: "0.68rem", color: "#fff", fontWeight: 600,
        pointerEvents: "none",
      }}>{name}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(true);
  const [logoSpin, setLogoSpin] = useState(true);
  const [statsRef, statsVisible] = useScrollReveal(0.3);
  const [howRef,  howVisible]  = useScrollReveal(0.1);
  const [svcRef,  svcVisible]  = useScrollReveal(0.1);
  const [whyRef,  whyVisible]  = useScrollReveal(0.1);

  useEffect(() => { const t = setTimeout(() => setLogoSpin(false), 1000); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      "--bg":          dark ? "#0a0a0f"                  : "#f5f0eb",
      "--fg":          dark ? "#ffffff"                  : "#1a1208",
      "--muted":       dark ? "rgba(255,255,255,0.45)"   : "rgba(26,18,8,0.5)",
      "--glass":       dark ? "rgba(255,255,255,0.04)"   : "rgba(255,255,255,0.7)",
      "--glass-border":dark ? "rgba(255,255,255,0.08)"   : "rgba(0,0,0,0.09)",
      "--popup-bg":    dark ? "rgba(14,14,20,0.96)"      : "rgba(255,255,255,0.97)",
      "--header-bg":   dark ? "rgba(10,10,15,0.78)"      : "rgba(245,240,235,0.88)",
      "--sec-alt":     dark ? "rgba(255,255,255,0.015)"  : "rgba(0,0,0,0.025)",
      fontFamily: "'Sora',sans-serif",
      background: "var(--bg)",
      color: "var(--fg)",
      minHeight: "100vh",
      transition: "background 0.5s, color 0.5s",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp    { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glowPulse { 0%,100% { text-shadow:0 0 20px rgba(251,146,60,.5),0 0 60px rgba(251,146,60,.2); } 50% { text-shadow:0 0 40px rgba(251,146,60,.9),0 0 100px rgba(251,146,60,.4); } }
        @keyframes shimmer   { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes logoSpin  { 0% { transform:rotate(0) scale(0.4); opacity:0; } 65% { transform:rotate(385deg) scale(1.1); opacity:1; } 100% { transform:rotate(360deg) scale(1); opacity:1; } }
        @keyframes logoPulse { 0%,100% { filter:drop-shadow(0 0 6px rgba(251,146,60,.4)); } 50% { filter:drop-shadow(0 0 14px rgba(251,146,60,.8)); } }
        @keyframes mapPulse  { 0% { transform:translate(-50%,-50%) scale(1); opacity:.8; } 100% { transform:translate(-50%,-50%) scale(2.6); opacity:0; } }
        @keyframes particleDrift { 0% { transform:translateY(0) translateX(0); opacity:0; } 10% { opacity:1; } 90% { opacity:.5; } 100% { transform:translateY(-110px) translateX(25px); opacity:0; } }
        @keyframes blink     { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        @keyframes pulse     { 0%,100% { opacity:1; } 50% { opacity:.4; } }

        .fu1 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) .1s  both; }
        .fu2 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) .25s both; }
        .fu3 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) .4s  both; }
        .fu4 { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) .55s both; }

        .glow-text  { animation: glowPulse 3s ease-in-out infinite; color:#fb923c; }
        .logo-spin  { animation: logoSpin  1s cubic-bezier(.22,1,.36,1) forwards; }
        .logo-idle  { animation: logoPulse 3s ease-in-out infinite; }

        .shimmer-btn {
          background: linear-gradient(90deg,#f97316,#fb923c,#fdba74,#fb923c,#f97316);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          color: #0a0a0f !important; font-weight: 700; border: none; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          border-radius: 12px; padding: 14px 28px;
          font-size: 1rem; font-family: 'Sora',sans-serif;
          transition: transform .2s ease, box-shadow .2s ease;
          letter-spacing: .01em;
        }
        .shimmer-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 36px rgba(249,115,22,.5); }
        .shimmer-btn-sm { padding: 9px 18px !important; font-size: .875rem !important; }

        .outline-btn {
          border: 1.5px solid rgba(255,255,255,.2);
          background: rgba(255,255,255,.05); backdrop-filter: blur(8px);
          font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          border-radius: 12px; padding: 14px 28px;
          font-size: 1rem; font-family: 'Sora',sans-serif;
          transition: all .2s ease;
          color: var(--fg, #fff);
        }
        .outline-btn:hover { border-color: rgba(251,146,60,.6); background: rgba(251,146,60,.1); color:#fb923c; transform:translateY(-3px); }
        .outline-btn-sm  { padding: 9px 18px !important; font-size: .875rem !important; }

        .divider { height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent); }

        .map-grid {
          background-image:
            linear-gradient(rgba(251,146,60,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251,146,60,.04) 1px, transparent 1px);
          background-size: 42px 42px;
        }

        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(251,146,60,.3); border-radius:999px; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position:"sticky", top:0, zIndex:100,
        background:"var(--header-bg)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid var(--glass-border)", transition:"background .5s",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div className={logoSpin ? "logo-spin" : "logo-idle"} style={{ width:36, height:36 }}>
              <img src="/icon.png" alt="KarigarHub" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
            </div>
            <span style={{ fontWeight:800, fontSize:"1.2rem", letterSpacing:"-0.01em" }}>
              Karigar<span style={{ color:"#fb923c" }}>Hub</span>
            </span>
          </div>

          {/* Controls */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>

            {/* Toggle */}
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Sun  size={13} style={{ color: dark ? "var(--muted)" : "#fb923c", transition:"color .3s" }} />
              <div onClick={() => setDark(!dark)} style={{
                width:50, height:26, borderRadius:999, cursor:"pointer", position:"relative",
                background:"rgba(255,255,255,.08)", border:"1.5px solid rgba(251,146,60,.35)",
                display:"flex", alignItems:"center",
              }}>
                <div style={{
                  width:18, height:18, borderRadius:"50%",
                  background:"linear-gradient(135deg,#f97316,#fbbf24)",
                  position:"absolute", top:3,
                  left: dark ? "25px" : "3px",
                  transition:"left .35s cubic-bezier(.34,1.56,.64,1)",
                  boxShadow:"0 2px 8px rgba(249,115,22,.5)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  {dark ? <Moon size={9} color="#fff" /> : <Sun size={9} color="#fff" />}
                </div>
              </div>
              <Moon size={13} style={{ color: dark ? "#fb923c" : "var(--muted)", transition:"color .3s" }} />
            </div>

            <button className="outline-btn outline-btn-sm" onClick={() => navigate("/login/customer")}>Sign In</button>
            <button className="shimmer-btn shimmer-btn-sm" onClick={() => navigate("/signup/customer")}>Get Started</button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position:"relative", minHeight:"92vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:"80px 16px" }}>
        <video autoPlay loop muted playsInline style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity: dark ? 0.5 : 0.12, transition:"opacity .5s" }}>
          <source src="/karigar-video.mp4" type="video/mp4" />
        </video>

        <div style={{
          position:"absolute", inset:0,
          background: dark
            ? "linear-gradient(to bottom,rgba(10,10,15,.2) 0%,rgba(10,10,15,.05) 40%,rgba(10,10,15,.6) 82%,rgba(10,10,15,1) 100%)"
            : "linear-gradient(to bottom,rgba(245,240,235,.3) 0%,rgba(245,240,235,.1) 40%,rgba(245,240,235,.65) 82%,rgba(245,240,235,1) 100%)",
          transition:"background .5s",
        }} />

        {/* Floating sparks */}
        {[...Array(14)].map((_,i) => (
          <div key={i} style={{
            position:"absolute",
            bottom: `${8 + (i*7)%40}%`,
            left: `${4 + i*6.5}%`,
            width: 2 + (i%3),
            height: 2 + (i%3),
            borderRadius:"50%",
            background:"#fb923c",
            boxShadow:"0 0 6px rgba(251,146,60,.9)",
            opacity:0,
            animation:`particleDrift ${4 + (i%4)}s ease-in-out ${i * 0.45}s infinite`,
          }} />
        ))}

        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(251,146,60,.04) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        <div style={{ position:"relative", zIndex:2, textAlign:"center", maxWidth:820 }}>
          <span className="fu1" style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.64rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"#fb923c", display:"block", marginBottom:20 }}>
            Trusted Home Services Platform
          </span>

          <h1 className="fu2" style={{ fontSize:"clamp(2.5rem,7vw,5rem)", fontWeight:800, lineHeight:1.08, letterSpacing:"-0.03em", marginBottom:24 }}>
            Find Trusted <span className="glow-text">Karigars</span><br />Near You
          </h1>

          <p className="fu3" style={{ fontSize:"1.1rem", color:"var(--muted)", maxWidth:500, margin:"0 auto 40px", lineHeight:1.75, fontWeight:300 }}>
            Connecting households with skilled electricians, plumbers, carpenters and home repair experts. Reliable service at your doorstep, fast.
          </p>

          <div className="fu4" style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:16, marginBottom:28 }}>
            <button className="shimmer-btn" onClick={() => navigate("/login/customer")}><Users size={20}/>Login as Customer<ArrowRight size={16}/></button>
            <button className="outline-btn"  onClick={() => navigate("/login/karigar")}><Wrench size={20}/>Login as Karigar</button>
          </div>

          <p className="fu4" style={{ fontSize:"0.85rem", color:"var(--muted)" }}>
            New here?{" "}
            <button onClick={() => navigate("/signup/customer")} style={{ color:"#fb923c", fontWeight:600, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"inherit" }}>Sign up as Customer</button>
            <span style={{ margin:"0 8px", opacity:.3 }}>·</span>
            <button onClick={() => navigate("/signup/karigar")} style={{ color:"#fb923c", fontWeight:600, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"inherit" }}>Join as Karigar</button>
          </p>
        </div>

        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:120, background:"linear-gradient(to bottom,transparent,var(--bg))", transition:"background .5s" }} />
      </section>

      {/* ── STATS ── */}
      <section style={{ background:"var(--bg)", padding:"60px 16px", transition:"background .5s" }}>
        <div className="divider" style={{ marginBottom:56 }} />
        <div ref={statsRef} style={{ maxWidth:760, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:32 }}>
          <StatItem value="500+"   label="Verified Karigars" visible={statsVisible} />
          <StatItem value="10000+" label="Jobs Completed"    visible={statsVisible} />
          <StatItem value="4.8★"   label="Customer Rating"   visible={statsVisible} />
        </div>
        <div className="divider" style={{ marginTop:56 }} />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background:"var(--bg)", padding:"80px 16px", transition:"background .5s" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", textAlign:"center" }}>
          <Reveal>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.64rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"#fb923c", display:"block", marginBottom:14 }}>Process</span>
            <h2 style={{ fontSize:"clamp(1.75rem,4vw,2.5rem)", fontWeight:700, letterSpacing:"-0.02em", marginBottom:12 }}>How KarigarHub Works</h2>
            <p style={{ color:"var(--muted)", marginBottom:48, fontWeight:300 }}>Hover each step to reveal details</p>
          </Reveal>
          <div ref={howRef} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
            {[
              { step:"01", title:"Post Your Job",    desc:"Tell us what you need — electrical work, plumbing, carpentry, or any installation and repair." },
              { step:"02", title:"Karigars Accept",  desc:"Nearby skilled workers receive your request instantly and accept the job quickly." },
              { step:"03", title:"Work Gets Done",   desc:"The karigar arrives at your doorstep and completes the work professionally and efficiently." },
            ].map((c,i) => <HowCard key={c.step} {...c} delay={i*.15} visible={howVisible} />)}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ background:"var(--sec-alt)", padding:"80px 16px", transition:"background .5s" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", textAlign:"center" }}>
          <Reveal>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.64rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"#fb923c", display:"block", marginBottom:14 }}>What We Offer</span>
            <h2 style={{ fontSize:"clamp(1.75rem,4vw,2.5rem)", fontWeight:700, letterSpacing:"-0.02em", marginBottom:12 }}>Services Available</h2>
            <p style={{ color:"var(--muted)", marginBottom:52, fontWeight:300 }}>Hover a service to meet your karigar</p>
          </Reveal>
          <div ref={svcRef} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:20 }}>
            {[
              { label:"Electricians",  icon:<Zap     size={22} color="#fb923c"/> },
              { label:"Plumbers",      icon:<Droplets size={22} color="#fb923c"/> },
              { label:"Carpenters",    icon:<Hammer  size={22} color="#fb923c"/> },
              { label:"Home Repairs",  icon:<Home    size={22} color="#fb923c"/> },
            ].map((s,i) => <ServiceCard key={s.label} {...s} delay={i*.12} visible={svcVisible} />)}
          </div>
        </div>
      </section>

      {/* ── MAP ── */}
      <section style={{ background:"var(--bg)", padding:"80px 16px", transition:"background .5s" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:48 }}>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.64rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"#fb923c", display:"block", marginBottom:14 }}>Live Map</span>
              <h2 style={{ fontSize:"clamp(1.75rem,4vw,2.5rem)", fontWeight:700, letterSpacing:"-0.02em", marginBottom:12 }}>Karigars Near You</h2>
              <p style={{ color:"var(--muted)", fontWeight:300 }}>Hover the pins to see who's available in your area</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{
              position:"relative", height:420, borderRadius:24, overflow:"hidden",
              border:"1px solid var(--glass-border)",
              background: dark ? "#0d1117" : "#e8e3dc",
              transition:"background .5s",
            }}>
              <div className="map-grid" style={{ position:"absolute", inset:0 }} />

              {/* Glow */}
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(251,146,60,.07) 0%,transparent 70%)", pointerEvents:"none" }} />

              {/* Roads */}
              <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.22 }}>
                <line x1="0" y1="40%" x2="100%" y2="46%" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="9,7"/>
                <line x1="0" y1="65%" x2="100%" y2="59%" stroke="#fb923c" strokeWidth="1"   strokeDasharray="7,9"/>
                <line x1="34%" y1="0" x2="37%" y2="100%" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="9,7"/>
                <line x1="66%" y1="0" x2="63%" y2="100%" stroke="#fb923c" strokeWidth="1"   strokeDasharray="7,9"/>
              </svg>

              {/* You */}
              <div style={{ position:"absolute", top:"49%", left:"50%", transform:"translate(-50%,-50%)" }}>
                <div style={{ width:14, height:14, borderRadius:"50%", background:"#38bdf8", boxShadow:"0 0 0 4px rgba(56,189,248,.2),0 0 20px rgba(56,189,248,.45)", animation:"pulse 2s infinite" }} />
                <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)", background:"rgba(56,189,248,.14)", border:"1px solid rgba(56,189,248,.4)", color:"#38bdf8", fontSize:"0.58rem", fontWeight:700, padding:"2px 8px", borderRadius:999, whiteSpace:"nowrap", letterSpacing:"0.06em" }}>YOU ARE HERE</div>
              </div>

              {MAP_PINS.map((p,i) => <MapPinItem key={i} {...p} />)}

              {/* Legend */}
              <div style={{ position:"absolute", bottom:16, right:16, background: dark ? "rgba(10,10,15,.88)" : "rgba(245,240,235,.92)", backdropFilter:"blur(12px)", border:"1px solid var(--glass-border)", borderRadius:12, padding:"10px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                {[{ c:"#fb923c", l:"Available Karigar" },{ c:"#38bdf8", l:"Your Location" }].map(({ c, l }) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:9, height:9, borderRadius:"50%", background:c, boxShadow:`0 0 8px ${c}88` }} />
                    <span style={{ color:"var(--muted)", fontSize:"0.7rem" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section style={{ background:"var(--sec-alt)", padding:"80px 16px", transition:"background .5s" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", textAlign:"center" }}>
          <Reveal>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:"0.64rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"#fb923c", display:"block", marginBottom:14 }}>Why KarigarHub</span>
            <h2 style={{ fontSize:"clamp(1.75rem,4vw,2.5rem)", fontWeight:700, letterSpacing:"-0.02em", marginBottom:48 }}>Built on Trust & Reliability</h2>
          </Reveal>
          <div ref={whyRef} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
            {[
              { title:"Verified Professionals", desc:"Every karigar is background-checked and skill-verified before joining the platform." },
              { title:"Fast Response",           desc:"Get a skilled karigar at your door within minutes of posting your job." },
              { title:"Transparent Pricing",     desc:"No hidden charges. Know the full cost upfront before any work begins." },
            ].map((item,i) => (
              <div key={item.title} style={{
                background:"var(--glass)", backdropFilter:"blur(16px)",
                border:"1px solid var(--glass-border)", borderRadius:20, padding:28, textAlign:"left",
                transition:`all .4s cubic-bezier(.22,1,.36,1) ${i*.12}s`,
                transform: whyVisible ? "translateY(0)" : "translateY(40px)",
                opacity: whyVisible ? 1 : 0,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <CheckCircle size={17} color="#fb923c" />
                  <h3 style={{ fontWeight:700, fontSize:"1rem" }}>{item.title}</h3>
                </div>
                <p style={{ color:"var(--muted)", fontSize:"0.875rem", lineHeight:1.75, fontWeight:300 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding:"80px 16px", background:"var(--bg)", transition:"background .5s" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <Reveal>
            <div style={{
              background:"linear-gradient(135deg,rgba(251,146,60,.12),rgba(251,146,60,.04))",
              border:"1px solid rgba(251,146,60,.25)",
              borderRadius:28, padding:"56px 40px", textAlign:"center",
              backdropFilter:"blur(16px)",
            }}>
              <h2 style={{ fontSize:"clamp(1.5rem,4vw,2rem)", fontWeight:800, marginBottom:12, letterSpacing:"-0.02em" }}>Ready to get started?</h2>
              <p style={{ color:"var(--muted)", marginBottom:32, fontWeight:300 }}>Join thousands of happy customers who trust KarigarHub.</p>
              <button className="shimmer-btn" style={{ margin:"0 auto" }} onClick={() => navigate("/signup/customer")}>
                <Users size={20}/>Sign Up for Free<ArrowRight size={16}/>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid var(--glass-border)", padding:"28px 16px", textAlign:"center", color:"var(--muted)", fontSize:"0.8rem", background:"var(--bg)", fontWeight:300, transition:"background .5s" }}>
        © {new Date().getFullYear()}{" "}
        <span style={{ fontWeight:600 }}>KarigarHub</span>
        {" "}— Connecting skilled hands with homes.
      </footer>

    </div>
  );
}
