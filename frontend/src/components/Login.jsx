import { useState } from 'react';
import { motion } from 'framer-motion';
import { login, connectWebSocket } from '../services/api';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      // Connect WebSocket with token
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      if (token) {
        connectWebSocket(token);
      }
      
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #c4ff0d 1px, transparent 1px),
              linear-gradient(to bottom, #c4ff0d 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="w-12 h-12 bg-lime-500 flex items-center justify-center">
              <Lock className="w-6 h-6 text-charcoal-950" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-sans font-bold text-white mb-2"
          >
            Financial_Clarity
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 font-mono text-sm"
          >
            AI-powered insights • Real-time monitoring
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Email */}
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-charcoal-900 border border-charcoal-700 text-white pl-12 pr-4 py-4 focus:outline-none focus:border-lime-500 transition-colors font-mono text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-charcoal-900 border border-charcoal-700 text-white pl-12 pr-4 py-4 focus:outline-none focus:border-lime-500 transition-colors font-mono text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-crimson-500/10 border border-crimson-500/30 px-4 py-3"
            >
              <p className="text-crimson-500 font-mono text-xs">{error}</p>
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-lime-500 text-charcoal-950 py-4 font-sans font-bold text-sm uppercase tracking-wider hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                Access Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-charcoal-900/50 border border-charcoal-800">
            <p className="text-xs font-mono text-gray-500 mb-2">Demo Credentials:</p>
            <p className="text-xs font-mono text-gray-400">Email: margaret.robinson@kag.com</p>
            <p className="text-xs font-mono text-gray-400">Password: Password123!</p>
          </div>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-xs font-mono text-gray-600">
            Secure & Private
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}