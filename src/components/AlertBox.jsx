import { AlertCircle, X, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable error/alert display component
 * @param {string} message - Error/alert message
 * @param {string} type - 'error', 'success', 'info', 'warning'
 * @param {function} onDismiss - Callback when user dismisses the alert
 * @param {boolean} dismissible - Whether the alert can be dismissed
 */
export default function AlertBox({ 
  message, 
  type = 'error', 
  onDismiss, 
  dismissible = true 
}) {
  if (!message) return null;

  const styles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-600',
      bg: 'bg-red-100',
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-600',
      bg: 'bg-green-100',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
  };

  const style = styles[type] || styles.error;
  const Icon = type === 'success' ? CheckCircle : (type === 'info' ? Info : AlertCircle);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`flex items-start gap-3 p-4 rounded-lg border ${style.container} shadow-sm`}
      >
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.icon}`} />
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {message}
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`${style.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
