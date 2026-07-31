import { useNavigate } from "react-router-dom";import { useState } from "react";import {Home, Compass, ClipboardList, MessageSquare, Bookmark, UserPlus, HelpCircle,MapPin, ChevronDown, Bell, Search, ArrowRight, Star, BadgeCheck, ShieldCheck,CreditCard, Hammer, Scissors, Zap, Droplets, Paintbrush, Amphora, Anvil, MoreHorizontal,} from "lucide-react";

import heroArtisan from "@/assets/hero-artisan.jpg";import artisan1 from "@/assets/artisan-1.jpg";import artisan2 from "@/assets/artisan-2.jpg";import artisan3 from "@/assets/artisan-3.jpg";import artisan4 from "@/assets/artisan-4.jpg";

/* ── palette ───────────────────────────────── */const C = {cream:  "#FFFAF6",card:   "#FFFFFF",ink:    "#2D1F0E",sub:    "#6B5744",line:   "#E8E0D8",orange: "#F4722B",teal:   "#0F6E56",panel:  "#F7F1EA",};

const NAV = [{ icon: Home,          label: "Home" },{ icon: Compass,       label: "Discover" },{ icon: ClipboardList, label: "Requests" },{ icon: MessageSquare, label: "Messages" },{ icon: Bookmark,      label: "Bookmarks" },];

const SERVICES = [{ icon: Hammer,     label: "Carpenter" },{ icon: Scissors,   label: "Tailor" },{ icon: Zap,        label: "Electrician" },{ icon: Droplets,   label: "Plumber" },{ icon: Paintbrush, label: "Painter" },{ icon: Amphora,    label: "Potter" },{ icon: Anvil,      label: "Blacksmith" },{ icon: MoreHorizontal, label: "More" },];

const ARTISANS = [{ img: artisan1, name: "Ramesh Suthar", trade: "Carpenter",   exp: "15+ years", rating: 4.8, reviews: 120, km: "2.1", tag: "Woodwork Specialist" },{ img: artisan2, name: "Shabana Bano",  trade: "Tailor",      exp: "12+ years", rating: 4.9, reviews: 98,  km: "1.4", tag: "Stitching Expert" },{ img: artisan3, name: "Irfan Khan",    trade: "Electrician", exp: "10+ years", rating: 4.7, reviews: 76,  km: "3.2", tag: "Home Wiring Expert" },{ img: artisan4, name: "Pooja Prajapat",trade: "Potter",      exp: "8+ years",  rating: 4.6, reviews: 64,  km: "4.5", tag: "Pottery Artisan" },];

const TRUST = [{ icon: ShieldCheck,   title: "Verified & trusted", body: "Every artisan is verified for your safety." },{ icon: MapPin,        title: "Local & nearby",     body: "Find skilled people right in your area." },{ icon: CreditCard,    title: "Secure payments",    body: "Safe, secure & hassle free transactions." },{ icon: MessageSquare, title: "Always here",        body: "Our support team is always with you." },];

