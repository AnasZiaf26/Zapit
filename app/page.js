"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  ar: {
    title: "زابط", slogan: "دليلك الشامل للبث المباشر", placeholder: "ابحث عن فيلم أو مسلسل...", 
    sections: { local: "أكثر شيوعاً في قطر", global: "التوجهات العالمية", search: "نتائج البحث" },
    categories: { movie: "أفلام", tv: "مسلسلات" },
    available: "متوفر على :", close: "إغلاق", more: "عرض المزيد",
    noDesc: "لا يوجد وصف متاح حاليا لهذا الفيلم.",
    cinemaOnly: "يعرض حالياً في دور السينما فقط"
  },
  fr: {
    title: "ZAPIT", slogan: "Votre guide ultime du streaming", placeholder: "Chercher un film, une série...", 
    sections: { local: "Top au Qatar", global: "Tendances Mondiales", search: "Résultats de recherche" },
    categories: { movie: "Films", tv: "Séries" },
    available: "Disponible sur :", close: "Fermer", more: "Voir plus",
    noDesc: "Aucune description disponible pour le moment.",
    cinemaOnly: "Actuellement au cinéma uniquement"
  },
  en: {
    title: "ZAPIT", slogan: "Your ultimate streaming guide", placeholder: "Search movies, shows...", 
    sections: { local: "Trending in Qatar", global: "Global Trends", search: "Search Results" },
    categories: { movie: "Movies", tv: "TV Shows" },
    available: "Watch on:", close: "Close", more: "See more",
    noDesc: "No description available at the moment.",
    cinemaOnly: "Currently in theaters only"
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
  const [showTopBtn, setShowTop
