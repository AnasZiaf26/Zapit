"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

const translations = {
  ar: {
    title: "زابط", slogan: "دليلك الشامل للبث المباشر", placeholder: "ابحث عن فيلم أو مسلسل...",
    auth: { login: "تسجيل الدخول", signup: "إنشاء حساب", email: "البريد الإلكتروني", pass: "كلمة المرور", noAccount: "ليس لديك حساب؟", hasAccount: "لديك حساب بالفعل؟" },
    sections: { local: "أكثر شيوعاً في قطر 🇶🇦", global: "التوجهات العالمية", search: "نتائج البحث", netflix: "أفضل ما في Netflix", cinema: "في السينما", prime: "أفضل ما في Prime Video" },
    categories: { movie: "أفلام", tv: "مسلسلات" },
    user: { profile: "حسابي", favorites: "قائمتي", logout: "تسجيل الخروج" },
    noDesc: "لا يوجد وصف متاح حاليا.", cinemaOnly: "في السينما فقط"
  },
  fr: {
    title: "ZAPIT", slogan: "Votre guide ultime du streaming", placeholder: "Chercher un film, une série...",
    auth: { login: "Connexion", signup: "Inscription", email: "Email", pass: "Mot de passe", noAccount: "Pas de compte ?", hasAccount: "Déjà inscrit ?" },
    sections: { local: "Top au Qatar 🇶🇦", global: "Tendances Mondiales", search: "Résultats de recherche", netflix: "Le Top Netflix", cinema: "Au Cinéma", prime: "Le Top Prime Video" },
    categories: { movie: "Films", tv: "Séries" },
    user: { profile: "Mon Compte", favorites: "Ma Liste", logout: "Déconnexion" },
    noDesc: "Aucune description disponible.", cinemaOnly: "Au cinéma uniquement"
  },
  en: {
    title: "ZAPIT", slogan: "Your ultimate streaming guide", placeholder: "Search movies...",
    auth: { login: "Login", signup: "Sign Up", email: "Email", pass: "Password", noAccount: "No account?", hasAccount: "Already have an account?" },
    sections: { local: "Trending in Qatar 🇶🇦", global: "Global Trends", search: "Search Results", netflix: "Best of Netflix", cinema: "In Theaters", prime: "Best of Prime Video" },
    categories: { movie: "Movies", tv: "TV Shows" },
    user: { profile: "My Account", favorites: "My List", logout: "Logout" },
    noDesc: "No description available.", cinemaOnly: "In theaters only"
  }
};

