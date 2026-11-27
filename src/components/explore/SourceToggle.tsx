import type { JobSource } from '../../types/index.js';

interface SourceToggleProps {
  source: JobSource;
  onChange: (source: JobSource) => void;
}

const options: { id: JobSource; label: string }[] = [
  { id: 'remotive', label: 'Remotive (online)' },
  { id: 'fallback', label: 'Data Lokal' },
];

export default function SourceToggle({ source, onChange }: SourceToggleProps) {
  return (
    <div className="source-toggle" role="group" aria-label="Sumber data lowongan">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={source === option.id ? 'active' : ''}
          aria-pressed={source === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
