"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

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

export default function Home() {
  const [lang, setLang] = useState('ar'); 
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({ local: [], global: [], netflix: [], cinema: [], prime: [] });
  const [searchContent, setSearchContent] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie'); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [userRegion, setUserRegion] = useState('QA');

  const t = translations[lang];
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  // --- GOOGLE ANALYTICS TRACKING ---
  const trackEvent = (action, params) => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag('event', action, params);
    }
  };

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (['ar', 'fr', 'en'].includes(browserLang)) setLang(browserLang);
    
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
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [type, lang, userRegion, API_KEY]);

  useEffect(() => {
    if (!query) fetchFullHome();
  }, [fetchFullHome, query]);

  const fetchSearch = async (q) => {
    if (!q) return;
    const tmdbLang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=${tmdbLang}&query=${q}`);
      const data = await res.json();
      setSearchContent(data.results?.filter(i => i.poster_path) || []);
      trackEvent('search', { search_term: q });
    } catch (e) { console.error(e); }
  };

  const GridDisplay = ({ items, title, color = "#d4fd41", isLoading = false }) => (
    <section className="mb-20">
      <div className={`flex items-center gap-4 mb-8 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
        <h3 style={{ color: color }} className="text-sm font-black uppercase tracking-[0.4em]">{title}</h3>
        <div className="h-[1px] flex-1 bg-white/10"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {isLoading ? [...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-white/5 rounded-[2.5rem] animate-pulse" />) :
          items.map((m, idx) => (
            <motion.div key={m.id} whileHover={{ y: -10 }} onClick={() => { 
              setSelectedItem(m); 
              trackEvent('view_item', { item_name: m.title || m.name });
            }} className="group cursor-pointer">
              <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/5 mb-4 shadow-2xl">
                <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-2xl border border-white/10 text-[11px] font-black">
                  <span className="text-[#d4fd41]">★</span> {m.vote_average?.toFixed(1)}
                </div>
              </div>
              <h4 className={`text-sm font-black truncate px-2 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>{m.title || m.name}</h4>
            </motion.div>
          ))
        }
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Script Google Analytics */}
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <Script id="ga-script" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>

      <div className="max-w-7xl mx-auto">
        <div className={`fixed top-8 ${lang === 'ar' ? 'left-8' : 'right-8'} flex gap-3 z-[110]`}>
          {['ar', 'fr', 'en'].map(l => (
            <button key={l} onClick={() => setLang(l)} className={`text-[10px] font-black px-4 py-2 rounded-full border transition-all ${lang === l ? 'bg-[#d4fd41] text-black border-[#d4fd41]' : 'text-gray-400 border-white/5 bg-black/40 backdrop-blur-xl'}`}>{l.toUpperCase()}</button>
          ))}
        </div>

        <header className="flex flex-col items-center mb-20 pt-16 cursor-pointer" onClick={() => setQuery('')}>
          <div className="flex flex-row-reverse items-center gap-6">
            <span className="text-7xl md:text-9xl font-black text-[#58339d]">ZAPIT</span>
            <span className="text-gray-800 text-6xl md:text-8xl font-thin">|</span>
            <span className="text-7xl md:text-9xl font-black text-[#d4fd41]">زابط</span>
          </div>
          <p className="text-gray-500 tracking-[0.5em] uppercase text-[11px] font-black mt-4">{t.slogan}</p>
        </header>

        <div className="max-w-2xl mx-auto mb-20 space-y-6">
          <div className="flex p-1.5 bg-white/5 rounded-[2rem] border border-white/5">
            {['movie', 'tv'].map((k) => (
              <button key={k} onClick={() => {setType(k); setQuery('');}} className={`flex-1 py-4 rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest transition-all ${type === k ? 'bg-[#d4fd41] text-black' : 'text-gray-500'}`}>{t.categories[k]}</button>
            ))}
          </div>
          <input type="text" value={query} onChange={(e) => {setQuery(e.target.value); fetchSearch(e.target.value);}} placeholder={t.placeholder} className="w-full bg-white/5 border border-white/5 p-8 text-center outline-none focus:border-[#d4fd41]/50 text-2xl font-bold rounded-[3rem]" />
        </div>

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

        <AnimatePresence>
          {selectedItem && (
            <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} lang={lang} t={t} region={userRegion} apiKey={API_KEY} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function DetailsModal({ item, onClose, lang, t, region, apiKey }) {
  const [providers, setProviders] = useState(null);
  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/${item.media_type || 'movie'}/${item.id}/watch/providers?api_key=${apiKey}`)
      .then(r => r.json()).then(data => setProviders(data.results?.[region] || data.results?.US));
  }, [item, region, apiKey]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#0c0c0d] border border-white/10 max-w-6xl w-full rounded-[4rem] overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-8 right-8 z-[210] bg-black/50 text-white w-12 h-12 rounded-full flex items-center justify-center border border-white/10">✕</button>
        <div className="w-full md:w-1/2"><img src={`https://image.tmdb.org/t/p/original${item.poster_path}`} className="w-full h-full object-cover" alt="" /></div>
        <div className={`w-full md:w-1/2 p-12 overflow-y-auto ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <h2 className="text-5xl font-black mb-6">{item.title || item.name}</h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed font-light">{item.overview || t.noDesc}</p>
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
            <h5 className="text-[11px] font-black uppercase text-[#d4fd41] mb-6">{t.available}</h5>
            {providers?.flatrate ? (
              <div className={`flex flex-wrap gap-4 ${lang === 'ar' ? 'justify-end' : ''}`}>
                {providers.flatrate.map(p => <img key={p.provider_id} src={`https://image.tmdb.org/t/p/original${p.logo_path}`} className="w-14 h-14 rounded-2xl border border-white/10" alt="" />)}
              </div>
            ) : <p className="text-gray-500 text-[10px] font-black uppercase">{t.cinemaOnly}</p>}
          </div>
          <button onClick={onClose} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase mt-8">{t.close}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
