import { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { cn } from '../../utils/cn';

export default function PhoneInputIntl({
  label,
  value,
  onChange,
  error,
  required = false,
  className = '',
  defaultCountry = 'IN'
}) {
  const [isValid, setIsValid] = useState(true);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (value && touched) {
      setIsValid(value ? isValidPhoneNumber(value, defaultCountry) : !required);
    }
  }, [value, touched, defaultCountry, required]);

  const handleChange = (newValue) => {
    onChange?.(newValue || '');
    if (touched) {
      setIsValid(newValue ? isValidPhoneNumber(newValue, defaultCountry) : !required);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (value) {
      setIsValid(isValidPhoneNumber(value, defaultCountry));
    } else {
      setIsValid(!required);
    }
  };

  const showError = touched && (!isValid || error);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <PhoneInput
          international
          defaultCountry={defaultCountry}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="+91 98765 43210"
          className={cn(
            'phone-input-custom',
            'w-full px-4 py-2.5 rounded-xl border-2 transition-all',
            'bg-white dark:bg-dark-800',
            'text-dark-900 dark:text-dark-100',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
            showError
              ? 'border-red-500'
              : 'border-dark-200 dark:border-dark-700 focus:border-primary-500'
          )}
        />
      </div>
      {showError && (
        <p className="mt-1 text-sm text-red-500">
          {error || 'Enter valid Indian phone number'}
        </p>
      )}
      <style>{`
        .phone-input-custom .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          padding: 0;
          color: inherit;
          font-size: inherit;
        }
        .phone-input-custom .PhoneInputCountryIcon {
          width: 1.5rem;
          height: 1.5rem;
        }
      `}</style>
    </div>
  );
}

