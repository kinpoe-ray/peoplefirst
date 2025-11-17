import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  debounceMs?: number;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = '搜索...',
  isLoading = false,
  debounceMs = 300,
  className = '',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle input change with debounce
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced update
    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  // Handle clear button
  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-ember animate-spin" />
        ) : (
          <Search className="w-5 h-5 text-textSecondary" />
        )}
      </div>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3 bg-charcoal border border-slate rounded-xl text-ivory placeholder-textTertiary focus:outline-none focus:border-ember/50 focus:ring-2 focus:ring-ember/20 transition-all duration-200"
        aria-label={placeholder}
      />

      {/* Clear Button */}
      {localValue && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md text-textTertiary hover:text-ember hover:bg-ember/10 transition-all duration-200"
          aria-label="清除搜索"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
