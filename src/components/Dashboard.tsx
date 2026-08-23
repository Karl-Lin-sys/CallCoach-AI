import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { CheckCircle2, XCircle, TrendingUp, User, Users, Clock } from 'lucide-react';
import { CallAnalysis } from '../types';

interface DashboardProps {
  analysis: CallAnalysis;
  onReset: () => void;
}

export default function Dashboard({ analysis, onReset }: DashboardProps) {
  const chartData = useMemo(() => {
    return analysis.transcript.map((u, i) => ({
      index: i,
      time: u.timestamp,
      speaker: u.speaker,
      sentiment: u.sentimentScore,
    }));
  }, [analysis.transcript]);

  const averageSentiment = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, curr) => acc + curr.sentiment, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-1">Call Intelligence</h1>
          <p className="text-slate-500">AI-powered insights and coaching for your sales conversation.</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors self-start sm:self-auto"
        >
          Analyze Another Call
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Coaching & Sentiment */}
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          
          {/* Top Metric */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overall Engagement</h3>
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-slate-900">{averageSentiment}</span>
              <span className="text-slate-500 font-medium">/ 100</span>
            </div>
          </div>

          {/* Coaching Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-semibold text-slate-800">AI Coaching Card</h2>
              <p className="text-sm text-slate-500 mt-1">Key takeaways from this interaction</p>
            </div>
            
            <div className="p-6 flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-4 h-4" /> What Went Well
                </h3>
                <ul className="space-y-3">
                  {analysis.coaching.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span className="text-slate-700 leading-relaxed">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div>
                <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <XCircle className="w-4 h-4" /> Missed Opportunities
                </h3>
                <ul className="space-y-3">
                  {analysis.coaching.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span className="text-slate-700 leading-relaxed">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Transcript */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8 flex flex-col h-full">
          
          {/* Sentiment Graph */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Engagement & Sentiment Timeline</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSentiment)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transcript */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col h-[500px]">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Diarized Transcript</h3>
            
            <div className="overflow-y-auto flex-1 pr-4 space-y-6 scrollbar-thin">
              {analysis.transcript.map((utterance, idx) => {
                const isSpeakerA = utterance.speaker.toLowerCase().includes('a') || utterance.speaker.toLowerCase().includes('sales');
                
                return (
                  <div key={idx} className={`flex gap-4 ${isSpeakerA ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center ${isSpeakerA ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                      {isSpeakerA ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div className={`flex flex-col ${isSpeakerA ? 'items-start' : 'items-end'} max-w-[80%]`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-700">{utterance.speaker}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {utterance.timestamp}
                        </span>
                      </div>
                      <div className={`px-5 py-3 rounded-2xl text-slate-800 leading-relaxed ${isSpeakerA ? 'bg-blue-50 rounded-tl-sm' : 'bg-slate-50 border border-slate-100 rounded-tr-sm'}`}>
                        {utterance.text}
                      </div>
                      <div className={`mt-1.5 text-xs font-medium ${utterance.sentimentScore > 70 ? 'text-emerald-600' : utterance.sentimentScore < 40 ? 'text-red-500' : 'text-slate-400'}`}>
                        Sentiment: {utterance.sentimentScore}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
