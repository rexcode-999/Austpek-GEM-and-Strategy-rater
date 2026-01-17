import React, { useState, useRef } from 'react';
import { GemReport, AiProvider } from '../types';
import { rateCreative as rateCreativeGemini } from '../services/geminiService';
import { rateCreativeOpenAI } from '../services/openaiService';
import { Upload, FileVideo, FileImage, CheckCircle, AlertCircle, Zap, Eye, MousePointer, Target, Bot } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GemRaterProps {
  provider: AiProvider;
}

export const GemRater: React.FC<GemRaterProps> = ({ provider }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [report, setReport] = useState<GemReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Inline Data Limit: ~20MB for Gemini API text-based payloads
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError("File size exceeds 20MB limit for inline analysis.");
        return;
      }

      setFile(selectedFile);
      setReport(null);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !preview) return;

    setLoading(true);
    setError(null);

    try {
      // Extract base64 data (remove "data:image/png;base64," prefix)
      const base64Data = preview.split(',')[1];
      let result;
      
      if (provider === AiProvider.OPENAI) {
        result = await rateCreativeOpenAI(base64Data, file.type);
      } else {
        result = await rateCreativeGemini(base64Data, file.type);
      }
      
      setReport(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze creative. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const renderScoreDial = (score: number, max: number, label: string, Icon: React.ElementType) => {
    const data = [
      { name: 'Score', value: score },
      { name: 'Remaining', value: max - score }
    ];

    return (
      <div className="flex flex-col items-center p-4 bg-slate-800 rounded-xl border border-slate-700">
        <div className="flex items-center space-x-2 mb-2 text-slate-300 font-medium">
            <Icon size={16} />
            <span>{label}</span>
        </div>
        <div className="h-24 w-24 relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={35}
                        startAngle={180}
                        endAngle={0}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={getScoreColor((score / max) * 100)} />
                        <Cell fill="#334155" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pt-4">
                <span className="text-xl font-bold text-white">{score}</span>
                <span className="text-xs text-slate-500 ml-0.5">/{max}</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      
      {/* Upload Section */}
      <div className="space-y-6">
        <div className="bg-slate-900 p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-emerald-500/50 transition-colors text-center group">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
            />
            
            {!preview ? (
                <div 
                    className="cursor-pointer space-y-4 py-8"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto group-hover:bg-slate-700 transition-colors">
                        <Upload className="text-emerald-500" size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white">Upload Creative</h3>
                        <p className="text-slate-400 mt-2 text-sm">Drop your image or video here (Max 20MB)</p>
                    </div>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                    {file?.type.startsWith('video') ? (
                        <video src={preview} controls className="max-h-full w-auto" />
                    ) : (
                        <img src={preview} alt="Preview" className="max-h-full w-auto object-contain" />
                    )}
                    <button 
                        onClick={() => { setFile(null); setPreview(null); setReport(null); }}
                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                    >
                        <AlertCircle size={16} />
                    </button>
                </div>
            )}
        </div>

        {file && !loading && !report && (
            <button
                onClick={handleAnalyze}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-[1.02]"
            >
                Calculate GEM Score
            </button>
        )}

        {loading && (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center space-y-4">
                {provider === AiProvider.OPENAI ? (
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                )}
                <p className="text-emerald-400 font-medium">Analyzing visual signals and textures...</p>
                <p className="text-slate-500 text-sm">
                    Using {provider === AiProvider.OPENAI ? 'OpenAI GPT-4o' : 'Gemini 3 Pro'} Vision
                </p>
            </div>
        )}

        {error && (
             <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center">
                <AlertCircle className="mr-3 flex-shrink-0" />
                <span className="font-medium">{error}</span>
            </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {report ? (
            <div className="space-y-6">
                {/* Total Score Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total GEM Score</h2>
                        <div className="flex items-baseline">
                            <span className="text-5xl font-black text-white">{report.totalScore}</span>
                            <span className="text-slate-500 text-lg ml-2">/100</span>
                        </div>
                    </div>
                    <div className="relative z-10 text-right">
                        <div className="text-emerald-400 font-bold mb-1">{report.matchedTrend}</div>
                        <div className="text-xs text-slate-500">Matched 2026 Trend</div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                    {renderScoreDial(report.breakdown.creativeDiversity, 25, "Creative Div.", Zap)}
                    {renderScoreDial(report.breakdown.visualSignal, 25, "Visual Signal", Eye)}
                    {renderScoreDial(report.breakdown.hookVelocity, 25, "Hook Velocity", MousePointer)}
                    {renderScoreDial(report.breakdown.intentMatch, 25, "Intent Match", Target)}
                </div>

                {/* Reasoning & Tips */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6">
                    <div>
                        <h3 className="text-white font-semibold mb-3 flex items-center">
                            <CheckCircle size={18} className="mr-2 text-emerald-500" />
                            Analysis Report
                        </h3>
                        <div className="space-y-3 text-sm text-slate-300">
                             <p><strong className="text-slate-100">Diversity:</strong> {report.reasoning.creativeDiversity}</p>
                             <p><strong className="text-slate-100">Visuals:</strong> {report.reasoning.visualSignal}</p>
                             <p><strong className="text-slate-100">Hook:</strong> {report.reasoning.hookVelocity}</p>
                             <p><strong className="text-slate-100">Intent:</strong> {report.reasoning.intentMatch}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="text-amber-400 font-bold text-sm uppercase mb-3">Optimization Opportunities</h4>
                        <ul className="space-y-2">
                            {report.improvementTips.map((tip, i) => (
                                <li key={i} className="flex items-start text-slate-300 text-sm">
                                    <span className="mr-2 text-amber-500">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl p-12 bg-slate-900/30">
                {provider === AiProvider.OPENAI ? (
                    <Bot size={48} className="mb-4 opacity-50 text-green-400" />
                ) : (
                    <Target size={48} className="mb-4 opacity-50 text-emerald-400" />
                )}
                <p className="text-lg font-medium">Awaiting Creative Asset</p>
                <p className="text-sm">Upload an image or video to begin analysis.</p>
            </div>
        )}
      </div>
    </div>
  );
};
