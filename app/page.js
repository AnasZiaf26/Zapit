"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  ar: {
    title: "زابط", slogan: "دليلك الشامل للبث المباشر", placeholder: "ابحث عن فيلم أو مسلسل...", 
    sections: { local: "أكثر شيوعاً في قطر 🇶🇦", global: "التوجهات العالمية", search: "نتائج البحث", genre: "أفضل الأفلام", netflix: "أفضل ما في Netflix", cinema: "يعرض حالياً في السينما", prime: "أفضل ما في Prime Video" },
    categories: { movie: "أفلام", tv: "مسلسلات" },
    available: "متوفر على :", close: "إغلاق", more: "عرض المزيد",
    noDesc: "لا يوجد وصف متاح حاليا لهذا الفيلم.",
    cinemaOnly: "يعرض حالياً في دور السينما فقط"
  },
  fr: {
    title: "ZAPIT", slogan: "Votre guide ultime du streaming", placeholder: "Chercher un film, une série...", 
    sections: { local: "Top au Qatar 🇶🇦", global: "Tendances Mondiales", search: "Résultats de recherche", genre: "Les meilleurs films", netflix: "Le Top Netflix", cinema: "Actuellement au Cinéma", prime: "Le Top Prime Video" },
    categories: { movie: "Films", tv: "Séries" },
    available: "Disponible sur :", close: "Fermer", more: "Voir plus",
    noDesc: "Aucune description disponible pour le moment.",
    cinemaOnly: "Actuellement au cinéma uniquement"
  },
  en: {
    title: "ZAPIT", slogan: "Your ultimate streaming guide", placeholder: "Search movies, shows...", 
    sections: { local: "Trending in Qatar 🇶🇦", global: "Global Trends", search: "Search Results", genre: "Top Movies", netflix: "Best of Netflix", cinema: "In Theaters Now", prime: "Best of Prime Video" },
    categories: { movie: "Movies", tv: "TV Shows" },
    available: "Watch on:", close: "Close", more: "See more",
    noDesc: "No description available at the moment.",
    cinemaOnly: "Currently in theaters only"
  }
};

const genreList = {
  ar: [{ id: 27, name: "رعب" }, { id: 35, name: "كوميدي" }, { id: 28, name: "أكشن" }, { id: 10749, name: "رومانسية" }, { id: 878, name: "خيال علمي" }],
  fr: [{ id: 27, name: "Horreur" }, { id: 35, name: "Comédie" }, { id: 28, name: "Action" }, { id: 10749, name: "Romance" }, { id: 878, name: "Sci-Fi" }],
  en: [{ id: 27, name: "Horror" }, { id: 35, name: "Comedy" }, { id: 28, name: "Action" }, { id: 10749, name: "Romance" }, { id: 878, name: "Sci-Fi" }]
};

