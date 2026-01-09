import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { getCreditCardHealth } from '../services/api';

export default function CreditHealthWidget() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const data = await getCreditCardHealth();
      setHealth(data);
    } catch (error) {
      console.error('Failed to load credit health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-charcoal-900 border border-charcoal-800 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-charcoal-800 w-1/2" />
          <div className="h-8 bg-charcoal-800 w-3/4" />
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="bg-charcoal-900 border border-charcoal-800 p-6">
        <p className="text-gray-500 font-mono text-sm">No credit card data</p>
      </div>
    );
  }

  const utilization = parseFloat(health.current.utilization);
  const getStatusColor = () => {
    if (health.status === 'critical') return 'crimson';
    if (health.status === 'warning') return 'amber';
    return 'lime';
  };

  const statusColor = getStatusColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-charcoal-900 border-2 border-${statusColor}-500/30 relative overflow-hidden`}
    >
      {/* Header */}
      <div className="p-6 border-b border-charcoal-800">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className={`w-5 h-5 text-${statusColor}-500`} />
          <h3 className="text-lg font-sans font-bold text-white">Credit Health</h3>
        </div>
        <p className="text-xs font-mono text-gray-500">
          {health.current.cardType} • Due {health.current.daysUntilDue}d
        </p>
      </div>

      {/* Utilization */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-end justify-between mb-2">
            <span className="text-xs font-mono text-gray-400 uppercase">Utilization</span>
            <span className={`text-2xl font-sans font-bold text-${statusColor}-500`}>
              {utilization.toFixed(1)}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-charcoal-800 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(utilization, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ backgroundColor: '#ff2e63' }} // Updated to use the specified color
              className="h-full"
            />
          </div>

          {/* Markers */}
          <div className="flex justify-between mt-1">
            <span className="text-xs font-mono text-gray-600">0%</span>
            <span className="text-xs font-mono text-amber-500">30%</span>
            <span className="text-xs font-mono text-crimson-500">70%</span>
            <span className="text-xs font-mono text-gray-600">100%</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-2 bg-${statusColor}-500/10 border border-${statusColor}-500/30 mb-4`}>
          {health.status === 'good' ? (
            <CheckCircle className={`w-4 h-4 text-${statusColor}-500`} />
          ) : (
            <AlertTriangle className={`w-4 h-4 text-${statusColor}-500`} />
          )}
          <span className={`text-xs font-mono text-${statusColor}-500 uppercase font-bold`}>
            {health.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-500">Balance</span>
            <span className="font-mono text-sm text-white font-bold">
              ${parseFloat(health.current.balance).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-500">Credit Limit</span>
            <span className="font-mono text-sm text-gray-400">
              ${parseFloat(health.current.creditLimit).toFixed(2)}
            </span>
          </div>
          <div className="h-px bg-charcoal-800" />
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-500">Min Payment</span>
            <span className="font-mono text-sm text-amber-500 font-bold">
              ${parseFloat(health.current.minimumPaymentDue).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-gray-500">Rewards Points</span>
            <span className="font-mono text-sm text-lime-500 font-bold">
              {health.current.rewardsPoints.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}