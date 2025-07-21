import React from 'react';
import styles from './StatusSelector.module.css';

interface StatusSelectorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false
}) => {
  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.container}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.button} ${value === option.value ? styles.selected : ''}`}
            onClick={() => onChange(option.value)}
            disabled={disabled}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusSelector;