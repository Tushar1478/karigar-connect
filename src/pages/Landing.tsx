import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Wrench, Zap, Droplets, Hammer, PaintRoller, Fan, Sparkles, Refrigerator,
  Search, Star, ShieldCheck, Clock, BadgeIndianRupee, ArrowRight, CheckCircle2, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import heroImg from "@/assets/hero-karigar.jpg";

const CATEGORIES = [
  { label: "Electrician", icon: Zap, note: "From ₹199" },
  { label: "Plumber", icon: Droplets, note: "From ₹249" },
  { label: "Carpenter", icon: Hammer, note: "From ₹299" },
  { label: "Painter", icon: PaintRoller, note: "From ₹499" },
  { label: "AC Repair", icon: Fan, note: "From ₹399" },
  { label: "Cleaning", icon: Sparkles, note: "From ₹349" },
  { label: "Appliance", icon: Refrigerator, note: "From ₹299" },
  { label: "Home Repair", icon: Wrench, note: "From ₹199" },
];

const STEPS = [
  { title: "Tell us what you need", body: "Pick a service and share your address and preferred time slot.", icon: Search },
  { title: "Get matched instantly", body: "We show verified karigars near you with ratings and upfront prices.", icon: MapPin },
  { title: "Relax, it's done", body: "Track your karigar live, pay after the job and rate the experience.", icon: CheckCircle2 },
];

const WHY = [
  { title: "Verified professionals", body: "Every karigar is ID-checked, skill-tested and background verified.", icon: ShieldCheck },
  { title: "Upfront pricing", body: "See the price before you book. No surprises, no haggling.", icon: BadgeIndianRupee },
  { title: "On-time arrival", body: "Live tracking and 60-minute arrival windows across your city.", icon: Clock },
  { title: "Rated by neighbours", body: "Real reviews from customers in your locality, not stock ratings.", icon: Star },
];

const KARIGARS = [
  { name: "Ramesh Kumar", trade: "Electrician", exp: "8 yrs", rating: 4.9, jobs: 312, initials: "RK" },
  { name: "Suresh Verma", trade: "Plumber", exp: "6 yrs", rating: 4.8, jobs: 241, initials: "SV" },
  { name: "Anil Sharma", trade: "Carpenter", exp: "10 yrs", rating: 4.7, jobs: 198, initials: "AS" },
  { name: "Priya Mehta", trade: "Deep Cleaning", exp: "5 yrs", rating: 4.9, jobs: 289, initials: "PM" },
];

