"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

const translations = {
  ar: {
    title: "زابط", slogan: "دليلك الشامل للبث المباشر", placeholder: "ابحث عن فيلم أو مسلسل...", 
    sections: { local: "أكثر شيوعاً في قطر 🇶🇦", global: "التوجهات العالمية", search: "نتائج البحث", genre: "أفضل الأفلام", netflix: "أفضل ما في Netflix", cinema: "يعرض حالياً في السينما", prime: "أفضل ما in Prime Video" },
    categories: { movie: "أفلام", tv: "مسلسلات" },
    user: { profile: "حسابي", favorites: "قائمتي", settings: "الإعدادات", logout: "تسجيل الخروج" },
    available: "متوفر على :", close: "إغلاق", more: "عرض المزيد", noDesc: "لا يوجد وصف متاح حاليا.", cinemaOnly: "في السينما فقط"
  },
  fr: {
    title: "ZAPIT", slogan: "Votre guide ultime du streaming", placeholder: "Chercher un film, une série...", 
    sections: { local: "Top au Qatar 🇶🇦", global: "Tendances Mondiales", search: "Résultats de recherche", genre: "Les meilleurs films", netflix: "Le Top Netflix", cinema: "Actuellement au Cinéma", prime: "Le Top Prime Video" },
    categories: { movie: "Films", tv: "Séries" },
    user: { profile: "Mon Compte", favorites: "Ma Liste", settings: "Paramètres", logout: "Déconnexion" },
    available: "Disponible sur :", close: "Fermer", more: "Voir plus", noDesc: "Aucune description disponible.", cinemaOnly: "Au cinéma uniquement"
  },
  en: {
    title: "ZAPIT", slogan: "Your ultimate streaming guide", placeholder: "Search movies, shows...", 
    sections: { local: "Trending in Qatar 🇶🇦", global: "Global Trends", search: "Search Results", genre: "Top Movies", netflix: "Best of Netflix", cinema: "In Theaters Now", prime: "Best of Prime Video" },
    categories: { movie: "Movies", tv: "TV Shows" },
    user: { profile: "My Account", favorites: "My List", settings: "Settings", logout: "Logout" },
    available: "Watch on:", close: "Close", more: "See more", noDesc: "No description available.", cinemaOnly: "In theaters only"
  }
};

const genreList = {
  ar: [{ id: 28, name: "أكشن" }, { id: 35, name: "كوميدي" }, { id: 27, name: "رعب" }, { id: 10749, name: "رومانسية" }, { id: 878, name: "خيال علمي" }],
  fr: [{ id: 28, name: "Action" }, { id: 35, name: "Comédie" }, { id: 27, name: "Horreur" }, { id: 10749, name: "Romance" }, { id: 878, name: "Sci-Fi" }],
  en: [{ id: 28, name: "Action" }, { id: 35, name: "Comedy" }, { id: 27, name: "Horror" }, { id: 10749, name: "Romance" }, { id: 878, name: "Sci-Fi" }]
};

