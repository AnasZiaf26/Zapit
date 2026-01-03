"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Script from 'next/script';

const translations = {
  ar: {
    title: "زابط", slogan: "دليلك الشامل للبث المباشر",
    auth: { login: "تسجيل الدخول", signup: "إنشاء حساب", email: "البريد الإلكتروني", pass: "كلمة المرور", noAccount: "ليس لديك حساب؟", hasAccount: "لديك حساب بالفعل؟" },
    user: { profile: "حسابي", favorites: "قائمتي", logout: "تسجيل الخروج" },
    // ... (garder les autres traductions)
  },
  fr: {
    title: "ZAPIT", slogan: "Votre guide ultime du streaming",
    auth: { login: "Connexion", signup: "Inscription", email: "Email", pass: "Mot de passe", noAccount: "Pas de compte ?", hasAccount: "Déjà inscrit ?" },
    user: { profile: "Mon Compte", favorites: "Ma Liste", logout: "Déconnexion" },
    // ...
  }
};

export default function Home() {
  const [lang, setLang] = useState('fr'); 
  const [user, setUser] = useState(null); // Stocke l'utilisateur connecté
  const [authMode, setAuthMode] = useState(null); // 'login' ou 'signup'
  const [formData, setFormData] = useState({ email: '', password: '' });
  
  const [favorites, setFavorites] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const t = translations[lang];

  // 1. Charger l'utilisateur au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('zapit_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedFavs = localStorage.getItem('zapit_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  // 2. Fonctions d'Authentification
  const handleAuth = (e) => {
    e.preventDefault();
    if (authMode === 'signup') {
      // Simule une inscription
      const newUser = { email: formData.email, name: formData.email.split('@')[0] };
      localStorage.setItem('zapit_user', JSON.stringify(newUser));
      setUser(newUser);
    } else {
      // Simule une connexion
      const mockUser = { email: formData.email, name: formData.email.split('@')[0] };
      localStorage.setItem('zapit_user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
    setAuthMode(null);
    setFormData({ email: '', password: '' });
  };

  const logout = () => {
    localStorage.removeItem('zapit_user');
    setUser(null);
    setIsProfileOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        
        {/* Barre de Navigation Supérieure */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-2"> {/* Langues */} </div>

          {user ? (
            <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl hover:bg-white/10 transition-all">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#d4fd41]">{user.name}</p>
                <p className="text-[8px] text-gray-500">{t.user.profile}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full border border-white/10"></div>
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => setAuthMode('login')} className="text-[10px] font-black uppercase tracking-widest px-5 py-2 hover:text-[#d4fd41] transition-colors">
                {t.auth.login}
              </button>
              <button onClick={() => setAuthMode('signup')} className="text-[10px] font-black uppercase tracking-widest bg-[#d4fd41] text-black px-6 py-2 rounded-xl">
                {t.auth.signup}
              </button>
            </div>
          )}
        </div>

        {/* --- MODALE D'AUTHENTIFICATION --- */}
        <AnimatePresence>
          {authMode && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0c0c0d] border border-white/10 p-8 md:p-12 rounded-[3rem] max-w-md w-full relative">
                <button onClick={() => setAuthMode(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white">✕</button>
                
                <h2 className="text-3xl font-black mb-2 text-center">{authMode === 'login' ? t.auth.login : t.auth.signup}</h2>
                <p className="text-gray-500 text-xs text-center mb-10 uppercase tracking-widest">Rejoignez la révolution ZAPIT</p>
                
                <form onSubmit={handleAuth} className="space-y-4">
                  <input 
                    type="email" required placeholder={t.auth.email} 
                    className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-[#d4fd41]/50 transition-all"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <input 
                    type="password" required placeholder={t.auth.pass} 
                    className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-[#d4fd41]/50 transition-all"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button type="submit" className="w-full py-4 bg-[#d4fd41] text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#d4fd41]/10 mt-4">
                    {authMode === 'login' ? t.auth.login : t.auth.signup}
                  </button>
                </form>

                <p className="text-center mt-8 text-xs text-gray-500">
                  {authMode === 'login' ? t.auth.noAccount : t.auth.hasAccount} 
                  <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[#d4fd41] ml-2 font-bold underline">
                    {authMode === 'login' ? t.auth.signup : t.auth.login}
                  </button>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SIDEBAR PROFIL --- */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div initial={{ x: lang === 'ar' ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: lang === 'ar' ? '-100%' : '100%' }} className={`fixed top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} w-full md:w-[400px] h-full bg-[#0c0c0d] z-[400] shadow-2xl p-10 flex flex-col border-x border-white/5`}>
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-black italic">PROFIL</h2>
                <button onClick={() => setIsProfileOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="mb-10 text-center">
                  <div className="w-24 h-24 bg-gradient-to-tr from-[#58339d] to-[#d4fd41] rounded-full mx-auto mb-4 shadow-2xl"></div>
                  <h3 className="text-xl font-black">{user?.name}</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user?.email}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">{t.user.favorites}</p>
                  {/* ... Liste des favoris ici ... */}
                </div>
              </div>

              <button onClick={logout} className="w-full py-4 bg-white/5 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500/10 transition-all">
                {t.user.logout}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ... Reste de ton application (Header, Grilles, etc.) ... */}

      </div>
    </main>
  );
}
