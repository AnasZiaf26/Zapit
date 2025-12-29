"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  ar: {
    title: "زابط", slogan: "دليلك الشامل للبث المباشر", placeholder: "ابحث عن فيلم أو مسلسل...", 
    sections: { local: "أكثر شيوعاً في قطر", global: "التوجهات العالمية" },
    categories: { all: "الكل", movie: "أفلام", tv: "مسلسلات" },
    available: "متوفر على :", close: "إغلاق",
  },
  fr: {
    title: "ZAPIT", slogan: "Votre guide ultime du streaming", placeholder: "Chercher un film, une série...", 
    sections: { local: "Top au Qatar", global: "Tendances Mondiales" },
    categories: { all: "Tout", movie: "Films", tv: "Séries" },
    available: "Disponible sur :", close: "Fermer",
  },
  en: {
    title: "ZAPIT", slogan: "Your ultimate streaming guide", placeholder: "Search movies, shows...", 
    sections: { local: "Trending in Qatar", global: "Global Trends" },
    categories: { all: "All", movie: "Movies", tv: "TV Shows" },
    available: "Watch on:", close: "Close",
  }
};

export default function Home() {
  const [lang, setLang] = useState('ar'); 
  const [localContent, setLocalContent] = useState([]);
  const [globalContent, setGlobalContent] = useState([]);
  const [searchContent, setSearchContent] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie'); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [providers, setProviders] = useState(null);

  const t = translations[lang];
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (['ar', 'fr', 'en'].includes(browserLang)) setLang(browserLang);
  }, []);

  useEffect(() => {
    if (!query) {
        fetchLocalData();
        fetchGlobalData();
    }
  }, [type, lang, query]);

  useEffect(() => {
    if (query) {
      const delay = setTimeout(() => fetchSearch(query), 600);
      return () => clearTimeout(delay);
    }
  }, [query]);

  // Section 1 : Top au Qatar
  const fetchLocalData = async () => {
    const tmdbLang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
    try {
      // On utilise watch_region=QA pour cibler le Qatar
      const res = await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&sort_by=popularity.desc&watch_region=QA&with_watch_monetization_types=flatrate`);
      const data = await res.json();
      setLocalContent(data.results?.slice(0, 6) || []);
    } catch (e) { console.error(e); }
  };

  // Section 2 : Tendances Mondiales
  const fetchGlobalData = async () => {
    const tmdbLang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
    try {
      const res = await fetch(`https://api.themoviedb.org/3/trending/${type}/week?api_key=${API_KEY}&language=${tmdbLang}`);
      const data = await res.json();
      setGlobalContent(data.results?.slice(0, 12) || []);
    } catch (e) { console.error(e); }
  };

  const fetchSearch = async (q) => {
    const tmdbLang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=${tmdbLang}&query=${q}`);
      const data = await res.json();
      setSearchContent(data.results?.filter(i => i.poster_path) || []);
    } catch (e) { console.error(e); }
  };

  const fetchProviders = async (id, itemType) => {
    setProviders(null);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/${itemType}/${id}/watch/providers?api_key=${API_KEY}`);
      const data = await res.json();
      const regionData = data.results?.QA || data.results?.FR || data.results?.US;
      setProviders(regionData || null);
    } catch (e) { console.error(e); }
  };

  const getDirectLink = (pName, mTitle) => {
    const title = encodeURIComponent(mTitle);
    const name = pName.toLowerCase();
    if (name.includes('netflix')) return `https://www.netflix.com/search?q=${title}`;
    if (name.includes('prime')) return `https://www.primevideo.com/search/?phrase=${title}`;
    if (name.includes('apple')) return `https://tv.apple.com/search?term=${title}`;
    return `https://www.google.com/search?q=${title}+watch+on+${encodeURIComponent(pName)}`;
  };

  const GridDisplay = ({ items, title }) => (
    <div className="mb-12">
      <h3 className={`text-[#d4fd41] text-xs font-black uppercase tracking-[0.3em] mb-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {items.map((m) => (
          <motion.div key={m.id} whileHover={{ y: -8 }} onClick={() => {setSelectedItem(m); fetchProviders(m.id, m.media_type || type)}} className="group relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-white/5 cursor-pointer border border-white/5">
            <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={m.title || m.name} />
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto relative">
        
        <div className={`absolute top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} flex gap-2 z-[110]`}>
          {['ar', 'fr', 'en'].map(l => (
            <button key={l} onClick={() => setLang(l)} className={`text-[10px] font-black px-3 py-1 rounded-full border transition-all ${lang === l ? 'bg-[#d4fd41] text-black border-[#d4fd41]' : 'text-gray-500 border-white/10'}`}>{l}</button>
          ))}
        </div>

        <header className="flex flex-col items-center mb-12 pt-10">
          <div className="flex flex-row-reverse items-center gap-4">
            <span className="text-6xl md:text-8xl font-black text-[#58339d]">ZAPIT</span>
            <span className="text-gray-900 text-6xl md:text-8xl font-thin">|</span>
            <span className="text-6xl md:text-8xl font-black text-[#d4fd41]">زابط</span>
          </div>
          <p className="text-gray-500 mt-4 tracking-[0.3em] uppercase text-[10px] font-bold text-center">{t.slogan}</p>
        </header>

        <div className="max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            {['movie', 'tv'].map((k) => (
              <button key={k} onClick={() => setType(k)} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${type === k ? 'bg-[#d4fd41] text-black' : 'text-gray-500'}`}>{t.categories[k]}</button>
            ))}
          </div>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.placeholder} className="w-full bg-white/5 border-b-2 border-gray-800 p-6 text-center outline-none focus:border-[#d4fd41] text-xl font-bold rounded-3xl" />
        </div>

        {query ? (
          <GridDisplay items={searchContent} title="Résultats de recherche" />
        ) : (
          <>
            <GridDisplay items={localContent} title={t.sections.local} />
            <GridDisplay items={globalContent} title={t.sections.global} />
          </>
        )}

        <AnimatePresence>
          {selectedItem && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedItem(null)}>
              <motion.div initial={{ y: 50 }} className="bg-[#0c0c0d] border border-white/10 max-w-5xl w-full rounded-[3rem] overflow-hidden flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="w-full md:w-2/5 h-64 md:h-auto"><img src={`https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`} className="w-full h-full object-cover" alt="" /></div>
                <div className="w-full md:w-3/5 p-8 md:p-16 overflow-y-auto">
                  <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">{selectedItem.title || selectedItem.name}</h2>
                  <p className="text-gray-400 text-lg mb-10 font-light italic">"{selectedItem.overview}"</p>
                  {providers && (
                    <div className="mb-10 bg-white/5 p-6 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#d4fd41] mb-5">{t.available}</p>
                      <div className="flex flex-wrap gap-4">
                        {(providers.flatrate || []).map(p => (
                          <a key={p.provider_id} href={getDirectLink(p.provider_name, selectedItem.title || selectedItem.name)} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                            <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-14 h-14 rounded-2xl border border-white/10" alt={p.provider_name} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={() => setSelectedItem(null)} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#d4fd41] transition-all">{t.close}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
