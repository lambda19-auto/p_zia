/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
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
}

interface RecommendationsApiResponse {
  recommendations: TravelRecommendation[];
  sources: { uri: string; title: string }[];
}

interface RecommendationsApiError {
  error?: string;
  debug?: {
    code?: string;
    hint?: string;
    details?: string;
  };
}

export default function App() {
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('medium');
  const [season, setSeason] = useState('summer');
  const [travelers, setTravelers] = useState(2);
  const [hasChildren, setHasChildren] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TravelRecommendation[] | null>(null);
  const [sources, setSources] = useState<{ uri: string; title: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formatApiError = (status: number, payload: RecommendationsApiError, fallbackText: string) => {
    const errorTitle = payload.error || fallbackText;
    const codeLine = payload.debug?.code ? `Код: ${payload.debug.code}` : null;
    const hintLine = payload.debug?.hint ? `Что проверить: ${payload.debug.hint}` : null;
    const detailsLine = payload.debug?.details ? `Технические детали: ${payload.debug.details}` : null;

    return [
      `Ошибка ${status}: ${errorTitle}`,
      codeLine,
      hintLine,
      detailsLine,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setSources([]);
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

      if (!response.ok) {
        let errorPayload: RecommendationsApiError = {};
        let rawText = '';

        try {
          errorPayload = (await response.json()) as RecommendationsApiError;
        } catch {
          rawText = await response.text();
        }

        const detailedMessage = formatApiError(
          response.status,
          errorPayload,
          rawText || 'Неизвестная ошибка сервера.',
        );

        throw new Error(detailedMessage);
      }

      const data = (await response.json()) as RecommendationsApiResponse;
      setResult(data.recommendations || []);
      setSources(data.sources || []);
    } catch (error) {
      console.error("Search error:", error);
      const detailedMessage = error instanceof Error ? error.message : String(error);
      setError(detailedMessage || 'Произошла ошибка при поиске. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
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
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-red-100/60 p-3 rounded-lg border border-red-200 overflow-x-auto">
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
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {sources.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center px-2">
                    <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                    Источники и полезные ссылки
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {sources.map((source, idx) => (
                      <motion.a
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex flex-col p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 hover:bg-blue-50/30 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="mb-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Globe className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                        </div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors">
                          {source.title || 'Перейти на сайт'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-auto">
                          {new URL(source.uri).hostname}
                        </p>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}
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
            © 2026 TravelAI. Планируйте путешествия с умом.
          </p>
        </div>
      </footer>
    </div>
  );
}