export default function Home() {
  const [lang, setLang] = useState('ar'); 
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({ local: [], global: [], netflix: [], cinema: [], prime: [] });
  const [searchContent, setSearchContent] = useState([]);
  const [genreContent, setGenreContent] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie'); 
  const [page, setPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [providers, setProviders] = useState(null);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [userRegion, setUserRegion] = useState('QA');

  const t = translations[lang];
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // Détection auto de la langue et région
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (['ar', 'fr', 'en'].includes(browserLang)) setLang(browserLang);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Qatar') || tz.includes('Doha')) setUserRegion('QA');

    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchFullHome = useCallback(async () => {
    setLoading(true);
    const tmdbLang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
    const baseUrl = `https://api.themoviedb.org/3`;
    
    try {
      const endpoints = {
        local: `${baseUrl}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&sort_by=popularity.desc&watch_region=${userRegion}&with_watch_monetization_types=flatrate`,
        global: `${baseUrl}/trending/${type}/week?api_key=${API_KEY}&language=${tmdbLang}`,
        netflix: `${baseUrl}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_watch_providers=8&watch_region=${userRegion}`,
        prime: `${baseUrl}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_watch_providers=119&watch_region=${userRegion}`,
        cinema: `${baseUrl}/movie/now_playing?api_key=${API_KEY}&language=${tmdbLang}&region=${userRegion}`
      };

      const results = await Promise.all(Object.values(endpoints).map(url => fetch(url).then(r => r.json())));
      
      setContent({
        local: results[0].results?.slice(0, 6) || [],
        global: results[1].results?.slice(0, 6) || [],
        netflix: results[2].results?.slice(0, 6) || [],
        prime: results[3].results?.slice(0, 6) || [],
        cinema: results[4].results?.slice(0, 6) || []
      });
    } catch (e) { console.error("Fetch Error:", e); }
    setLoading(false);
  }, [type, lang, userRegion, API_KEY]);

  useEffect(() => {
    if (!query && !selectedGenre) fetchFullHome();
  }, [fetchFullHome, query, selectedGenre]);

  const fetchSearch = async (q, isMore = false) => {
    const tmdbLang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
    const nextPage = isMore ? page + 1 : 1;
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=${tmdbLang}&query=${q}&page=${nextPage}`);
      const data = await res.json();
      const newItems = data.results?.filter(i => i.poster_path) || [];
      if (isMore) { setSearchContent(prev => [...prev, ...newItems]); setPage(nextPage); }
      else { setSearchContent(newItems); setPage(1); }
    } catch (e) { console.error(e); }
  };

  const GridDisplay = ({ items, title, color = "#d4fd41", isLoading = false }) => (
    <section className="mb-16">
      <div className={`flex items-center gap-4 mb-8 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 style={{ color: color }} className="text-sm font-black uppercase tracking-[0.4em]">
          {title}
        </h3>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-12">
        {isLoading ? (
          [...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-white/5 rounded-[2rem] animate-pulse" />)
        ) : (
          items.map((m, idx) => (
            <motion.div 
              key={`${m.id}-${idx}`} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -10 }} 
              onClick={() => {setSelectedItem(m);}} 
              className="group cursor-pointer relative"
            >
              <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/5 mb-4 shadow-2xl">
                <img 
                  src={m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '/placeholder.jpg'} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  alt={m.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border border-white/10 shadow-xl">
                  <span className="text-[#d4fd41] text-xs">★</span>
                  <span className="text-white text-[11px] font-black">{m.vote_average?.toFixed(1)}</span>
                </div>
              </div>
              <h4 className={`text-sm font-black truncate px-2 leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {m.title || m.name}
              </h4>
              <p className={`text-[10px] font-bold text-gray-500 px-2 mt-1 tracking-wider ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                {(m.release_date || m.first_air_date || '').split('-')[0] || 'TBA'}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-12 overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        {/* Navigation Langues */}
        <div className={`fixed top-8 ${lang === 'ar' ? 'left-8' : 'right-8'} flex gap-3 z-[110]`}>
          {['ar', 'fr', 'en'].map(l => (
            <button key={l} onClick={() => setLang(l)} className={`text-[10px] font-black px-4 py-2 rounded-full border transition-all duration-300 ${lang === l ? 'bg-[#d4fd41] text-black border-[#d4fd41] scale-110 shadow-[0_0_20px_rgba(212,253,65,0.3)]' : 'text-gray-400 border-white/5 bg-black/40 backdrop-blur-xl'}`}>{l.toUpperCase()}</button>
          ))}
        </div>

        {/* Header Hero */}
        <header className="flex flex-col items-center mb-20 pt-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-row-reverse items-center gap-6 mb-4"
          >
            <span className="text-7xl md:text-9xl font-black tracking-tighter text-[#58339d]">ZAPIT</span>
            <span className="w-[2px] h-16 md:h-24 bg-gradient-to-b from-transparent via-gray-800 to-transparent" />
            <span className="text-7xl md:text-9xl font-black tracking-tighter text-[#d4fd41]">زابط</span>
          </motion.div>
          <p className="text-gray-500 tracking-[0.5em] uppercase text-[11px] font-black text-center opacity-70">{t.slogan}</p>
        </header>

        {/* Recherche et Filtres */}
        <div className="max-w-3xl mx-auto mb-20 space-y-6">
          <div className="flex p-1.5 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-sm">
            {['movie', 'tv'].map((k) => (
              <button key={k} onClick={() => {setType(k); setQuery('');}} className={`flex-1 py-4 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] transition-all duration-500 ${type === k ? 'bg-[#d4fd41] text-black shadow-lg shadow-[#d4fd41]/20' : 'text-gray-500 hover:text-white'}`}>{t.categories[k]}</button>
            ))}
          </div>
          <div className="relative group">
            <input 
              type="text" 
              value={query} 
              onChange={(e) => {setQuery(e.target.value); fetchSearch(e.target.value);}} 
              placeholder={t.placeholder} 
              className="w-full bg-white/5 border border-white/5 p-8 text-center outline-none focus:border-[#d4fd41]/50 text-2xl font-bold rounded-[3rem] transition-all group-hover:bg-white/[0.07]" 
            />
          </div>
        </div>

        {/* Affichage des Grilles */}
        {query ? (
          <GridDisplay items={searchContent} title={t.sections.search} />
        ) : (
          <>
            <GridDisplay items={content.local} title={t.sections.local} isLoading={loading} />
            <GridDisplay items={content.netflix} title={t.sections.netflix} color="#E50914" isLoading={loading} />
            {type === 'movie' && <GridDisplay items={content.cinema} title={t.sections.cinema} color="#ffffff" isLoading={loading} />}
            <GridDisplay items={content.prime} title={t.sections.prime} color="#00a8e1" isLoading={loading} />
            <GridDisplay items={content.global} title={t.sections.global} color="#58339d" isLoading={loading} />
          </>
        )}

        {/* Modal Détails (Sérieux : Scroll fluide et Infos complètes) */}
        <AnimatePresence>
          {selectedItem && (
            <DetailsModal 
              item={selectedItem} 
              onClose={() => setSelectedItem(null)} 
              lang={lang} 
              t={t} 
              region={userRegion}
              apiKey={API_KEY}
            />
          )}
        </AnimatePresence>

        {showTopBtn && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
            className={`fixed bottom-10 ${lang === 'ar' ? 'left-10' : 'right-10'} z-[100] bg-[#d4fd41] text-black w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center text-2xl border-4 border-black font-black hover:rotate-12 transition-transform`}
          >
            ↑
          </motion.button>
        )}
      </div>
    </main>
  );
}

// Sous-composant pour le Modal (Isolation de la logique Fetch Provider)
function DetailsModal({ item, onClose, lang, t, region, apiKey }) {
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/${item.media_type || 'movie'}/${item.id}/watch/providers?api_key=${apiKey}`)
      .then(r => r.json())
      .then(data => setProviders(data.results?.[region] || data.results?.US));
  }, [item, region, apiKey]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-[#0c0c0d] border border-white/5 max-w-6xl w-full rounded-[4rem] overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative shadow-[0_0_100px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-8 right-8 z-[210] bg-white/5 hover:bg-white/10 text-white w-12 h-12 rounded-full flex items-center justify-center border border-white/10 transition-colors">✕</button>
        
        <div className="w-full md:w-1/2 h-[400px] md:h-auto relative">
          <img src={`https://image.tmdb.org/t/p/original${item.poster_path}`} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0d] via-transparent to-transparent md:bg-gradient-to-r" />
        </div>

        <div className={`w-full md:w-1/2 p-10 md:p-20 overflow-y-auto ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">{item.title || item.name}</h2>
          <div className={`flex items-center gap-4 mb-10 text-sm font-bold ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            <span className="text-[#d4fd41] bg-[#d4fd41]/10 px-4 py-2 rounded-full">★ {item.vote_average?.toFixed(1)}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">{(item.release_date || item.first_air_date || '').split('-')[0]}</span>
          </div>
          
          <p className="text-gray-400 text-lg md:text-xl mb-12 font-light leading-relaxed italic">
            "{item.overview || t.noDesc}"
          </p>

          <div className="bg-white/[0.02] p-8 rounded-[3rem] border border-white/5">
            <h5 className="text-[11px] font-black uppercase text-[#d4fd41] mb-6 tracking-[0.3em]">{t.available}</h5>
            {providers?.flatrate ? (
              <div className={`flex flex-wrap gap-5 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                {providers.flatrate.map(p => (
                  <a key={p.provider_id} href={`https://www.google.com/search?q=${item.title || item.name}+watch+online`} target="_blank" className="hover:scale-110 transition-transform active:scale-95">
                    <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-16 h-16 rounded-[1.5rem] border border-white/10 shadow-2xl" alt={p.provider_name} title={p.provider_name} />
                  </a>
                ))}
              </div>
            ) : <p className="text-gray-500 text-[10px] uppercase font-black">{t.cinemaOnly}</p>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
