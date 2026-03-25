import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Priority, Status } from '../types';
import { USERS } from '../data/seed';
import { Filter, X, ChevronDown, Check } from 'lucide-react';

interface MultiSelectProps<T extends string> {
  label: string;
  options: { label: string; value: T }[];
  selected: T[];
  onChange: (selected: T[]) => void;
}

function MultiSelect<T extends string>({ label, options, selected, onChange }: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: T) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border ${selected.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
      >
        {label} {selected.length > 0 && <span className="ml-1 bg-blue-100 text-blue-800 px-1.5 rounded-full text-xs">{selected.length}</span>}
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 sm:w-56 w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden flex flex-col max-h-60">
          <div className="overflow-y-auto p-1">
            {options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <div 
                  key={option.value} 
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleOption(option.value);
                  }}
                >
                  <div className={`flex items-center justify-center w-4 h-4 rounded border ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {checked && <Check size={12} className="text-white" />}
                  </div>
                  <span className="text-sm text-gray-700 select-none block truncate">{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterBar() {
  const { filters, setFilters, clearFilters } = useStore();

  const isFiltered = Object.values(filters).some(val => Array.isArray(val) ? val.length > 0 : val !== null);

  const statusOptions = Object.values(Status).map(s => ({ label: s, value: s }));
  const priorityOptions = Object.values(Priority).map(p => ({ label: p, value: p }));
  const assigneeOptions = USERS.map(u => ({ label: u.name, value: u.id }));

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 p-4 bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-gray-500 pb-1 sm:pb-0 font-medium">
        <Filter size={16} /> Filters
      </div>
      
      <MultiSelect
        label="Status"
        options={statusOptions}
        selected={filters.status}
        onChange={(status) => setFilters({ status })}
      />
      
      <MultiSelect
        label="Priority"
        options={priorityOptions}
        selected={filters.priority}
        onChange={(priority) => setFilters({ priority })}
      />
      
      <MultiSelect
        label="Assignee"
        options={assigneeOptions}
        selected={filters.assignee}
        onChange={(assignee) => setFilters({ assignee })}
      />

      <div className="flex items-center gap-2 text-sm text-gray-700 ml-0 sm:ml-auto w-full sm:w-auto mt-2 sm:mt-0">
        <input
          type="date"
          className="border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
          value={filters.dateFrom || ''}
          onChange={(e) => setFilters({ dateFrom: e.target.value || null })}
          title="From Due Date"
        />
        <span className="text-gray-400">to</span>
        <input
          type="date"
          className="border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
          value={filters.dateTo || ''}
          onChange={(e) => setFilters({ dateTo: e.target.value || null })}
          title="To Due Date"
        />
      </div>

      {isFiltered && (
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1 w-full sm:w-auto mt-2 sm:mt-0 px-2 py-1"
        >
          <X size={14} /> Clear all
        </button>
      )}
    </div>
  );
}
