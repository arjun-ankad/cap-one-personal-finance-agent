import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Zap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { logout, getTransactionStats, onWebSocketMessage } from '../services/api';
import TransactionList from './TransactionList';
import CreditHealthWidget from './CreditHealthWidget';
import LoanTracker from './LoanTracker';
import InsightsPanel from './InsightsPanel';

export default function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [wsMessage, setWsMessage] = useState(null);

  useEffect(() => {
    loadStats();
    
    // Listen for WebSocket messages
    const unsubscribe = onWebSocketMessage((message) => {
      console.log('WebSocket message:', message);
      setWsMessage(message);
      
      // Clear notification after 5 seconds
      setTimeout(() => setWsMessage(null), 5000);
    });

    return unsubscribe;
  }, []);

  const loadStats = async () => {
    try {
      const data = await getTransactionStats(30);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-charcoal-950">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-charcoal-800 bg-charcoal-900/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-lime-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-charcoal-950" />
            </div>
            <div>
              <h1 className="text-lg font-sans font-bold text-white">Financial_Clarity</h1>
              <p className="text-xs font-mono text-gray-500">
                {user.firstName} {user.lastName} • ID#{user.customerId}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-charcoal-700 hover:border-crimson-500 hover:text-crimson-500 transition-colors text-sm font-mono"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.header>

      {/* WebSocket Notification */}
      {wsMessage && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-20 right-6 z-50 bg-lime-500 text-charcoal-950 px-6 py-4 max-w-md pulse-glow"
        >
          <p className="font-mono text-xs font-bold mb-1">⚡ REAL-TIME UPDATE</p>
          <p className="font-mono text-sm">{wsMessage.type}</p>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Stats Overview */}
          {stats && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Spent */}
              <div className="bg-charcoal-900 border-l-4 border-crimson-500 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-crimson-500" />
                  <p className="text-xs font-mono text-gray-400 uppercase">Total Spent</p>
                </div>
                <p className="text-3xl font-sans font-bold text-white">${parseFloat(stats.totalSpent).toFixed(0)}</p>
                <p className="text-xs font-mono text-gray-500 mt-1">Last 30 days</p>
              </div>

              {/* Total Income */}
              <div className="bg-charcoal-900 border-l-4 border-lime-500 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-lime-500" />
                  <p className="text-xs font-mono text-gray-400 uppercase">Total Income</p>
                </div>
                <p className="text-3xl font-sans font-bold text-white">${parseFloat(stats.totalIncome).toFixed(0)}</p>
                <p className="text-xs font-mono text-gray-500 mt-1">Last 30 days</p>
              </div>

              {/* Net Change */}
              <div className={`bg-charcoal-900 border-l-4 ${parseFloat(stats.netChange) >= 0 ? 'border-lime-500' : 'border-amber-500'} p-6`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={`w-4 h-4 ${parseFloat(stats.netChange) >= 0 ? 'text-lime-500' : 'text-amber-500'}`} />
                  <p className="text-xs font-mono text-gray-400 uppercase">Net Change</p>
                </div>
                <p className="text-3xl font-sans font-bold text-white">
                  {parseFloat(stats.netChange) >= 0 ? '+' : ''}${parseFloat(stats.netChange).toFixed(0)}
                </p>
                <p className="text-xs font-mono text-gray-500 mt-1">Income - Expenses</p>
              </div>

              {/* Anomalies */}
              <div className="bg-charcoal-900 border-l-4 border-amber-500 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-mono text-gray-400 uppercase">Anomalies</p>
                </div>
                <p className="text-3xl font-sans font-bold text-white">{stats.anomalyCount}</p>
                <p className="text-xs font-mono text-gray-500 mt-1">Flagged transactions</p>
              </div>
            </motion.div>
          )}

          {/* AI Insights */}
          <motion.div variants={itemVariants}>
            <InsightsPanel />
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Transactions (2/3 width) */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <TransactionList />
            </motion.div>

            {/* Right Column - Widgets (1/3 width) */}
            <motion.div variants={itemVariants} className="space-y-6">
              <CreditHealthWidget />
              <LoanTracker />
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}