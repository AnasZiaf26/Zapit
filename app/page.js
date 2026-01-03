"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

// On garde les traductions... (incluses dans le code final ci-dessous)

export default function Home() {
  const [mounted, setMounted] = useState(false); // Pour éviter le flash vide au chargement
  const [lang, setLang] = useState('fr'); 
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]); // Pour voir les comptes créés
  const [authMode, setAuthMode] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({ local: [], global: [], netflix: [], cinema: [], prime: [] });
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie'); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // 1. Initialisation au montage
  useEffect(() => {
    // Détection langue
    const systemLang = navigator.language.split('-')[0];
    if (['ar', 'fr', 'en'].includes(systemLang)) setLang(systemLang);
    
    // Charger User et la liste globale des comptes
    const savedUser = localStorage.getItem('zapit_current_user');
    const savedAllUsers = localStorage.getItem('zapit_accounts');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedAllUsers) setAllUsers(JSON.parse(savedAllUsers));
    
    setMounted(true);
  }, []);

  // 2. Login / Signup sans refresh
  const handleAuth = (e) => {
    e.preventDefault();
    const newUser = { 
      email: formData.email, 
      name: formData.email.split('@')[0],
      joined: new Date().toLocaleDateString()
    };

    // Mettre à jour la liste globale des comptes
    const updatedAccounts = [...allUsers, newUser];
    setAllUsers(updatedAccounts);
    localStorage.setItem('zapit_accounts', JSON.stringify(updatedAccounts));

    // Connecter l'utilisateur
    setUser(newUser);
    localStorage.setItem('zapit_current_user', JSON.stringify(newUser));
    
    // Fermer proprement
    setAuthMode(null);
    setFormData({ email: '', password: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('zapit_current_user');
    setUser(null);
    setIsProfileOpen(false);
  };

  const fetchFullHome = useCallback(async () => {
    if (!API_KEY) return;
    setLoading(true);
    const tmdbLang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
    try {
      const endpoints = {
        local: `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&watch_region=QA&with_watch_monetization_types=flatrate`,
        netflix: `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_watch_providers=8&watch_region=QA`,
        prime: `https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_watch_providers=119&watch_region=QA`,
        cinema: `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=${tmdbLang}&region=QA`
      };
      const results = await Promise.all(Object.values(endpoints).map(url => fetch(url).then(r => r.json())));
      setContent({ local: results[0].results?.slice(0, 6), netflix: results[1].results?.slice(0, 6), prime: results[2].results?.slice(0, 6), cinema: results[3].results?.slice(0, 6) });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [type, lang, API_KEY]);

  useEffect(() => { if (mounted) fetchFullHome(); }, [fetchFullHome, mounted]);

  // Si pas encore monté, on affiche un loader minimaliste pour éviter le flash
  if (!mounted) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#d4fd41] font-black">ZAPIT...</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-10 relative overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* HEADER NAVIGATION */}
      <div className="max-w-7xl mx-auto relative z-[50]">
        <div className="flex justify-between items-center mb-12">
          <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/5">
             {['ar', 'fr', 'en'].map(l => (
               <button key={l} onClick={() => setLang(l)} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${lang === l ? 'bg-[#d4fd41] text-black' : 'text-gray-500'}`}>{l.toUpperCase()}</button>
             ))}
          </div>

          {user ? (
            <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl hover:bg-white/10 transition-all z-[60]">
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{user.name}</span>
              <div className="w-8 h-8 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full"></div>
            </button>
          ) : (
            <button onClick={() => setAuthMode('login')} className="bg-[#d4fd41] text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
              CONNEXION
            </button>
          )}
        </div>

        {/* LOGO & SEARCH */}
        <header className="text-center mb-16 cursor-pointer" onClick={() => setQuery('')}>
          <div className="inline-flex flex-row-reverse items-center gap-4">
            <h1 className="text-6xl md:text-8xl font-black text-[#58339d]">ZAPIT</h1>
            <span className="w-[2px] h-12 bg-gray-800"></span>
            <h1 className="text-6xl md:text-8xl font-black text-[#d4fd41]">زابط</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto mb-20">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Chercher..." className="w-full bg-white/5 border-b-2 border-white/10 p-6 text-center outline-none focus:border-[#d4fd41] text-xl font-bold rounded-3xl" />
        </div>

        {/* GRIDS */}
        <div className="space-y-20">
          <GridDisplay items={content.local} title="TOP QATAR 🇶🇦" isLoading={loading} />
          <GridDisplay items={content.netflix} title="NETFLIX" color="#E50914" />
          <GridDisplay items={content.prime} title="PRIME VIDEO" color="#00a8e1" />
        </div>
      </div>

      {/* --- MODALE AUTH --- */}
      <AnimatePresence>
        {authMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
             <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-[#0c0c0d] border border-white/10 p-10 rounded-[3rem] max-w-md w-full">
                <h2 className="text-3xl font-black mb-8 text-center uppercase">{authMode}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                  <input type="email" required placeholder="Email" className="w-full bg-white/5 p-4 rounded-2xl outline-none border border-transparent focus:border-[#d4fd41]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input type="password" required placeholder="Password" className="w-full bg-white/5 p-4 rounded-2xl outline-none border border-transparent focus:border-[#d4fd41]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <button className="w-full py-4 bg-[#d4fd41] text-black font-black uppercase rounded-2xl">Valider</button>
                </form>
                <button onClick={() => setAuthMode(null)} className="w-full mt-4 text-gray-500 text-xs">Annuler</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR MON COMPTE --- */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed top-0 right-0 w-full md:w-[400px] h-full bg-[#0c0c0d] z-[2000] p-10 border-l border-white/5 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black tracking-widest text-[#d4fd41]">MON COMPTE</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-2xl">✕</button>
            </div>

            <div className="mb-12 p-6 bg-white/5 rounded-3xl text-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full mx-auto mb-4"></div>
              <p className="font-black">{user?.name}</p>
              <p className="text-[10px] text-gray-500">{user?.email}</p>
            </div>

            {/* SECTION ADMIN : VOIR LES COMPTES */}
            <div className="mb-10">
              <h3 className="text-[10px] font-black text-gray-500 mb-4 tracking-[0.3em]">COMPTES CRÉÉS ({allUsers.length})</h3>
              <div className="space-y-2">
                {allUsers.map((u, i) => (
                  <div key={i} className="bg-white/[0.02] p-3 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-bold">{u.email}</span>
                    <span className="text-[8px] text-gray-600 italic">{u.joined}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleLogout} className="w-full py-4 bg-red-500/10 text-red-500 font-black rounded-2xl">DECONNEXION</button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function GridDisplay({ items, title, color = "#d4fd41", isLoading = false }) {
  return (
    <section>
      <h3 style={{ color }} className="text-[10px] font-black mb-6 tracking-[0.4em]">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {isLoading ? [...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-white/5 rounded-[2rem] animate-pulse" />) :
          items?.map(m => (
            <motion.div key={m.id} whileHover={{ y: -5 }} className="cursor-pointer">
              <div className="aspect-[2/3] rounded-[2rem] overflow-hidden bg-white/5 border border-white/5">
                <img src={`https://image.tmdb.org/t/p/w400${m.poster_path}`} className="w-full h-full object-cover" />
              </div>
              <p className="mt-3 text-[11px] font-bold truncate">{m.title || m.name}</p>
            </motion.div>
          ))
        }
      </div>
    </section>
  );
}
