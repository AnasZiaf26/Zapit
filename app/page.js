"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  ar: {
    title: "زابط", slogan: "دليلك الشامل للبث المباشر", placeholder: "ابحث عن فيلم أو مسلسل...",
    auth: { login: "تسجيل الدخول", signup: "إنشاء حساب", email: "البريد الإلكتروني", pass: "كلمة المرور", submit: "تأكيد", noAccount: "ليس لديك حساب؟", hasAccount: "لديك حساب؟" },
    sections: { local: "أكثر شيوعاً في قطر 🇶🇦", netflix: "أفضل ما في Netflix", cinema: "في السينما", prime: "أفضل ما في Prime Video", search: "نتائج البحث", global: "التوجهات العالمية", genre: "حسب التصنيف" },
    categories: { movie: "أفلام", tv: "مسلسلات" },
    user: { profile: "حسابي", logout: "تسجيل الخروج", favorites: "قائمتي المفضلة", noFavs: "لا توجد أفلام في قائمتك بعد" },
    genres: { 28: "أكشن", 35: "كوميدي", 27: "رعب", 10749: "رومانسية", 878: "خيال علمي" },
    available: "متوفر على :", close: "إغلاق", more: "عرض المزيد", noDesc: "لا يوجد وصف متاح حاليا.", cinemaOnly: "يعرض حالياً في دور السينما فقط"
  },
  fr: {
    title: "ZAPIT", slogan: "Votre guide ultime du streaming", placeholder: "Chercher un film, une série...",
    auth: { login: "Connexion", signup: "Inscription", email: "Email", pass: "Mot de passe", submit: "Valider", noAccount: "Pas de compte ?", hasAccount: "Déjà inscrit ?" },
    sections: { local: "Top au Qatar 🇶🇦", netflix: "Top Netflix", cinema: "Au Cinéma", prime: "Top Prime Video", search: "Résultats", global: "Tendances Mondiales", genre: "Par Genre" },
    categories: { movie: "Films", tv: "Séries" },
    user: { profile: "Mon Compte", logout: "Déconnexion", favorites: "Mes Favoris", noFavs: "Aucun favori pour le moment" },
    genres: { 28: "Action", 35: "Comédie", 27: "Horreur", 10749: "Romance", 878: "Sci-Fi" },
    available: "Disponible sur :", close: "Fermer", more: "Voir plus", noDesc: "Aucune description disponible.", cinemaOnly: "Actuellement au cinéma uniquement"
  },
  en: {
    title: "ZAPIT", slogan: "Your ultimate streaming guide", placeholder: "Search movies...",
    auth: { login: "Login", signup: "Sign Up", email: "Email", pass: "Password", submit: "Submit", noAccount: "No account?", hasAccount: "Already registered?" },
    sections: { local: "Trending in Qatar 🇶🇦", netflix: "Netflix Top", cinema: "In Theaters", prime: "Prime Video Top", search: "Search Results", global: "Global Trends", genre: "By Genre" },
    categories: { movie: "Movies", tv: "TV Shows" },
    user: { profile: "My Account", logout: "Logout", favorites: "My Favorites", noFavs: "No favorites yet" },
    genres: { 28: "Action", 35: "Comedy", 27: "Horror", 10749: "Romance", 878: "Sci-Fi" },
    available: "Watch on:", close: "Close", more: "See more", noDesc: "No description available.", cinemaOnly: "Currently in theaters only"
  }
};

