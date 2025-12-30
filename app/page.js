import { headers } from 'next/headers';

async function getTrendingMovies(countryCode) {
  // Ici, tu appelles ton API (ex: TMDB) en passant le code pays
  // Exemple avec TMDB : &region=${countryCode}
  const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=TON_API_KEY&region=${countryCode}`);
  return res.json();
}

export default async function HomePage() {
  const headerList = headers();
  
  // Vercel détecte automatiquement le pays via l'IP
  // On met 'QA' (Qatar) par défaut si on ne détecte rien
  const countryCode = headerList.get('x-vercel-ip-country') || 'QA';
  const countryName = countryCode === 'QA' ? 'Qatar 🇶🇦' : countryCode;

  const data = await getTrendingMovies(countryCode);

  return (
    <main>
      <section className="hero">
        <h1 className="text-neon-green">
          Trending in {countryName}
        </h1>
        {/* Ta grille de films ici */}
        <div className="grid">
          {data.results.map((movie) => (
            <div key={movie.id}>{movie.title}</div>
          ))}
        </div>
      </section>
    </main>
  );
}
