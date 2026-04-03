"use client";

import { useState, useEffect, useRef } from "react";

interface Option {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  placeholder?: string;
  apiUrl: string;
  value: string;
  onChange: (id: string, label: string) => void;
  renderOption?: (option: Option) => React.ReactNode;
}

export function SearchableSelect({
  placeholder = "Buscar...",
  apiUrl,
  value,
  onChange,
}: SearchableSelectProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(q: string) {
    setQuery(q);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.length < 2) {
      setOptions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        const data = json.data ?? [];
        setOptions(
          data.map((item: any) => ({
            id: item.id,
            label: item.nombre,
            sublabel: `RFC: ${item.rfc} · CP: ${item.cp}`,
          }))
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(option: Option) {
    onChange(option.id, option.label);
    setSelectedLabel(option.label);
    setQuery("");
    setOpen(false);
  }

  function handleClear() {
    onChange("", "");
    setSelectedLabel("");
    setQuery("");
  }

  return (
    <div ref={wrapperRef} className="relative">
      {value && selectedLabel ? (
        <div className="flex items-center h-9 rounded-md border border-[#DDE3EC] px-3 bg-[#F8F9FB]">
          <span className="text-sm text-[#0F1F3D] flex-1 truncate">{selectedLabel}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-[#8A96A8] hover:text-red-500 ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder}
          className="flex h-9 w-full rounded-md border border-[#DDE3EC] bg-white px-3 text-sm placeholder:text-[#8A96A8] focus:outline-none focus:ring-2 focus:ring-[#E85D04] focus:ring-offset-1"
        />
      )}

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-md border border-[#DDE3EC] shadow-lg max-h-48 overflow-auto">
          {loading && (
            <div className="px-3 py-2 text-xs text-[#8A96A8]">Buscando...</div>
          )}
          {!loading && query.length >= 2 && options.length === 0 && (
            <div className="px-3 py-2 text-xs text-[#8A96A8]">No se encontraron resultados</div>
          )}
          {!loading && query.length < 2 && (
            <div className="px-3 py-2 text-xs text-[#8A96A8]">Escribe al menos 2 caracteres</div>
          )}
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              className="w-full text-left px-3 py-2 hover:bg-[#F8F9FB] transition-colors border-b border-[#EEF1F6] last:border-b-0"
            >
              <div className="text-sm text-[#0F1F3D] font-medium">{opt.label}</div>
              {opt.sublabel && (
                <div className="text-xs text-[#8A96A8] font-mono">{opt.sublabel}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