const GENRES_IDS = [28, 35, 27, 10749, 878];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('fr');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({ local: [], netflix: [], cinema: [], prime: [], genre: [], search: [] });
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [providers, setProviders] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const t = translations[lang];

  useEffect(() => {
    const systemLang = navigator.language.split('-')[0];
    if (['ar', 'fr', 'en'].includes(systemLang)) setLang(systemLang);
    const savedUser = localStorage.getItem('zapit_current_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setMounted(true);
  }, []);

  const fetchProviders = async (id, itemType) => {
    setProviders(null);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/${itemType}/${id}/watch/providers?api_key=${API_KEY}`);
      const data = await res.json();
      const regionData = data.results?.QA || data.results?.US;
      setProviders(regionData || null);
    } catch (e) { console.error(e); }
  };

  const fetchContent = useCallback(async () => {
    if (!API_KEY || !mounted) return;
    setLoading(true);
    const tmdbLang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
    const base = `https://api.themoviedb.org/3`;
    try {
      if (query) {
        const r = await fetch(`${base}/search/multi?api_key=${API_KEY}&language=${tmdbLang}&query=${query}`);
        const d = await r.json();
        setContent(prev => ({ ...prev, search: d.results?.filter(i => i.poster_path).slice(0, 12) }));
      } else {
        const urls = {
          local: `${base}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&watch_region=QA&with_watch_monetization_types=flatrate`,
          netflix: `${base}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_watch_providers=8&watch_region=QA`,
          prime: `${base}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_watch_providers=119&watch_region=QA`,
          cinema: `${base}/movie/now_playing?api_key=${API_KEY}&language=${tmdbLang}&region=QA`,
          genre: selectedGenre ? `${base}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_genres=${selectedGenre}` : null
        };
        const results = {};
        for (const [key, url] of Object.entries(urls)) {
          if (url) { 
            const r = await fetch(url); 
            const d = await r.json(); 
            results[key] = d.results?.slice(0, 6); 
          }
        }
        setContent(prev => ({ ...prev, ...results }));
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [type, lang, API_KEY, mounted, selectedGenre, query]);

  useEffect(() => { 
    const delay = setTimeout(() => fetchContent(), query ? 500 : 0);
    return () => clearTimeout(delay);
  }, [fetchContent]);

  const toggleFavorite = (item) => {
    if (!user) { setAuthMode('login'); return; }
    const currentFavs = user.favorites || [];
    const isFav = currentFavs.some(f => f.id === item.id);
    const updatedFavs = isFav ? currentFavs.filter(f => f.id !== item.id) : [...currentFavs, { id: item.id, title: item.title || item.name, poster: item.poster_path }];
    const updatedUser = { ...user, favorites: updatedFavs };
    setUser(updatedUser);
    localStorage.setItem('zapit_current_user', JSON.stringify(updatedUser));
  };

  const handleAuth = (e) => {
    e.preventDefault();
    const mockUser = { email: formData.email, name: formData.email.split('@')[0], favorites: user?.favorites || [] };
    setUser(mockUser);
    localStorage.setItem('zapit_current_user', JSON.stringify(mockUser));
    setAuthMode(null);
  };

  const getDirectLink = (pName, mTitle) => {
    const title = encodeURIComponent(mTitle);
    const name = pName.toLowerCase();
    if (name.includes('netflix')) return `https://www.netflix.com/search?q=${title}`;
    if (name.includes('prime')) return `https://www.primevideo.com/search/?phrase=${title}`;
    if (name.includes('apple')) return `https://tv.apple.com/search?term=${title}`;
    return `https://www.google.com/search?q=${title}+watch+on+${encodeURIComponent(pName)}`;
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-12 relative z-50">
          <div className="flex gap-2">
            {['ar', 'fr', 'en'].map(l => (
              <button key={l} onClick={() => { setLang(l); setSelectedGenre(null); }} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${lang === l ? 'bg-[#d4fd41] text-black' : 'text-gray-500 bg-white/5 hover:bg-white/10'}`}>{l.toUpperCase()}</button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl relative hover:bg-white/10 transition-all">
                {user.favorites?.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d4fd41] text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#050505]">{user.favorites.length}</span>}
                <span className="text-[10px] font-black uppercase hidden md:block">{user.name}</span>
                <div className="w-8 h-8 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full"></div>
              </button>
            ) : (
              <div className="flex gap-4">
                <button onClick={() => setAuthMode('login')} className="text-gray-400 hover:text-white text-[10px] font-black uppercase tracking-widest">{t.auth.login}</button>
                <button onClick={() => setAuthMode('signup')} className="bg-[#d4fd41] text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">{t.auth.signup}</button>
              </div>
            )}
          </div>
        </div>

        {/* LOGO */}
        <header className="text-center mb-16 cursor-pointer" onClick={() => { setQuery(''); setSelectedGenre(null); }}>
          <div className="inline-flex flex-row-reverse items-center gap-4">
            <h1 className="text-6xl md:text-8xl font-black text-[#58339d]">ZAPIT</h1>
            <span className="w-[2px] h-12 bg-gray-800"></span>
            <h1 className="text-6xl md:text-8xl font-black text-[#d4fd41]">زابط</h1>
          </div>
          <p className="text-gray-500 mt-4 tracking-[0.3em] uppercase text-[10px] font-bold text-center">{t.slogan}</p>
        </header>

        {/* SEARCH & FILTERS */}
        <div className="max-w-2xl mx-auto mb-20 space-y-6">
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            {['movie', 'tv'].map((k) => (
              <button key={k} onClick={() => { setType(k); setSelectedGenre(null); }} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${type === k ? 'bg-[#d4fd41] text-black' : 'text-gray-500'}`}>{t.categories[k]}</button>
            ))}
          </div>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.placeholder} className="w-full bg-white/5 border-b-2 border-white/10 p-6 text-center outline-none focus:border-[#d4fd41] text-xl font-bold rounded-3xl" />
          <div className="flex flex-wrap justify-center gap-2">
            {GENRES_IDS.map(id => (
              <button key={id} onClick={() => { setSelectedGenre(id); setQuery(''); }} className={`px-4 py-2 rounded-full text-[9px] font-black uppercase border transition-all ${selectedGenre === id ? 'bg-[#d4fd41] text-black border-[#d4fd41]' : 'border-white/5 text-gray-500 hover:border-white/20'}`}>{t.genres[id]}</button>
            ))}
          </div>
        </div>

        {/* CONTENT GRIDS */}
        <div className="space-y-24">
          {query ? (
            <GridDisplay items={content.search} title={t.sections.search} onToggleFav={toggleFavorite} userFavs={user?.favorites} onClickItem={(m) => {setSelectedItem(m); fetchProviders(m.id, m.media_type || type)}} />
          ) : (
            <>
              <GridDisplay items={selectedGenre ? content.genre : content.local} title={selectedGenre ? t.genres[selectedGenre] : t.sections.local} isLoading={loading} onToggleFav={toggleFavorite} userFavs={user?.favorites} onClickItem={(m) => {setSelectedItem(m); fetchProviders(m.id, type)}} />
              {!selectedGenre && (
                <>
                  <GridDisplay items={content.netflix} title={t.sections.netflix} color="#E50914" onToggleFav={toggleFavorite} userFavs={user?.favorites} onClickItem={(m) => {setSelectedItem(m); fetchProviders(m.id, type)}} />
                  <GridDisplay items={content.prime} title={t.sections.prime} color="#00a8e1" onToggleFav={toggleFavorite} userFavs={user?.favorites} onClickItem={(m) => {setSelectedItem(m); fetchProviders(m.id, type)}} />
                  <GridDisplay items={content.cinema} title={t.sections.cinema} onToggleFav={toggleFavorite} userFavs={user?.favorites} onClickItem={(m) => {setSelectedItem(m); fetchProviders(m.id, type)}} />
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {authMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
             <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-[#0c0c0d] border border-white/10 p-10 rounded-[3rem] max-w-md w-full shadow-2xl">
                <h2 className="text-3xl font-black mb-6 text-center uppercase tracking-tighter text-[#d4fd41]">{authMode === 'login' ? t.auth.login : t.auth.signup}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                  <input type="email" required placeholder={t.auth.email} className="w-full bg-white/5 p-4 rounded-2xl outline-none border border-white/5 focus:border-[#d4fd41] transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input type="password" required placeholder={t.auth.pass} className="w-full bg-white/5 p-4 rounded-2xl outline-none border border-white/5 focus:border-[#d4fd41] transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <button className="w-full py-4 bg-[#d4fd41] text-black font-black uppercase rounded-2xl shadow-lg shadow-[#d4fd41]/10">{t.auth.submit}</button>
                </form>
                <button onClick={() => setAuthMode(null)} className="w-full mt-6 text-gray-700 text-[10px] font-black hover:text-white transition-colors uppercase tracking-widest">Fermer</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ITEM DETAILS MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedItem(null)}>
            <motion.div initial={{ y: 50 }} className="bg-[#0c0c0d] border border-white/10 max-w-5xl w-full rounded-[3rem] overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-[210] bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/10">✕</button>
              <div className="w-full md:w-2/5 h-64 md:h-auto"><img src={`https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`} className="w-full h-full object-cover" alt="" /></div>
              <div className="w-full md:w-3/5 p-8 md:p-16 overflow-y-auto">
                <h2 className="text-3xl md:text-5xl font-black mb-2">{selectedItem.title || selectedItem.name}</h2>
                <div className="flex items-center gap-2 mb-6 text-sm">
                  <span className="text-[#d4fd41] font-bold">★ {selectedItem.vote_average?.toFixed(1)}</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-400">{(selectedItem.release_date || selectedItem.first_air_date || '').split('-')[0]}</span>
                </div>
                <p className="text-gray-400 text-lg mb-10 font-light">{selectedItem.overview || t.noDesc}</p>
                <div className="mb-10 bg-white/5 p-6 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black uppercase text-[#d4fd41] mb-5">{t.available}</p>
                  {providers?.flatrate ? (
                    <div className="flex flex-wrap gap-4">
                      {providers.flatrate.map(p => (
                        <a key={p.provider_id} href={getDirectLink(p.provider_name, selectedItem.title || selectedItem.name)} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform"><img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-14 h-14 rounded-2xl border border-white/10" alt="" /></a>
                      ))}
                    </div>
                  ) : <p className="text-gray-500 text-[10px] uppercase font-black">{t.cinemaOnly}</p>}
                </div>
                <button onClick={() => setSelectedItem(null)} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest">{t.close}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR PROFILE */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 w-full md:w-[400px] h-full bg-[#0c0c0d] z-[2000] p-10 border-l border-white/10 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black tracking-widest text-[#d4fd41] italic">{t.user.profile}</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-2xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="mb-10 p-6 bg-white/5 rounded-[2.5rem] text-center border border-white/5">
                <div className="w-16 h-16 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full mx-auto mb-4"></div>
                <p className="font-black text-lg">{user?.name}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Membre Zapit</p>
              </div>
              <h3 className="text-[10px] font-black text-gray-500 mb-6 tracking-widest uppercase">{t.user.favorites}</h3>
              <div className="space-y-4">
                {user?.favorites?.length > 0 ? user.favorites.map((fav) => (
                  <div key={fav.id} className="flex gap-4 items-center bg-white/5 p-3 rounded-2xl border border-white/5 group transition-all" onClick={() => setSelectedItem({id: fav.id, title: fav.title, poster_path: fav.poster})}>
                    <img src={`https://image.tmdb.org/t/p/w200${fav.poster}`} className="w-12 h-16 object-cover rounded-xl" />
                    <p className="text-[11px] font-black truncate flex-1">{fav.title}</p>
                    <button onClick={(e) => {e.stopPropagation(); toggleFavorite({id: fav.id});}} className="text-red-500">✕</button>
                  </div>
                )) : <p className="text-[10px] text-gray-600 italic text-center py-10">{t.user.noFavs}</p>}
              </div>
            </div>
            <button onClick={() => { localStorage.removeItem('zapit_current_user'); setUser(null); setIsProfileOpen(false); }} className="w-full py-4 bg-red-500/10 text-red-500 font-black rounded-2xl mt-6 uppercase text-[10px] tracking-widest border border-red-500/20">DECONNEXION</button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function GridDisplay({ items, title, color = "#d4fd41", isLoading = false, onToggleFav, userFavs = [], onClickItem }) {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <h3 style={{ color }} className="text-[10px] font-black tracking-[0.4em] uppercase">{title}</h3>
        <div className="h-[1px] flex-1 bg-white/5"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
        {isLoading ? [...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-white/5 rounded-[2.5rem] animate-pulse" />) :
          items?.map(m => {
            const isFav = userFavs?.some(f => f.id === m.id);
            return (
              <motion.div key={m.id} whileHover={{ y: -8 }} className="cursor-pointer group relative" onClick={() => onClickItem(m)}>
                <button onClick={(e) => { e.stopPropagation(); onToggleFav(m); }} className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${isFav ? 'bg-[#d4fd41] border-[#d4fd41] text-black scale-110' : 'bg-black/20 border-white/10 text-white opacity-0 group-hover:opacity-100'}`}>{isFav ? '♥' : '♡'}</button>
                <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 group-hover:border-[#d4fd41]/50 transition-all shadow-xl">
                  <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                </div>
                <p className="mt-4 text-[11px] font-black truncate px-2">{m.title || m.name}</p>
              </motion.div>
            );
          })
        }
      </div>
    </section>
  );
}
