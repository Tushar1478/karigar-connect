import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import ServiceCategoryGrid from '@/components/ServiceCategoryGrid';
import KarigarCard from '@/components/KarigarCard';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

const CustomerDashboard = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [skillFilter, setSkillFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [priceSort, setPriceSort] = useState('none');
  const [karigars, setKarigars] = useState<Tables<'karigars'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from('karigars').select('*');
      setKarigars(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let list = karigars.filter(k => (k as any).availability !== 'offline');
    if (search) list = list.filter(k => k.name.toLowerCase().includes(search.toLowerCase()) || k.skill.toLowerCase().includes(search.toLowerCase()));
    if (skillFilter !== 'all') list = list.filter(k => k.skill === skillFilter);
    if (ratingFilter !== 'all') list = list.filter(k => Number(k.rating) >= Number(ratingFilter));
    if (priceSort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    if (priceSort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [search, skillFilter, ratingFilter, priceSort, karigars]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="relative mb-8 animate-fade-in">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-12 pl-10 text-base" placeholder="Search for electrician, plumber, carpenter..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {!search && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold text-foreground">Service Categories</h2>
            <ServiceCategoryGrid />
          </section>
        )}

        <section className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Skill" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {['Electrician','Plumber','Carpenter','AC Repair','Mason','Painter'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Rating" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4.5">4.5+ ★</SelectItem>
                <SelectItem value="4">4+ ★</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priceSort} onValueChange={setPriceSort}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Price" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Default</SelectItem>
                <SelectItem value="low">Price: Low→High</SelectItem>
                <SelectItem value="high">Price: High→Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-foreground">
            {search ? `Results for "${search}"` : 'Nearby Karigars'}
          </h2>
          {loading ? (
            <p className="py-12 text-center text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No karigars found. Try a different search.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(k => <KarigarCard key={k.id} karigar={k} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CustomerDashboard;
