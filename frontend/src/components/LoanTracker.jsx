import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Landmark, TrendingDown, Calendar, Percent } from 'lucide-react';
import { getLoanSummary } from '../services/api';

export default function LoanTracker() {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoan();
  }, []);

  const loadLoan = async () => {
    setLoading(true);
    try {
      const data = await getLoanSummary();
      setLoan(data);
    } catch (error) {
      console.error('Failed to load loan:', error);
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

  if (!loan) {
    return (
      <div className="bg-charcoal-900 border border-charcoal-800 p-6">
        <p className="text-gray-500 font-mono text-sm">No loan data</p>
      </div>
    );
  }

  const percentPaid = parseFloat(loan.progress.percentPaid);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-charcoal-900 border border-charcoal-800"
    >
      {/* Header */}
      <div className="p-6 border-b border-charcoal-800">
        <div className="flex items-center gap-3 mb-2">
          <Landmark className="w-5 h-5 text-lime-500" />
          <h3 className="text-lg font-sans font-bold text-white">Loan Tracker</h3>
        </div>
        <p className="text-xs font-mono text-gray-500">
          {loan.current.loanType} • {loan.current.loanStatus}
        </p>
      </div>

      {/* Progress */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <span className="text-xs font-mono text-gray-400 uppercase">Paid Off</span>
            <span className="text-2xl font-sans font-bold text-lime-500">
              {percentPaid.toFixed(1)}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-3 bg-charcoal-800 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentPaid}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-lime-500 to-lime-400"
            />
          </div>

          <div className="flex justify-between mt-2">
            <span className="text-xs font-mono text-gray-500">
              Paid: ${parseFloat(loan.progress.amountPaidOff).toFixed(0)}
            </span>
            <span className="text-xs font-mono text-gray-500">
              Remaining: ${parseFloat(loan.current.loanAmount).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Loan Details */}
        <div className="space-y-4">
          {/* Monthly Payment */}
          <div className="bg-charcoal-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-crimson-500" />
              <span className="text-xs font-mono text-gray-400 uppercase">Monthly Payment</span>
            </div>
            <p className="text-2xl font-sans font-bold text-white">
              ${parseFloat(loan.current.monthlyPayment).toFixed(2)}
            </p>
          </div>

          {/* Interest Rate */}
          <div className="flex items-center justify-between p-4 border border-charcoal-800">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono text-gray-400 uppercase">Interest Rate</span>
            </div>
            <span className="font-mono text-lg text-white font-bold">
              {parseFloat(loan.current.interestRate).toFixed(2)}%
            </span>
          </div>

          {/* Payoff Date */}
          <div className="flex items-center justify-between p-4 border border-charcoal-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-lime-500" />
              <span className="text-xs font-mono text-gray-400 uppercase">Est. Payoff</span>
            </div>
            <span className="font-mono text-sm text-white">
              {loan.projection.monthsRemaining} months
            </span>
          </div>

          {/* Total Interest */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-500 uppercase">Total Interest</span>
              <span className="font-mono text-lg text-amber-500 font-bold">
                ${parseFloat(loan.projection.totalInterest).toFixed(2)}
              </span>
            </div>
            <p className="text-xs font-mono text-gray-500 mt-1">
              If paid on schedule
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}