const STATS = [
  { value: "2,400+", label: "Jobs completed" },
  { value: "850+", label: "Verified karigars" },
  { value: "4.8", label: "Average rating" },
  { value: "18", label: "Cities served" },
];

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const SectionHead = ({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) => (
  <div className="mb-8 max-w-2xl">
    <p className="uc-eyebrow">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{title}</h2>
    {subtitle && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="gradient-hero border-b border-border">
        <div className="uc-container grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="uc-chip bg-card">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Verified karigars near you
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
              Home services,
              <br />
              <span className="text-gradient-primary">delivered by experts</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Book trusted electricians, plumbers, carpenters and cleaners in minutes. Upfront pricing, on-time arrival and a service guarantee.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-xl font-semibold" onClick={() => navigate("/login/customer")}>
                Book a service <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl font-semibold" onClick={() => navigate("/login/karigar")}>
                I'm a karigar
              </Button>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">
              New here?{" "}
              <button onClick={() => navigate("/signup/customer")} className="font-semibold text-primary hover:underline">
                Sign up as customer
              </button>{" "}
              ·{" "}
              <button onClick={() => navigate("/signup/karigar")} className="font-semibold text-primary hover:underline">
                Join as karigar
              </button>
            </p>
          </div>

          {/* Image + Search card */}
          <div className="relative">
          <img src={heroImg} alt="Verified karigar fixing a switchboard" width={1280} height={896}
            className="hidden aspect-[4/3] w-full rounded-3xl object-cover shadow-xl lg:block" />
          <div className="uc-card p-6 shadow-lg sm:p-7 lg:absolute lg:-bottom-10 lg:-left-10 lg:w-[88%]">
            <p className="text-sm font-bold text-foreground">What do you need help with?</p>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && navigate("/login/customer")}
                placeholder="Try 'fan not working' or 'leaking tap'"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Fan repair", "Tap leakage", "AC service", "Switchboard"].map(s => (
                <button key={s} onClick={() => setQuery(s)} className="uc-chip hover:border-primary/40 hover:text-primary">{s}</button>
              ))}
            </div>


            <div className="mt-5 grid grid-cols-4 gap-3">
              {CATEGORIES.slice(0, 8).map(c => (
                <button
                  key={c.label}
                  onClick={() => navigate("/login/customer")}
                  className="group flex flex-col items-center gap-2 rounded-xl p-2 text-center transition-colors hover:bg-secondary"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary transition-transform group-hover:-translate-y-0.5">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] font-semibold leading-tight text-muted-foreground">{c.label}</span>
                </button>
              ))}
            </div>

            <Button className="mt-5 w-full rounded-xl font-semibold" onClick={() => navigate("/login/customer")}>
              Find karigars near me
            </Button>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-b border-border bg-card">
        <div className="uc-container grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold text-primary sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="uc-container py-14">
        <SectionHead eyebrow="Services" title="Everything your home needs" subtitle="Pick a category and get matched with a rated professional in your area." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.label} delay={i * 50}>
              <button
                onClick={() => navigate("/login/customer")}
                className="uc-card uc-card-hover flex w-full flex-col items-start gap-3 p-5 text-left"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                  <c.icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold text-foreground">{c.label}</span>
                <span className="text-xs text-muted-foreground">{c.note}</span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-secondary/50 py-14">
        <div className="uc-container">
          <SectionHead eyebrow="How it works" title="Booked in three simple steps" />
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="uc-card h-full p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TOP KARIGARS */}
      <section className="uc-container py-14">
        <SectionHead eyebrow="Top rated" title="Meet karigars people love" subtitle="Highest rated professionals this month, based on verified customer reviews." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KARIGARS.map((k, i) => (
            <Reveal key={k.name} delay={i * 60}>
              <div className="uc-card uc-card-hover h-full p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                    {k.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{k.name}</p>
                    <p className="text-xs text-muted-foreground">{k.trade} · {k.exp}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-foreground">
                    <Star className="h-4 w-4 fill-warning text-warning" /> {k.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">{k.jobs} jobs</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="border-y border-border bg-secondary/50 py-14">
        <div className="uc-container">
          <SectionHead eyebrow="Why KarigarHub" title="A service experience you can trust" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 60}>
                <div className="uc-card h-full p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                    <w.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-foreground">{w.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER CTA */}
      <section className="uc-container py-16">
        <div className="uc-card gradient-primary p-10 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-3xl">
            Your next home fix is one tap away
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/85">
            Join thousands of households booking verified karigars every week.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-6 rounded-xl font-bold"
            onClick={() => navigate("/signup/customer")}
          >
            Get started free <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* KARIGAR CTA STRIP */}
      <section className="border-t border-border bg-secondary">
        <div className="uc-container flex flex-col items-center justify-between gap-6 py-12 sm:flex-row sm:text-left">
          <div className="text-center sm:text-left">
            <p className="uc-eyebrow">For professionals</p>
            <h2 className="mt-2 text-xl font-extrabold text-foreground sm:text-2xl">Are you a karigar?</h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              Get steady work near you, set your own availability and get paid on time.
            </p>
          </div>
          <Button size="lg" className="rounded-xl font-semibold" onClick={() => navigate("/signup/karigar")}>
            Join as a karigar <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card">
        <div className="uc-container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="font-extrabold tracking-tight text-foreground">
              Karigar<span className="text-primary">Hub</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} KarigarHub. Trusted home services across India.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
