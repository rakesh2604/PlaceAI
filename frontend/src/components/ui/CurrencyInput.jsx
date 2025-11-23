import { useState, useEffect } from 'react';
import { formatINRInput, parseINR } from '../../utils/currencyFormatter';
import { cn } from '../../utils/cn';

export default function CurrencyInput({
  label,
  value,
  onChange,
  error,
  required = false,
  className = '',
  currency = 'INR'
}) {
  const [displayValue, setDisplayValue] = useState('');
  const [focused, setFocused] = useState(false);

  // Initialize display value from paise - treat 0 as valid
  useEffect(() => {
    if (!focused && value !== null && value !== undefined) {
      const rupees = value / 100;
      // Display 0 as "0", not empty string
      setDisplayValue(rupees >= 0 ? formatINRInput(rupees.toString()) : '');
    }
  }, [value, focused]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Allow only numbers and decimal point
    const cleaned = inputValue.replace(/[^\d.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) return;
    
    // Allow "0", "00", "0.0", "0.00", etc while typing
    setDisplayValue(cleaned);
    
    // Convert to paise and call onChange (0 is valid)
    const paise = parseINR(cleaned);
    onChange?.(paise);
  };

  const handleFocus = () => {
    setFocused(true);
    // Show raw number while editing - preserve 0
    if (value !== null && value !== undefined) {
      const rupees = value / 100;
      setDisplayValue(rupees.toString());
    } else {
      setDisplayValue('');
    }
  };

  const handleBlur = () => {
    setFocused(false);
    // Format on blur - preserve 0
    if (displayValue !== '' && displayValue !== null && displayValue !== undefined) {
      const rupees = parseFloat(displayValue) || 0;
      setDisplayValue(formatINRInput(rupees.toString()));
    } else if (value === 0) {
      // If value is 0, display "0"
      setDisplayValue('0');
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-700 dark:text-dark-300 font-medium">
          ₹
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="12,34,000"
          className={cn(
            'w-full pl-8 pr-4 py-2.5 rounded-xl border-2 transition-all',
            'bg-white dark:bg-dark-800',
            'text-dark-900 dark:text-dark-100',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
            error
              ? 'border-red-500'
              : 'border-dark-200 dark:border-dark-700 focus:border-primary-500'
          )}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

