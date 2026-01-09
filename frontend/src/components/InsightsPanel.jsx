import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, Lightbulb, Play, Loader } from 'lucide-react';
import { getInsights, runAgent } from '../services/api';

export default function InsightsPanel() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);

  const handleRunAgent = async () => {
    setRunning(true);
    try {
      const data = await runAgent();
      // data.insights contains the full insights object with insights, alerts, and recommendations
      setInsights(data.insights);
      setHasRunAnalysis(true);
    } catch (error) {
      console.error('Failed to run agent:', error);
      setHasRunAnalysis(false);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-charcoal-900 border border-charcoal-800 p-8 flex items-center justify-center">
        <Loader className="w-6 h-6 text-lime-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-charcoal-900 border-2 border-lime-500/30 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-500 via-transparent to-lime-500 animate-pulse-slow" />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-charcoal-950" />
            </div>
            <div>
              <h2 className="text-xl font-sans font-bold text-white">AI Analysis</h2>
              <p className="text-xs font-mono text-gray-500">
                {insights?.timestamp && new Date(insights.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRunAgent}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-charcoal-950 font-mono text-xs font-bold hover:bg-lime-400 transition-colors disabled:opacity-50"
          >
            {running ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Analysis
              </>
            )}
          </motion.button>
        </div>

        {/* Content Grid - Only show after analysis has been run */}
        {hasRunAnalysis && insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-charcoal-800 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-lime-500" />
              <h3 className="text-xs font-mono text-gray-400 uppercase">Insights</h3>
            </div>
            <div className="space-y-2">
              {insights?.insights?.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="border-l-2 border-lime-500 pl-3 py-1"
                >
                  <p className="text-sm text-white font-mono">{insight}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-charcoal-800 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-mono text-gray-400 uppercase">Alerts</h3>
            </div>
            <div className="space-y-2">
              {insights?.alerts?.map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="border-l-2 border-amber-500 pl-3 py-1"
                >
                  <p className="text-sm text-white font-mono">{alert}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-charcoal-800 p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-lime-500" />
              <h3 className="text-xs font-mono text-gray-400 uppercase">Actions</h3>
            </div>
            <div className="space-y-2">
              {insights?.recommendations?.map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="border-l-2 border-lime-500 pl-3 py-1"
                >
                  <p className="text-sm text-white font-mono">{rec}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        )}

        {/* Initial state - Show prompt to run analysis */}
        {!hasRunAnalysis && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="w-12 h-12 text-gray-600 mb-4" />
            <p className="text-gray-400 font-mono text-sm mb-2">No analysis available yet</p>
            <p className="text-gray-500 font-mono text-xs">Click "Run Analysis" to get AI-powered insights</p>
          </div>
        )}
      </div>
    </div>
  );
}