import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Zap, Droplets, Hammer, Home, Wind, Brush, X } from 'lucide-react';
import Header from '@/components/Header';
import KarigarCard from '@/components/KarigarCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

/* ─── CATEGORY DATA ─────────────────────────────────── */
const CATEGORIES = [
  { label: 'Electrician', icon: Zap, desc: 'Wiring, fitting & repairs' },
  { label: 'Plumber', icon: Droplets, desc: 'Pipes, leaks & installation' },
  { label: 'Carpenter', icon: Hammer, desc: 'Furniture, doors & woodwork' },
  { label: 'AC Repair', icon: Wind, desc: 'Service, gas & installation' },
  { label: 'Mason', icon: Home, desc: 'Tiles, walls & construction' },
  { label: 'Painter', icon: Brush, desc: 'Interior, exterior & textures' },
];

/* ─── CATEGORY TILE ─────────────────────────────────── */
function CategoryCard({ label, icon: Icon, desc, active, onClick }) {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className={`uc-card uc-card-hover flex flex-col items-start gap-1 p-5 text-left ${active ? 'border-primary/60 bg-primary-soft/40' : ''}`}
    >
      <div className={`mb-3 grid h-12 w-12 place-items-center rounded-2xl ${active ? 'bg-primary text-primary-foreground' : 'bg-primary-soft text-primary'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-sm font-bold text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const CustomerDashboard = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  const [search, setSearch] = useState(searchFromUrl);

  useEffect(() => { setSearch(searchFromUrl); }, [searchFromUrl]);

  const [skillFilter, setSkillFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [priceSort, setPriceSort] = useState('none');
  const [karigars, setKarigars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase.from('karigars').select('*');
      setKarigars(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = karigars.filter(k => (k as any).availability !== 'offline');
    if (search) list = list.filter(k => (k as any).name.toLowerCase().includes(search.toLowerCase()) || (k as any).skill.toLowerCase().includes(search.toLowerCase()));
    if (skillFilter !== 'all') list = list.filter(k => (k as any).skill === skillFilter);
    if (ratingFilter !== 'all') list = list.filter(k => Number((k as any).rating) >= Number(ratingFilter));
    if (priceSort === 'low') list = [...list].sort((a: any, b: any) => a.price - b.price);
    if (priceSort === 'high') list = [...list].sort((a: any, b: any) => b.price - a.price);
    return list;
  }, [search, skillFilter, ratingFilter, priceSort, karigars]);

  const activeFiltersCount = [skillFilter !== 'all', ratingFilter !== 'all', priceSort !== 'none'].filter(Boolean).length;
  const clearFilters = () => { setSkillFilter('all'); setRatingFilter('all'); setPriceSort('none'); };

  return (
    <div className="min-h-screen bg-secondary/40">
      <Header />

      <main className="uc-container py-8">
        {/* PAGE TITLE */}
        <div className="mb-7 animate-fade-in">
          <span className="uc-eyebrow mb-2 block">{t('customer')} {t('dashboard')}</span>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Find a <span className="text-primary">Karigar</span> Near You
          </h1>
        </div>

        {/* SEARCH */}
        <div className="uc-card mb-8 flex items-center gap-3 p-3">
          <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            className="h-11 flex-1 rounded-xl border-none bg-transparent shadow-none focus-visible:ring-0"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSearch('')}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* SERVICE CATEGORIES */}
        {!search && (
          <section className="mb-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight">{t('skills')}</h2>
                <p className="text-xs text-muted-foreground">Tap a category to filter karigars</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{CATEGORIES.length} Trades</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {CATEGORIES.map(cat => (
                <CategoryCard
                  key={cat.label}
                  {...cat}
                  active={skillFilter === cat.label}
                  onClick={() => setSkillFilter(skillFilter === cat.label ? 'all' : cat.label)}
                />
              ))}
            </div>
          </section>
        )}

        {/* FILTERS */}
        <section className="mb-8">
          <div className="uc-card flex flex-wrap items-center gap-3 p-4">
            <div className="mr-1 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">{t('profile')}</span>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{activeFiltersCount}</span>
              )}
            </div>
            <div className="h-5 w-px bg-border" />

            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder={t("skills")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {['Electrician','Plumber','Carpenter','AC Repair','Mason','Painter'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder="All Ratings" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4.5">4.5+ ★</SelectItem>
                <SelectItem value="4">4.0+ ★</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceSort} onValueChange={setPriceSort}>
              <SelectTrigger className="w-[170px] rounded-xl"><SelectValue placeholder="Sort by Price" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Default Order</SelectItem>
                <SelectItem value="low">Price: Low → High</SelectItem>
                <SelectItem value="high">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>

            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" className="ml-auto gap-1.5 rounded-xl" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" /> Clear all
              </Button>
            )}
          </div>
        </section>

        {/* KARIGAR RESULTS */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">
              {search ? <span>Results for <span className="text-primary">"{search}"</span></span> : 'Nearby Karigars'}
            </h2>
            {!loading && (
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{filtered.length} found</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="uc-card p-16 text-center">
              <div className="mb-4 text-4xl">🔍</div>
              <p className="text-sm text-foreground">{t('no_results')}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((k: any) => (
                <KarigarCard key={k.id} karigar={k} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CustomerDashboard;
