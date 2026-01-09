import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, AlertCircle, TrendingDown, TrendingUp, Filter } from 'lucide-react';
import { getTransactions } from '../services/api';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { category: filter === 'INCOME' ? 'INCOME' : filter } : {};
      const data = await getTransactions({ ...params, limit: 20 });
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Groceries', 'Dining', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Income'];

  const getCategoryColor = (category) => {
    const colors = {
      'Groceries': 'lime',
      'Dining': 'amber',
      'Transport': 'blue',
      'Shopping': 'purple',
      'Entertainment': 'pink',
      'Healthcare': 'red',
      'Income': 'lime',
      'Payment': 'gray'
    };
    return colors[category] || 'gray';
  };

  return (
    <div className="bg-charcoal-900 border border-charcoal-800">
      {/* Header */}
      <div className="border-b border-charcoal-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-lime-500" />
            <h2 className="text-xl font-sans font-bold text-white">Transaction History</h2>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-charcoal-800 border border-charcoal-700 text-white px-3 py-2 text-xs font-mono focus:outline-none focus:border-lime-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-charcoal-800">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-sm">
            No transactions found
          </div>
        ) : (
          transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 hover:bg-charcoal-800 transition-colors ${
                tx.anomaly ? 'bg-amber-500/5 border-l-4 border-amber-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Icon */}
                  <div className={`w-10 h-10 flex items-center justify-center ${
                    tx.transactionType === 'Deposit' 
                      ? 'bg-lime-500/20' 
                      : 'bg-crimson-500/20'
                  }`}>
                    {tx.transactionType === 'Deposit' ? (
                      <TrendingUp className="w-5 h-5 text-lime-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-crimson-500" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-sm text-white font-semibold">
                        {tx.merchant || tx.transactionType}
                      </p>
                      {tx.anomaly === 1 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs font-mono">
                          <AlertCircle className="w-3 h-3" />
                          ANOMALY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {tx.category && (
                        <span className="text-xs font-mono text-gray-500 uppercase">
                          {tx.category}
                        </span>
                      )}
                      <span className="text-xs font-mono text-gray-600">
                        {new Date(tx.transactionDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className={`font-mono text-lg font-bold ${
                    tx.transactionType === 'Deposit' 
                      ? 'text-lime-500' 
                      : 'text-white'
                  }`}>
                    {tx.transactionType === 'Deposit' ? '+' : '-'}$
                    {parseFloat(tx.transactionAmount).toFixed(2)}
                  </p>
                  <p className="text-xs font-mono text-gray-600">
                    Balance: ${parseFloat(tx.accountBalanceAfterTransaction).toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}