/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { 
  Search, 
  MapPin,
  Users, 
  Sun,
  Wallet, 
  ExternalLink, 
  Loader2, 
  Plane,
  Baby,
  Calendar,
  Compass,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TravelRecommendation {
  title: string;
  description: string;
  whyFits: string;
  estimatedCost: string;
  sources: { title: string; url: string }[];
}

interface RecommendationsApiResponse {
  recommendations: TravelRecommendation[];
}

interface RecommendationsApiError {
  error?: string;
}

export default function App() {
  const cookieConsentKey = 'cookie-banner-cloudflare-accepted';
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('medium');
  const [season, setSeason] = useState('summer');
  const [travelers, setTravelers] = useState(2);
  const [hasChildren, setHasChildren] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TravelRecommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    try {
      const hasAcceptedCookies = localStorage.getItem(cookieConsentKey) === 'true';
      setShowCookieBanner(!hasAcceptedCookies);
    } catch {
      setShowCookieBanner(true);
    }
  }, []);

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getSafeHttpUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        return parsedUrl.toString();
      }
      return null;
    } catch {
      return null;
    }
  };

  const formatApiError = (status: number, payload: RecommendationsApiError, fallbackText: string) => {
    if (status === 400) {
      return 'Пожалуйста, уточните запрос и попробуйте снова.';
    }

    if (status === 429) {
      return 'Сервис сейчас сильно загружен. Попробуйте еще раз через пару минут.';
    }

    if (status >= 500) {
      return 'Сейчас не удалось подобрать рекомендации. Попробуйте еще раз чуть позже.';
    }

    return payload.error || fallbackText || 'Что-то пошло не так. Попробуйте снова.';
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          budget,
          season,
          travelers,
          hasChildren,
        }),
      });

      const rawText = await response.text();
      let parsedPayload: RecommendationsApiResponse | RecommendationsApiError | null = null;

      try {
        parsedPayload = JSON.parse(rawText) as RecommendationsApiResponse | RecommendationsApiError;
      } catch {
        parsedPayload = null;
      }

      if (!response.ok) {
        const detailedMessage = formatApiError(
          response.status,
          (parsedPayload as RecommendationsApiError) || {},
          rawText || 'Не удалось получить ответ от сервиса.',
        );

        throw new Error(detailedMessage);
      }

      const data = parsedPayload as RecommendationsApiResponse;
      if (!data || !Array.isArray(data.recommendations)) {
        throw new Error('Не удалось обработать ответ сервиса. Попробуйте снова.');
      }

      setResult(data.recommendations);
    } catch (error) {
      console.error("Search error:", error);
      const message = error instanceof Error ? error.message : '';
      setError(message || 'Не удалось выполнить поиск. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const acceptCookieBanner = () => {
    try {
      localStorage.setItem(cookieConsentKey, 'true');
    } catch {
      // Storage is unavailable (e.g. private mode); keep UI functional without persistence.
    }
    setShowCookieBanner(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero Section */}
      <header className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2070" 
          alt="Travel background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Compass className="w-12 h-12 text-blue-400 mr-2" />
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                TravelAI
              </h1>
            </div>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-light">
              Ваш персональный ИИ-помощник для планирования идеального путешествия
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-16 relative z-20 pb-20">
        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">Куда вы хотите отправиться?</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Например: "хочу на море" или "активный отдых в горах"'
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Budget */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                  <Wallet className="w-4 h-4 mr-2 text-blue-500" />
                  Бюджет
                </label>
                <select 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="low">Эконом (до 100к)</option>
                  <option value="medium">Средний (100-300к)</option>
                  <option value="high">Люкс (от 300к)</option>
                </select>
              </div>

              {/* Season */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  Сезон
                </label>
                <select 
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="winter">Зима</option>
                  <option value="spring">Весна</option>
                  <option value="summer">Лето</option>
                  <option value="autumn">Осень</option>
                </select>
              </div>

              {/* Travelers */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  Человек
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-[50px]">
                  <button
                    type="button"
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                    className="px-3 h-full hover:bg-slate-100 transition-colors text-slate-600 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={travelers}
                    onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-transparent outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setTravelers(travelers + 1)}
                    className="px-3 h-full hover:bg-slate-100 transition-colors text-slate-600 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div>
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                  <Baby className="w-4 h-4 mr-2 text-blue-500" />
                  В том числе дети
                </label>
                <div className="flex items-center h-[50px]">
                  <button
                    type="button"
                    onClick={() => setHasChildren(!hasChildren)}
                    className={`flex-1 h-full py-3 px-4 rounded-xl border transition-all flex items-center justify-center ${
                      hasChildren 
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {hasChildren ? 'Да' : 'Нет'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Ищем лучшие варианты...
                </>
              ) : (
                <>
                  <Plane className="w-6 h-6 mr-2" />
                  Найти варианты
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl"
            >
              <p className="font-semibold mb-2">Не удалось получить рекомендации</p>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-red-100/60 p-3 rounded-lg border border-red-200 overflow-x-auto">
                {error}
              </pre>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12 space-y-8"
            >
              <div className="flex items-center px-2">
                <MapPin className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-slate-800">Рекомендации для вас</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {result.map((option, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 flex flex-col md:flex-row"
                  >
                    <div className="bg-blue-600 text-white p-6 flex flex-col justify-center items-center md:w-24 shrink-0">
                      <span className="text-sm font-bold uppercase opacity-80">Топ</span>
                      <span className="text-4xl font-black">{idx + 1}</span>
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{option.title}</h3>
                      <p className="text-slate-600 mb-4 leading-relaxed">{option.description}</p>
                      
                      <div className="space-y-3">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                          <p className="text-sm font-bold text-blue-800 mb-1 flex items-center">
                            <Sun className="w-4 h-4 mr-1" /> Почему подходит:
                          </p>
                          <p className="text-sm text-blue-900">{option.whyFits}</p>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-sm font-bold text-slate-700 mb-1 flex items-center">
                            <Wallet className="w-4 h-4 mr-1" /> Примерная стоимость:
                          </p>
                          <p className="text-sm text-slate-900 font-medium">{option.estimatedCost}</p>
                        </div>

                        {option.sources?.length > 0 && (
                          <div className="bg-white p-4 rounded-xl border border-slate-200">
                            <p className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                              <ExternalLink className="w-4 h-4 mr-1" /> Источники:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {option.sources.map((source, sourceIdx) => (
                                (() => {
                                  const safeSourceUrl = getSafeHttpUrl(source.url);
                                  if (!safeSourceUrl) return null;

                                  return (
                                    <a
                                      key={`${safeSourceUrl}-${sourceIdx}`}
                                      href={safeSourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-start p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                                    >
                                      <Globe className="w-4 h-4 mt-0.5 mr-2 text-slate-400 group-hover:text-blue-500 shrink-0" />
                                      <span className="min-w-0">
                                        <span className="block text-xs font-semibold text-slate-800 group-hover:text-blue-700 line-clamp-2">
                                          {source.title || 'Перейти на сайт'}
                                        </span>
                                        <span className="block text-[10px] text-slate-400 truncate">
                                          {getHostname(safeSourceUrl)}
                                        </span>
                                      </span>
                                    </a>
                                  );
                                })()
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !loading && (
          <div className="mt-20 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Введите ваши пожелания, чтобы получить персональные рекомендации</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4 opacity-50">
            <Compass className="w-6 h-6 text-slate-400 mr-2" />
            <span className="font-bold text-slate-400">TravelAI</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 TravelAI. Планируйте путешествия с умом. lambda19.
          </p>
        </div>
      </footer>

      {showCookieBanner && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
          <div className="mx-auto max-w-4xl rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm md:text-base text-slate-100">
              Мы используем Cloudflare для обеспечения безопасности и производительности сайта, а также файлы cookie для корректной работы сервиса.
            </p>
            <button
              type="button"
              onClick={acceptCookieBanner}
              className="shrink-0 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
