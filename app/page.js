"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

const translations = {
  ar: {
    title: "زابط", slogan: "دليلك الشامل للبث المباشر", placeholder: "ابحث عن فيلم أو مسلسل...",
    auth: { login: "تسجيل الدخول", signup: "إنشاء حساب", email: "البريد الإلكتروني", pass: "كلمة المرور", noAccount: "ليس لديك حساب؟", hasAccount: "لديك حساب بالفعل؟", submit: "تأكيد" },
    sections: { local: "أكثر شيوعاً في قطر 🇶🇦", search: "نتائج البحث", netflix: "أفضل ما في Netflix", cinema: "في السينما", prime: "أفضل ما في Prime Video" },
    categories: { movie: "أفلام", tv: "مسلسلات" },
    user: { profile: "حسابي", logout: "تسجيل الخروج", accounts: "الحسابات المسجلة" },
  },
  fr: {
    title: "ZAPIT", slogan: "Votre guide ultime du streaming", placeholder: "Chercher un film, une série...",
    auth: { login: "Connexion", signup: "Inscription", email: "Email", pass: "Mot de passe", noAccount: "Pas de compte ?", hasAccount: "Déjà inscrit ?", submit: "Valider" },
    sections: { local: "Top au Qatar 🇶🇦", search: "Résultats", netflix: "Top Netflix", cinema: "Au Cinéma", prime: "Top Prime Video" },
    categories: { movie: "Films", tv: "Séries" },
    user: { profile: "Mon Compte", logout: "Déconnexion", accounts: "Comptes créés" },
  },
  en: {
    title: "ZAPIT", slogan: "Your ultimate streaming guide", placeholder: "Search movies...",
    auth: { login: "Login", signup: "Sign Up", email: "Email", pass: "Password", noAccount: "No account?", hasAccount: "Already registered?", submit: "Submit" },
    sections: { local: "Trending in Qatar 🇶🇦", search: "Results", netflix: "Netflix Top", cinema: "In Theaters", prime: "Prime Video Top" },
    categories: { movie: "Movies", tv: "TV Shows" },
    user: { profile: "My Account", logout: "Logout", accounts: "Created Accounts" },
  }
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('fr'); 
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [authMode, setAuthMode] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({ local: [], netflix: [], cinema: [], prime: [] });
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie'); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const t = translations[lang];

  // 1. Montage et Détection Auto
  useEffect(() => {
    const systemLang = navigator.language.split('-')[0];
    if (['ar', 'fr', 'en'].includes(systemLang)) setLang(systemLang);
    
    const savedUser = localStorage.getItem('zapit_current_user');
    const savedAccounts = localStorage.getItem('zapit_accounts');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedAccounts) setAllUsers(JSON.parse(savedAccounts));
    
    setMounted(true);
  }, []);

  // 2. Gestion Auth (Connexion + Inscription)
  const handleAuth = (e) => {
    e.preventDefault();
    const accounts = JSON.parse(localStorage.getItem('zapit_accounts') || '[]');
    
    if (authMode === 'signup') {
      if (accounts.find(u => u.email === formData.email)) return alert("Compte déjà existant");
      const newUser = { email: formData.email, name: formData.email.split('@')[0], date: new Date().toLocaleDateString() };
      const updated = [...accounts, newUser];
      localStorage.setItem('zapit_accounts', JSON.stringify(updated));
      setAllUsers(updated);
      setUser(newUser);
      localStorage.setItem('zapit_current_user', JSON.stringify(newUser));
    } else {
      const found = accounts.find(u => u.email === formData.email);
      if (!found) return alert("Compte introuvable");
      setUser(found);
      localStorage.setItem('zapit_current_user', JSON.stringify(found));
    }
    setAuthMode(null);
    setFormData({ email: '', password: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('zapit_current_user');
    setUser(null);
    setIsProfileOpen(false);
  };

  // 3. Récupération des films
  const fetchContent = useCallback(async () => {
    if (!API_KEY || !mounted) return;
    setLoading(true);
    const tmdbLang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
    const base = `https://api.themoviedb.org/3`;
    try {
      const urls = {
        local: `${base}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&watch_region=QA&with_watch_monetization_types=flatrate`,
        netflix: `${base}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_watch_providers=8&watch_region=QA`,
        prime: `${base}/discover/${type}?api_key=${API_KEY}&language=${tmdbLang}&with_watch_providers=119&watch_region=QA`,
        cinema: `${base}/movie/now_playing?api_key=${API_KEY}&language=${tmdbLang}&region=QA`
      };
      const res = await Promise.all(Object.values(urls).map(u => fetch(u).then(r => r.json())));
      setContent({ local: res[0].results?.slice(0,6), netflix: res[1].results?.slice(0,6), prime: res[2].results?.slice(0,6), cinema: res[3].results?.slice(0,6) });
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [type, lang, API_KEY, mounted]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-10 overflow-x-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-16 relative z-[100]">
          <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/5">
            {['ar', 'fr', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${lang === l ? 'bg-[#d4fd41] text-black' : 'text-gray-500'}`}>{l.toUpperCase()}</button>
            ))}
          </div>

          {user ? (
            <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl hover:bg-white/15 transition-all">
              <span className="text-[10px] font-black uppercase hidden md:block">{user.name}</span>
              <div className="w-8 h-8 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full shadow-[0_0_15px_rgba(212,253,65,0.2)]"></div>
            </button>
          ) : (
            <div className="flex gap-4">
              <button onClick={() => setAuthMode('login')} className="text-[10px] font-black uppercase hover:text-[#d4fd41] transition-colors">{t.auth.login}</button>
              <button onClick={() => setAuthMode('signup')} className="bg-[#d4fd41] text-black px-5 py-2 rounded-xl text-[10px] font-black uppercase">{t.auth.signup}</button>
            </div>
          )}
        </div>

        {/* LOGO */}
        <header className="text-center mb-16 cursor-pointer group" onClick={() => setQuery('')}>
          <div className="inline-flex flex-row-reverse items-center gap-4 group-hover:scale-105 transition-transform duration-500">
            <h1 className="text-6xl md:text-8xl font-black text-[#58339d]">ZAPIT</h1>
            <span className="w-[2px] h-12 bg-gray-800"></span>
            <h1 className="text-6xl md:text-8xl font-black text-[#d4fd41]">زابط</h1>
          </div>
          <p className="text-gray-500 text-[10px] font-black tracking-[0.4em] uppercase mt-4 opacity-50">{t.slogan}</p>
        </header>

        {/* SEARCH & TABS */}
        <div className="max-w-2xl mx-auto mb-20 space-y-8">
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
            {['movie', 'tv'].map((k) => (
              <button key={k} onClick={() => setType(k)} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${type === k ? 'bg-[#d4fd41] text-black' : 'text-gray-500'}`}>{t.categories[k]}</button>
            ))}
          </div>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.placeholder} className="w-full bg-white/5 border-b-2 border-white/10 p-6 text-center outline-none focus:border-[#d4fd41] text-xl font-bold rounded-3xl transition-all" />
        </div>

        {/* GRIDS */}
        <div className="space-y-24">
          <GridDisplay items={content.local} title={t.sections.local} isLoading={loading} />
          <GridDisplay items={content.netflix} title={t.sections.netflix} color="#E50914" />
          <GridDisplay items={content.prime} title={t.sections.prime} color="#00a8e1" />
          {type === 'movie' && <GridDisplay items={content.cinema} title={t.sections.cinema} color="#ffffff" />}
        </div>
      </div>

      {/* --- MODALE AUTH --- */}
      <AnimatePresence>
        {authMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
             <motion.div initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} className="bg-[#0c0c0d] border border-white/10 p-10 rounded-[3rem] max-w-md w-full shadow-2xl">
                <h2 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter">{authMode === 'login' ? t.auth.login : t.auth.signup}</h2>
                <form onSubmit={handleAuth} className="space-y-4">
                  <input type="email" required placeholder={t.auth.email} className="w-full bg-white/5 p-4 rounded-2xl outline-none border border-white/5 focus:border-[#d4fd41]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input type="password" required placeholder={t.auth.pass} className="w-full bg-white/5 p-4 rounded-2xl outline-none border border-white/5 focus:border-[#d4fd41]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  <button className="w-full py-4 bg-[#d4fd41] text-black font-black uppercase rounded-2xl shadow-lg shadow-[#d4fd41]/10">{t.auth.submit}</button>
                </form>
                <p className="text-center mt-6 text-[10px] text-gray-500 uppercase font-black">
                  {authMode === 'login' ? t.auth.noAccount : t.auth.hasAccount} 
                  <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[#d4fd41] ml-2 underline">{authMode === 'login' ? t.auth.signup : t.auth.login}</button>
                </p>
                <button onClick={() => setAuthMode(null)} className="w-full mt-8 text-gray-600 text-[10px] font-black">ANNULER</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR MON COMPTE --- */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div initial={{ x: lang === 'ar' ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: lang === 'ar' ? '-100%' : '100%' }} className={`fixed top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} w-full md:w-[400px] h-full bg-[#0c0c0d] z-[2000] p-10 border-white/10 shadow-2xl overflow-y-auto flex flex-col`}>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-xl font-black tracking-widest text-[#d4fd41] italic">{t.user.profile}</h2>
              <button onClick={() => setIsProfileOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">✕</button>
            </div>

            <div className="flex-1">
              <div className="mb-12 p-8 bg-white/5 rounded-[2.5rem] text-center border border-white/5">
                <div className="w-20 h-20 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full mx-auto mb-4 shadow-xl"></div>
                <p className="font-black text-xl">{user?.name}</p>
                <p className="text-[10px] text-gray-500 font-bold">{user?.email}</p>
              </div>

              {/* LISTE DES COMPTES (ADMIN VIEW) */}
              <div className="mb-10">
                <h3 className="text-[10px] font-black text-gray-500 mb-6 tracking-[0.3em] uppercase">{t.user.accounts} ({allUsers.length})</h3>
                <div className="space-y-3">
                  {allUsers.map((u, i) => (
                    <div key={i} className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black">{u.name}</span>
                        <span className="text-[9px] text-gray-600">{u.email}</span>
                      </div>
                      <span className="text-[8px] bg-white/5 px-2 py-1 rounded-md text-gray-500">{u.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleLogout} className="w-full py-5 bg-red-500/10 text-red-500 font-black rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all uppercase text-[10px] tracking-widest">{t.user.logout}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function GridDisplay({ items, title, color = "#d4fd41", isLoading = false }) {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <h3 style={{ color }} className="text-[10px] font-black tracking-[0.4em] whitespace-nowrap uppercase">{title}</h3>
        <div className="h-[1px] w-full bg-white/5"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
        {isLoading ? [...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-white/5 rounded-[2.5rem] animate-pulse" />) :
          items?.map(m => (
            <motion.div key={m.id} whileHover={{ y: -8 }} className="cursor-pointer group">
              <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/5 transition-all group-hover:border-[#d4fd41]/30 group-hover:shadow-[0_0_30px_rgba(212,253,65,0.1)]">
                <img src={`https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              </div>
              <div className="mt-4 px-2">
                <p className="text-[12px] font-black truncate">{m.title || m.name}</p>
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">{m.release_date?.split('-')[0] || m.first_air_date?.split('-')[0]}</p>
              </div>
            </motion.div>
          ))
        }
      </div>
    </section>
  );
}
