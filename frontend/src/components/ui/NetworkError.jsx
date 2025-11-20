import { WifiOff, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function NetworkError({ onRetry, message = 'Network connection lost' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <WifiOff className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">
        Connection Error
      </h3>
      <p className="text-dark-600 dark:text-dark-400 mb-6 max-w-md">
        {message}. Please check your internet connection and try again.
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      )}
    </div>
  );
}

