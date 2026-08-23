/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import AudioUploader from './components/AudioUploader';
import Dashboard from './components/Dashboard';
import { CallAnalysis } from './types';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [analysis, setAnalysis] = useState<CallAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudioReady = async (file: File) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await fetch('/api/analyze-call', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze call');
      }

      const data: CallAnalysis = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.error('Error in handleAudioReady:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
          <Sparkles className="w-6 h-6" />
          <span>CallCoach AI</span>
        </div>
      </header>

      <main className="py-8 sm:py-12">
        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="text-red-700 font-bold hover:text-red-900">&times;</button>
          </div>
        )}

        {!analysis ? (
          <AudioUploader onAudioReady={handleAudioReady} isLoading={isLoading} />
        ) : (
          <Dashboard analysis={analysis} onReset={handleReset} />
        )}
      </main>

    </div>
  );
}

