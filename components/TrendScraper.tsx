import React, { useEffect, useState } from 'react';
import { TrendItem, WebSource, AiProvider } from '../types';
import { fetchTrends as fetchTrendsGemini } from '../services/geminiService';
import { fetchTrendsOpenAI } from '../services/openaiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RefreshCw, TrendingUp, Globe, MapPin, Hash, AlertTriangle, ExternalLink, Bot, Zap } from 'lucide-react';

interface TrendScraperProps {
  provider: AiProvider;
}

export const TrendScraper: React.FC<TrendScraperProps> = ({ provider }) => {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [sources, setSources] = useState<WebSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrends = async () => {
    setLoading(true);
    setError(null);
    setSources([]); // Clear sources on new load
    try {
      let data;
      if (provider === AiProvider.OPENAI) {
        data = await fetchTrendsOpenAI();
      } else {
        data = await fetchTrendsGemini();
      }
      setTrends(data.trends);
      setSources(data.sources);
    } catch (err: any) {
      setError(err.message || "Failed to fetch viral trends. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reload when provider changes
  useEffect(() => {
    loadTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const getRegionColor = (region: string) => {
    switch (region) {
      case 'US': return '#3b82f6'; // Blue
      case 'UK': return '#ef4444'; // Red
      case 'AU': return '#10b981'; // Emerald
      default: return '#8884d8';
    }
  };

  const renderTrendCard = (trend: TrendItem, index: number) => (
    <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-bold text-white`} style={{ backgroundColor: getRegionColor(trend.region) }}>
            {trend.region}
          </span>
          <h3 className="text-xl font-bold text-white">{trend.topic}</h3>
        </div>
        <div className="flex items-center text-emerald-400">
            <TrendingUp size={16} className="mr-1" />
            <span className="font-mono font-bold">{trend.viralScore}</span>
        </div>
      </div>
      
      <p className="text-slate-300 text-sm mb-4 leading-relaxed">
        {trend.description}
      </p>

      <div className="bg-slate-900/50 rounded-lg p-3 mb-4 border border-slate-700/50">
        <div className="flex items-start text-amber-400 text-xs">
          <Globe size={14} className="mr-2 mt-0.5 flex-shrink-0" />
          <span className="font-semibold">{trend.trendLagStatus}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {trend.hashtags.map((tag, i) => (
          <span key={i} className="flex items-center text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
            <Hash size={10} className="mr-1" />
            {tag.replace('#', '')}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
            {provider === AiProvider.OPENAI ? (
               <Bot className="mr-3 text-green-400" />
            ) : (
               <Zap className="mr-3 text-blue-400" />
            )}
            Global Trend Scraper
            </h2>
            <p className="text-slate-400 mt-1">
                Real-time analysis of US, UK, and AU bathroom design topics. 
                <span className="text-slate-500 text-xs ml-2 border border-slate-700 rounded px-1.5 py-0.5">
                    Powered by {provider === AiProvider.OPENAI ? 'GPT-4o' : 'Gemini 3 Flash'}
                </span>
            </p>
        </div>
        <button
          onClick={loadTrends}
          disabled={loading}
          className="mt-4 md:mt-0 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="mr-2 animate-spin" />
          ) : (
            <RefreshCw className="mr-2" />
          )}
          Refresh Intel
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center">
            <AlertTriangle className="mr-3 flex-shrink-0" />
            <span className="font-medium">{error}</span>
        </div>
      )}

      {loading && trends.length === 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-slate-800 rounded-xl animate-pulse"></div>
            ))}
         </div>
      )}

      {!loading && trends.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Viral Topics Feed</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trends.map((trend, idx) => renderTrendCard(trend, idx))}
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 sticky top-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Viral Velocity Comparison</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends}>
                                <XAxis dataKey="region" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    cursor={{fill: '#334155', opacity: 0.4}}
                                />
                                <Bar dataKey="viralScore" radius={[4, 4, 0, 0]}>
                                {trends.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getRegionColor(entry.region)} />
                                ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 space-y-4">
                        <div className="p-4 bg-slate-900 rounded-lg">
                            <h4 className="text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wider">Strategic Insight</h4>
                            <p className="text-slate-400 text-sm">
                                US trends typically lead AU markets by 3-6 months. Look for high-velocity US items (blue) that have low presence in AU (green) to exploit the "Trend Lag".
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grounding sources only available via Gemini */}
                {sources.length > 0 && (
                  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Search Sources</h3>
                    <ul className="space-y-2">
                      {sources.map((source, idx) => (
                        <li key={idx}>
                          <a 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                          >
                            <ExternalLink size={12} className="mr-2" />
                            <span className="truncate">{source.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {provider === AiProvider.OPENAI && sources.length === 0 && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 opacity-60">
                        <p className="text-xs text-slate-400 flex items-center">
                            <AlertTriangle size={12} className="mr-2" />
                            Web grounding sources not available with OpenAI provider.
                        </p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