export default function Home() {
  const [lang, setLang] = useState('ar'); 
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({ local: [], global: [], netflix: [], cinema: [], prime: [] });
  const [searchContent, setSearchContent] = useState([]);
  const [genreContent, setGenreContent] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie'); 
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userRegion, setUserRegion] = useState('QA');

  const t = translations[lang];
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  const resetHome = () => { setQuery(''); setSelectedGenre(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const fetchByGenre = async (genreId) => {
    setLoading(true);
    const tmdbLang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
    try {
      const res = await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_genres=${genreId}`);
      const data = await res.json();
      setGenreContent(data.results || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchFullHome = useCallback(async () => {
    setLoading(true);
    const tmdbLang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
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
      setContent({ local: results[0].results?.slice(0, 6), global: results[1].results?.slice(0, 6), netflix: results[2].results?.slice(0, 6), prime: results[3].results?.slice(0, 6), cinema: results[4].results?.slice(0, 6) });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [type, lang, userRegion, API_KEY]);

  useEffect(() => { if (!query && !selectedGenre) fetchFullHome(); }, [fetchFullHome, query, selectedGenre]);

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <Script id="ga-script">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}');`}</Script>

      <div className="max-w-7xl mx-auto">
        {/* Barre du haut : Langues + Profil */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-2">
            {['ar', 'fr', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-full text-[10px] font-black border ${lang === l ? 'bg-[#d4fd41] text-black border-[#d4fd41]' : 'border-white/10 text-gray-500'}`}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl hover:bg-white/10 transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{t.user.profile}</span>
            <div className="w-8 h-8 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full shadow-lg"></div>
          </button>
        </div>

        {/* Header cliquable */}
        <header className="text-center mb-16 cursor-pointer group" onClick={resetHome}>
          <div className="inline-flex flex-row-reverse items-center gap-4 group-hover:scale-105 transition-transform">
            <h1 className="text-5xl md:text-7xl font-black text-[#58339d]">ZAPIT</h1>
            <span className="text-gray-800 text-4xl md:text-6xl">|</span>
            <h1 className="text-5xl md:text-7xl font-black text-[#d4fd41]">زابط</h1>
          </div>
          <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase mt-4">{t.slogan}</p>
        </header>

        {/* Recherche et Filtres */}
        <div className="max-w-2xl mx-auto mb-16 space-y-6">
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            {['movie', 'tv'].map((k) => (
              <button key={k} onClick={() => {setType(k); resetHome();}} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${type === k ? 'bg-[#d4fd41] text-black' : 'text-gray-500'}`}>{t.categories[k]}</button>
            ))}
          </div>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.placeholder} className="w-full bg-white/5 border-b-2 border-white/5 p-6 text-center outline-none focus:border-[#d4fd41] text-xl font-bold rounded-3xl" />
          
          {/* Les Genres réintégrés */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {genreList[lang].map(g => (
              <button key={g.id} onClick={() => {setSelectedGenre(g.id); fetchByGenre(g.id);}} className={`px-4 py-2 rounded-full text-[9px] font-black uppercase border transition-all ${selectedGenre === g.id ? 'bg-[#d4fd41] text-black border-[#d4fd41]' : 'border-white/5 text-gray-500 hover:border-white/20'}`}>{g.name}</button>
            ))}
          </div>
        </div>

        {/* Affichage des grilles */}
        {selectedGenre && !query ? (
          <GridDisplay items={genreContent} title={`${genreList[lang].find(g => g.id === selectedGenre)?.name} ${t.sections.genre}`} />
        ) : (
          <>
            <GridDisplay items={content.local} title={t.sections.local} isLoading={loading} />
            <GridDisplay items={content.netflix} title={t.sections.netflix} color="#E50914" />
            {type === 'movie' && <GridDisplay items={content.cinema} title={t.sections.cinema} color="#ffffff" />}
          </>
        )}

        {/* Sidebar : Mon Compte */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div initial={{ x: lang === 'ar' ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: lang === 'ar' ? '-100%' : '100%' }} className={`fixed top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} w-full md:w-[400px] h-full bg-[#0c0c0d] z-[300] shadow-2xl p-8 border-l border-white/5`}>
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-black">{t.user.profile}</h2>
                <button onClick={() => setIsProfileOpen(false)} className="text-2xl">✕</button>
              </div>
              
              <div className="flex flex-col items-center mb-10">
                <div className="w-24 h-24 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full mb-4 shadow-xl"></div>
                <h3 className="font-bold">Anas Ziaf</h3>
                <p className="text-[10px] text-gray-500 uppercase font-black">Qatar, Doha 🇶🇦</p>
              </div>

              <div className="space-y-4">
                <button className="w-full text-right p-4 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest">{t.user.favorites}</span>
                  <span className="text-[#d4fd41]">♥</span>
                </button>
                <button className="w-full text-right p-4 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest">{t.user.settings}</span>
                  <span className="text-gray-500">⚙</span>
                </button>
                <button className="w-full text-right p-4 rounded-2xl bg-red-500/10 text-red-500 mt-10 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest">{t.user.logout}</span>
                  <span>⏻</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// Composant Grille réutilisable
function GridDisplay({ items, title, color = "#d4fd41", isLoading = false }) {
  return (
    <div className="mb-20">
      <h3 style={{ color }} className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 border-b border-white/5 pb-2 inline-block">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {isLoading ? [...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-white/5 rounded-3xl animate-pulse" />) :
          items?.map(m => (
            <motion.div key={m.id} whileHover={{ y: -5 }} className="cursor-pointer group">
              <div className="aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 mb-3">
                <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <p className="text-[11px] font-bold truncate">{m.title || m.name}</p>
            </motion.div>
          ))
        }
      </div>
    </div>
  );
}