export default function Home() {
  const [lang, setLang] = useState('en'); // Par défaut en anglais avant détection
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({ local: [], global: [], netflix: [], cinema: [], prime: [] });
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie'); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const t = translations[lang];
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  // --- DETECTION AUTO DE LA LANGUE SYSTEME ---
  useEffect(() => {
    const systemLang = navigator.language.split('-')[0];
    if (['ar', 'fr', 'en'].includes(systemLang)) {
      setLang(systemLang);
    }
    
    // Charger User et Favs
    const savedUser = localStorage.getItem('zapit_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    const savedFavs = localStorage.getItem('zapit_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  const fetchFullHome = useCallback(async () => {
    setLoading(true);
    const tmdbLang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
    const baseUrl = `https://api.themoviedb.org/3`;
    try {
      const endpoints = {
        local: `${baseUrl}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&sort_by=popularity.desc&watch_region=QA&with_watch_monetization_types=flatrate`,
        global: `${baseUrl}/trending/${type}/week?api_key=${API_KEY}&language=${tmdbLang}`,
        netflix: `${baseUrl}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_watch_providers=8&watch_region=QA`,
        prime: `${baseUrl}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_watch_providers=119&watch_region=QA`,
        cinema: `${baseUrl}/movie/now_playing?api_key=${API_KEY}&language=${tmdbLang}&region=QA`
      };
      const results = await Promise.all(Object.values(endpoints).map(url => fetch(url).then(r => r.json())));
      setContent({ local: results[0].results?.slice(0, 6), global: results[1].results?.slice(0, 6), netflix: results[2].results?.slice(0, 6), prime: results[3].results?.slice(0, 6), cinema: results[4].results?.slice(0, 6) });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [type, lang, API_KEY]);

  useEffect(() => { if (!query) fetchFullHome(); }, [fetchFullHome, query]);

  const handleLogout = () => {
    localStorage.removeItem('zapit_user');
    setUser(null);
    setIsProfileOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      
      <div className="max-w-7xl mx-auto">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/5">
            {['ar', 'fr', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${lang === l ? 'bg-[#d4fd41] text-black' : 'text-gray-500 hover:text-white'}`}>{l.toUpperCase()}</button>
            ))}
          </div>

          {user ? (
            <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl hover:scale-105 transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{user.name}</span>
              <div className="w-8 h-8 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full"></div>
            </button>
          ) : (
            <button onClick={() => setAuthMode('login')} className="bg-[#d4fd41] text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
              {t.auth.login}
            </button>
          )}
        </div>

        {/* Header Logo */}
        <header className="text-center mb-16 cursor-pointer" onClick={() => setQuery('')}>
          <div className="inline-flex flex-row-reverse items-center gap-4">
            <h1 className="text-6xl md:text-8xl font-black text-[#58339d]">ZAPIT</h1>
            <span className="w-[2px] h-12 bg-gray-800"></span>
            <h1 className="text-6xl md:text-8xl font-black text-[#d4fd41]">زابط</h1>
          </div>
          <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase mt-4 opacity-60">{t.slogan}</p>
        </header>

        {/* Search & Tabs */}
        <div className="max-w-2xl mx-auto mb-20 space-y-6">
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            {['movie', 'tv'].map((k) => (
              <button key={k} onClick={() => setType(k)} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${type === k ? 'bg-[#d4fd41] text-black' : 'text-gray-500'}`}>{t.categories[k]}</button>
            ))}
          </div>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.placeholder} className="w-full bg-white/5 border-b-2 border-white/5 p-6 text-center outline-none focus:border-[#d4fd41] text-xl font-bold rounded-3xl" />
        </div>

        {/* Content Grids */}
        {query ? (
           <GridDisplay items={content.global} title={t.sections.search} /> 
        ) : (
          <div className="space-y-24">
            <GridDisplay items={content.local} title={t.sections.local} isLoading={loading} />
            <GridDisplay items={content.netflix} title={t.sections.netflix} color="#E50914" />
            <GridDisplay items={content.prime} title={t.sections.prime} color="#00a8e1" />
            {type === 'movie' && <GridDisplay items={content.cinema} title={t.sections.cinema} color="#ffffff" />}
            <GridDisplay items={content.global} title={t.sections.global} color="#58339d" />
          </div>
        )}

        {/* Sidebar Profile & Auth Modals (Garder les composants précédents) */}
        {/* ... (Code des modales ici) */}
      </div>
    </main>
  );
}

function GridDisplay({ items, title, color = "#d4fd41", isLoading = false }) {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <h3 style={{ color }} className="text-[11px] font-black uppercase tracking-[0.4em] whitespace-nowrap">{title}</h3>
        <div className="h-[1px] w-full bg-white/5"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
        {isLoading ? [...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-white/5 rounded-[2rem] animate-pulse" />) :
          items?.map(m => (
            <motion.div key={m.id} whileHover={{ y: -10 }} className="cursor-pointer group">
              <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/5 mb-4 shadow-xl">
                <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-[12px] font-black truncate px-2">{m.title || m.name}</p>
              <p className="text-[10px] text-gray-500 px-2 font-bold">{m.release_date?.split('-')[0] || m.first_air_date?.split('-')[0]}</p>
            </motion.div>
          ))
        }
      </div>
    </section>
  );
}
