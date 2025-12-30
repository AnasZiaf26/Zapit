import React from 'react';
import { headers } from 'next/headers';

// --- CONFIGURATION API (Remplace par ta clé TMDB) ---
const API_KEY = 'VOTRE_CLE_TMDB_ICI';
const BASE_URL = 'https://api.themoviedb.org/3';

async function getData(countryCode) {
  // On récupère les films tendances spécifiquement pour la région
  const res = await fetch(
    `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&region=${countryCode}`,
    { next: { revalidate: 3600 } } // Cache d'une heure pour la performance
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function ZapitHomePage() {
  // 1. Détection de la localisation via Vercel Edge Headers
  const headerList = headers();
  const countryCode = headerList.get('x-vercel-ip-country') || 'QA';
  
  // Personnalisation du titre selon le pays
  const displayCountry = countryCode === 'QA' ? 'Qatar 🇶🇦' : countryCode;
  
  const data = await getData(countryCode);
  const movies = data?.results?.slice(0, 12) || [];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* --- BARRE DE NAVIGATION --- */}
      <nav className="border-b border-zinc-800 p-4 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-2xl font-black tracking-tighter italic" style={{ color: '#d4fd41' }}>
          ZAPIT <span className="text-white ml-1 text-sm not-italic font-light">| زابط</span>
        </div>
        <div className="flex gap-4 items-center">
            <span className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-400">
                Region: {countryCode}
            </span>
        </div>
      </nav>

      {/* --- SECTION HERO --- */}
      <header className="py-16 px-6 text-center bg-gradient-to-b from-zinc-900/50 to-black">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Don't search. <span style={{ color: '#d4fd41' }}>Watch.</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Find exactly where to stream any movie in <span className="text-white font-semibold">{displayCountry}</span>.
        </p>
        
        {/* BARRE DE RECHERCHE NÉON */}
        <div className="mt-8 max-w-2xl mx-auto relative">
          <input 
            type="text" 
            placeholder="Search movie or series..." 
            className="w-full bg-zinc-900 border-2 border-zinc-800 p-4 rounded-full px-8 focus:outline-none focus:border-[#d4fd41] transition-all text-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            style={{ caretColor: '#d4fd41' }}
          />
          <button className="absolute right-3 top-2 bottom-2 px-6 rounded-full font-bold text-black" style={{ backgroundColor: '#d4fd41' }}>
            Search
          </button>
        </div>
      </header>

      {/* --- SECTION TENDANCES LOCALES --- */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Trending in {displayCountry}</h2>
            <div className="h-1 flex-1 mx-4 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full w-24 rounded-full" style={{ backgroundColor: '#d4fd41' }}></div>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <div key={movie.id} className="group cursor-pointer">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-[#d4fd41] transition-all">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title}
                  className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded border border-white/10 text-[#d4fd41]">
                    {movie.vote_average.toFixed(1)}
                </div>
              </div>
              <h3 className="mt-3 text-sm font-medium leading-tight group-hover:text-[#d4fd41] transition-colors line-clamp-2">
                {movie.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                {new Date(movie.release_date).getFullYear()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-zinc-900 py-12 px-6 text-center mt-20">
        <div className="text-[#d4fd41] font-bold mb-4">ZAPIT</div>
        <p className="text-zinc-600 text-xs">
            Made for cinema lovers in Doha. <br/>
            © 2025 Zapit Media Group.
        </p>
      </footer>
    </div>
  );
}