export default function Landing() {const navigate = useNavigate();const [active, setActive] = useState("Home");

return (<div style={{ minHeight: "100vh", background: C.cream, color: C.ink, fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex" }}><style>{        .kh-side { display:none; }
        @media (min-width: 1024px){ .kh-side { display:flex !important; } }
        .kh-navitem { display:flex; align-items:center; gap:14px; padding:12px 22px; border:none; background:none;
          font-size:.9rem; font-weight:500; color:${C.sub}; cursor:pointer; width:100%; text-align:left;
          border-left:3px solid transparent; transition:all .18s; font-family:inherit; }
        .kh-navitem:hover { background:${C.panel}; color:${C.ink}; }
        .kh-navitem.on { background:${C.panel}; color:${C.ink}; font-weight:700; border-left-color:${C.orange}; }
        .kh-svc { display:flex; flex-direction:column; align-items:center; gap:10px; padding:14px 6px; width:88px;
          border:1px solid ${C.line}; border-radius:14px; background:${C.card}; cursor:pointer; transition:all .2s; }
        .kh-svc:hover { transform:translateY(-3px); border-color:${C.orange}; box-shadow:0 10px 24px -14px rgba(45,31,14,.4); }
        .kh-artisan { display:flex; background:${C.card}; border:1px solid ${C.line}; border-radius:16px;
          overflow:hidden; transition:all .2s; }
        .kh-artisan:hover { transform:translateY(-4px); box-shadow:0 16px 34px -20px rgba(45,31,14,.55); }
        .kh-btn { display:inline-flex; align-items:center; gap:8px; border:none; cursor:pointer;
          font-family:inherit; font-weight:700; transition:all .2s; }
        .kh-btn:hover { filter:brightness(1.06); transform:translateY(-1px); }
     }</style>

  {/* ── SIDEBAR ── */}
  <aside className="kh-side" style={{
    width: 230, flexShrink: 0, flexDirection: "column",
    background: C.cream, borderRight: `1px solid ${C.line}`,
    position: "sticky", top: 0, height: "100vh",
  }}>
    <div style={{ padding: "26px 22px 22px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
      <img src="/icon.png" alt="KarigarHub" width={44} height={44} style={{ objectFit: "contain" }} />
      <p style={{ fontWeight: 800, letterSpacing: ".14em", fontSize: ".95rem", lineHeight: 1.25 }}>
        KARIGAR<br />HUB
      </p>
    </div>

    <nav style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
      {NAV.map(({ icon: Icon, label }) => (
        <button key={label} className={`kh-navitem ${active === label ? "on" : ""}`} onClick={() => setActive(label)}>
          <Icon size={18} /> {label}
        </button>
      ))}
    </nav>

    <div style={{ height: 1, background: C.line, margin: "18px 22px" }} />

    <nav style={{ display: "flex", flexDirection: "column" }}>
      <button className="kh-navitem" onClick={() => navigate("/signup")}>
        <UserPlus size={17} /> Become an Artisan
      </button>
      <button className="kh-navitem" onClick={() => setActive("How It Works")}>
        <HelpCircle size={17} /> How It Works
      </button>
    </nav>

    <div style={{ marginTop: "auto", padding: "0 22px 26px" }}>
      <p style={{ fontFamily: "'Lora',serif", fontStyle: "italic", color: C.orange, fontSize: "1.15rem", lineHeight: 1.5 }}>
        Hunar hai.<br />Samman hai.
      </p>
    </div>
  </aside>

  {/* ── MAIN ── */}
  <main style={{ flex: 1, minWidth: 0 }}>
    {/* top bar */}
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      padding: "16px 26px", borderBottom: `1px solid ${C.line}`, background: C.cream,
      position: "sticky", top: 0, zIndex: 40,
    }}>
      <button className="kh-btn" style={{
        background: C.card, border: `1px solid ${C.line}`, borderRadius: 999,
        padding: "9px 16px", color: C.ink, fontSize: ".85rem", fontWeight: 600,
      }}>
        <MapPin size={15} color={C.sub} /> Jodhpur, Rajasthan <ChevronDown size={15} color={C.sub} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative" }}>
          <Bell size={19} color={C.sub} />
          <span style={{
            position: "absolute", top: -6, right: -7, background: C.orange, color: "#fff",
            fontSize: ".6rem", fontWeight: 700, borderRadius: 999, padding: "1px 5px",
          }}>3</span>
        </div>
        <MessageSquare size={19} color={C.sub} />
        <div style={{ width: 1, height: 22, background: C.line }} />
        <button className="kh-btn" onClick={() => navigate("/login")} style={{
          background: "transparent", color: C.ink, fontSize: ".85rem", padding: "8px 12px", borderRadius: 10,
        }}>Log in</button>
        <button className="kh-btn" onClick={() => navigate("/signup")} style={{
          background: C.orange, color: "#fff", fontSize: ".85rem", padding: "9px 18px", borderRadius: 999,
        }}>Sign up</button>
      </div>
    </div>

    {/* ── HERO ── */}
    <section style={{ position: "relative", overflow: "hidden", background: C.cream }}>
      <img
        src={heroArtisan} alt="Indian carpenter shaping wood in his workshop"
        width={1200} height={900}
        style={{
          position: "absolute", right: 0, top: 0, height: "100%", width: "52%",
          objectFit: "cover", opacity: 0.95,
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,.55) 22%, #000 55%)",
          maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,.55) 22%, #000 55%)",
        }}
      />
      <div style={{ position: "relative", padding: "58px 26px 40px", maxWidth: 1320 }}>
        <h1 style={{
          fontFamily: "'Lora',serif", fontWeight: 600,
          fontSize: "clamp(2.2rem,5.2vw,3.9rem)", lineHeight: 1.08, letterSpacing: "-.02em",
        }}>
          Real hands.<br />
          Real skills.{" "}
          <span style={{ color: C.orange, borderBottom: `4px solid ${C.teal}`, paddingBottom: 4 }}>
            Real people.
          </span>
        </h1>

        <p style={{ color: C.sub, marginTop: 22, fontSize: "1rem", lineHeight: 1.6, maxWidth: 390 }}>
          KarigarHub connects you with trusted artisans and skilled workers in your area.
        </p>

        {/* search card */}
        <div style={{
          marginTop: 26, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          background: C.card, border: `1px solid ${C.line}`, borderRadius: 16,
          padding: 10, maxWidth: 620, boxShadow: "0 18px 40px -28px rgba(45,31,14,.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 190, padding: "0 8px" }}>
            <Search size={18} color={C.sub} />
            <input
              placeholder="What service do you need?"
              style={{ border: "none", outline: "none", background: "transparent", color: C.ink, fontSize: ".92rem", width: "100%", fontFamily: "inherit" }}
            />
          </div>
          <button className="kh-btn" style={{
            background: C.panel, color: C.ink, borderRadius: 12, padding: "10px 14px", fontSize: ".85rem", fontWeight: 600,
          }}>
            <MapPin size={15} color={C.sub} /> Near me <ChevronDown size={14} color={C.sub} />
          </button>
          <button className="kh-btn" onClick={() => navigate("/login")} aria-label="Search"
            style={{ background: C.teal, color: "#fff", borderRadius: 12, padding: "11px 18px" }}>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* popular services */}
        <p style={{ marginTop: 32, marginBottom: 14, fontSize: ".9rem", fontWeight: 700 }}>Popular services</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {SERVICES.map(({ icon: Icon, label }) => (
            <button key={label} className="kh-svc" onClick={() => navigate("/login")}>
              <Icon size={22} color={C.ink} strokeWidth={1.5} />
              <span style={{ fontSize: ".72rem", color: C.sub, fontWeight: 600 }}>{label}</span>
            </button>
          ))}
        </div>

        {/* story card */}
        <div style={{
          position: "absolute", right: 34, top: 110, width: 290, display: "none",
          background: "rgba(255,250,246,.96)", border: `1px solid ${C.line}`, borderRadius: 18,
          padding: "26px 24px", boxShadow: "0 24px 60px -30px rgba(45,31,14,.6)",
        }} className="kh-story">
          <p style={{ fontFamily: "'Lora',serif", fontSize: "1.5rem", lineHeight: 1.25 }}>
            Every craft<br />has a story.
          </p>
          <div style={{ width: 34, height: 2, background: C.orange, margin: "16px 0" }} />
          <p style={{ color: C.sub, fontSize: ".85rem", lineHeight: 1.6 }}>
            Support local.<br />Build a stronger community.
          </p>
          <button className="kh-btn" onClick={() => navigate("/signup")} style={{
            marginTop: 18, background: "#7A3B1D", color: "#fff", borderRadius: 10,
            padding: "11px 16px", fontSize: ".82rem", width: "100%", justifyContent: "space-between",
          }}>
            Explore Stories <ArrowRight size={15} />
          </button>
        </div>
      </div>
      <style>{`@media (min-width:1180px){ .kh-story{ display:block !important; } }`}</style>
    </section>

    {/* ── FEATURED ARTISANS ── */}
    <section style={{ padding: "38px 26px 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Lora',serif", fontSize: "1.6rem", fontWeight: 600 }}>Featured artisans near you</h2>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: C.sub, fontSize: ".82rem" }}>
          <MapPin size={14} /> Based on your location
        </span>
        <button className="kh-btn" onClick={() => navigate("/login")} style={{
          marginLeft: "auto", background: "transparent", color: C.ink, fontSize: ".82rem",
        }}>
          View all artisans <ArrowRight size={15} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))", gap: 18 }}>
        {ARTISANS.map((a) => (
          <article key={a.name} className="kh-artisan">
            <div style={{ position: "relative", width: 128, flexShrink: 0 }}>
              <img src={a.img} alt={`${a.name}, ${a.trade}`} loading="lazy" width={512} height={640}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <BadgeCheck size={20} color="#fff" fill={C.teal}
                style={{ position: "absolute", top: 8, right: 8 }} />
            </div>
            <div style={{ padding: "14px 14px 12px", flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: "1rem" }}>{a.name}</p>
              <p style={{ color: C.sub, fontSize: ".78rem", marginTop: 3 }}>{a.trade} · {a.exp}</p>
              <p style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: ".8rem", fontWeight: 600 }}>
                <Star size={14} color={C.orange} fill={C.orange} /> {a.rating}
                <span style={{ color: C.sub, fontWeight: 400 }}>({a.reviews})</span>
              </p>
              <p style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, color: C.sub, fontSize: ".76rem" }}>
                <MapPin size={13} /> {a.km} km away
              </p>
              <span style={{
                display: "inline-block", marginTop: 10, background: "rgba(244,114,43,.1)",
                color: "#A8481A", border: "1px solid rgba(244,114,43,.25)",
                borderRadius: 999, padding: "4px 10px", fontSize: ".68rem", fontWeight: 600,
              }}>{a.tag}</span>
            </div>
          </article>
        ))}
      </div>
    </section>

    {/* ── TRUST BAR ── */}
    <section style={{ padding: "28px 26px 50px" }}>
      <div style={{
        background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18,
        padding: "24px 22px", display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 22,
      }}>
        {TRUST.map(({ icon: Icon, title, body }) => (
          <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: C.card, border: `1px solid ${C.line}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={19} color={C.teal} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: ".9rem" }}>{title}</p>
              <p style={{ color: C.sub, fontSize: ".8rem", marginTop: 4, lineHeight: 1.5 }}>{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ── KARIGAR CTA ── */}
    <section style={{ background: C.ink, padding: "40px 26px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ color: "#FFFAF6", fontFamily: "'Lora',serif", fontSize: "1.7rem", fontWeight: 600 }}>
            Are you a karigar?
          </h3>
          <p style={{ color: "rgba(255,250,246,.72)", marginTop: 8, fontSize: ".92rem" }}>
            Join KarigarHub and get discovered by customers near you.
          </p>
        </div>
        <button className="kh-btn" onClick={() => navigate("/signup")} style={{
          background: C.orange, color: "#fff", borderRadius: 999, padding: "14px 26px", fontSize: ".92rem",
        }}>
          Join as a Karigar <ArrowRight size={17} />
        </button>
      </div>
    </section>
  </main>
</div>

);}
