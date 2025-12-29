"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  ar: {
    title: "زابط", slogan: "دليلك الشامل للبث المباشر", placeholder: "ابحث عن فيلم أو مسلسل...", 
    sections: { local: "أكثر شيوعاً في قطر", global: "التوجهات العالمية", search: "نتائج البحث" },
    categories: { movie: "أفلام", tv: "مسلسلات" },
    available: "متوفر على :", close: "إغلاق", more: "عرض المزيد",
  },
  fr: {
    title: "ZAPIT", slogan: "Votre guide ultime du streaming", placeholder: "Chercher un film, une série...", 
    sections: { local: "Top au Qatar", global: "Tendances Mondiales", search: "Résultats de recherche" },
    categories: { movie: "Films", tv: "Séries" },
    available: "Disponible sur :", close: "Fermer", more: "Voir plus",
  },
  en: {
    title: "ZAPIT", slogan: "Your ultimate streaming guide", placeholder: "Search movies, shows...", 
    sections: { local: "Trending in Qatar", global: "Global Trends", search: "Search Results" },
    categories: { movie: "Movies", tv: "TV Shows" },
    available: "Watch on:", close: "Close", more: "See more",
  }
};

export default function Home() {
  const [lang, setLang] = useState('ar'); 
  const [localContent, setLocalContent] = useState([]);
  const [globalContent, setGlobalContent] = useState([]);
  const [searchContent, setSearchContent] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie'); 
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [providers, setProviders] = useState(null);
  const [showTopBtn, setShowTopBtn] = useState(false); // État pour le bouton "Haut"

  const t = translations[lang];
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (['ar', 'fr', 'en'].includes(browserLang)) setLang(browserLang);

    // Détecter le scroll pour le bouton "Haut"
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const fetchLocalData = async () => {
    const tmdbLang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
    try {
      const res = await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&sort_by=popularity.desc&watch_region=QA&with_watch_monetization_types=flatrate`);
      const data = await res.json();
      setLocalContent(data.results?.slice(0, 6) || []);
    } catch (e) { console.error(e); }
  };

  const fetchGlobalData = async () => {
    const tmdbLang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
    try {
      const res = await fetch(`https://api.themoviedb.org/3/trending/${type}/week?api_key=${API_KEY}&language=${tmdbLang}`);
      const data = await res.json();
      setGlobalContent(data.results?.slice(0, 12) || []);
    } catch (e) { console.error(e); }
  };

  const fetchSearch = async (q, isMore = false) => {
    const tmdbLang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
    const nextPage = isMore ? page + 1 : 1;
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=${tmdbLang}&query=${q}&page=${nextPage}`);
      const data = await res.json();
      const newItems = data.results?.filter(i => i.poster_path) || [];
      
      if (isMore) {
        setSearchContent(prev => [...prev, ...newItems]);
        setPage(nextPage);
      } else {
        setSearchContent(newItems);
        setPage(1);
      }
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

  const goHome = () => {
    setQuery('');
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const GridDisplay = ({ items, title }) => (
    <div className="mb-12">
      <h3 className={`text-[#d4fd41] text-xs font-black uppercase tracking-[0.3em] mb-6 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">
        {items.map((m, idx) => (
          <motion.div key={`${m.id}-${idx}`} whileHover={{ y: -8 }} onClick={() => {setSelectedItem(m); fetchProviders(m.id, m.media_type || type)}} className="group cursor-pointer">
            <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-white/5 border border-white/5 mb-3">
              <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                <span className="text-[#d4fd41] text-[10px] font-bold">★</span>
                <span className="text-white text-[10px] font-black">{m.vote_average?.toFixed(1)}</span>
              </div>
            </div>
            <h4 className={`text-sm font-bold truncate px-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {m.title || m.name}
            </h4>
            <p className={`text-[10px] text-gray-500 px-2 mt-1 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              {(m.release_date || m.first_air_date || '').split('-')[0]}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto relative">
        
        {/* Langues */}
        <div className={`fixed top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} flex gap-2 z-[110]`}>
          {['ar', 'fr', 'en'].map(l => (
            <button key={l} onClick={() => setLang(l)} className={`text-[10px] font-black px-3 py-1 rounded-full border transition-all ${lang === l ? 'bg-[#d4fd41] text-black border-[#d4fd41]' : 'text-gray-500 border-white/10 bg-black/50 backdrop-blur-md'}`}>{l}</button>
          ))}
        </div>

        {/* Header - Cliquable pour Home */}
        <header className="flex flex-col items-center mb-12 pt-10 cursor-pointer group" onClick={goHome}>
          <div className="flex flex-row-reverse items-center gap-4 transition-transform group-hover:scale-105">
            <span className="text-6xl md:text-8xl font-black text-[#58339d]">ZAPIT</span>
            <span className="text-gray-900 text-6xl md:text-8xl font-thin">|</span>
            <span className="text-6xl md:text-8xl font-black text-[#d4fd41]">زابط</span>
          </div>
          <p className="text-gray-500 mt-4 tracking-[0.3em] uppercase text-[10px] font-bold text-center">{t.slogan}</p>
        </header>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            {['movie', 'tv'].map((k) => (
              <button key={k} onClick={() => {setType(k); setQuery('');}} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${type === k ? 'bg-[#d4fd41] text-black' : 'text-gray-500'}`}>{t.categories[k]}</button>
            ))}
          </div>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.placeholder} className="w-full bg-white/5 border-b-2 border-gray-800 p-6 text-center outline-none focus:border-[#d4fd41] text-xl font-bold rounded-3xl" />
        </div>

        {/* Contenu */}
        {query ? (
          <>
            <GridDisplay items={searchContent} title={t.sections.search} />
            {searchContent.length >= 10 && (
                <div className="flex justify-center mt-8 mb-12">
                    <button onClick={() => fetchSearch(query, true)} className="bg-white/5 border border-white/10 px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#d4fd41] hover:text-black transition-all">
                        {t.more}
                    </button>
                </div>
            )}
          </>
        ) : (
          <>
            <GridDisplay items={localContent} title={t.sections.local} />
            <GridDisplay items={globalContent} title={t.sections.global} />
          </>
        )}

        {/* Bouton Scroll to Top Flottant */}
        <AnimatePresence>
          {showTopBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={goHome}
              className={`fixed bottom-8 ${lang === 'ar' ? 'left-8' : 'right-8'} z-[100] bg-[#d4fd41] text-black w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl border-4 border-black font-black hover:scale-110 transition-transform`}
            >
              ↑
            </motion.button>
          )}
        </AnimatePresence>

        {/* Modal de Détails */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedItem(null)}>
              <motion.div initial={{ y: 50 }} className="bg-[#0c0c0d] border border-white/10 max-w-5xl w-full rounded-[3rem] overflow-hidden flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="w-full md:w-2/5 h-64 md:h-auto"><img src={`https://image.tmdb.org/t/p/w500${selectedItem.poster_path}`} className="w-full h-full object-cover" alt="" /></div>
                <div className="w-full md:w-3/5 p-8 md:p-16 overflow-y-auto">
                  <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tighter">{selectedItem.title || selectedItem.name}</h2>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-[#d4fd41] font-bold">★ {selectedItem.vote_average?.toFixed(1)}</span>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-500 text-sm">{(selectedItem.release_date || selectedItem.first_air_date || '').split('-')[0]}</span>
                  </div>
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
