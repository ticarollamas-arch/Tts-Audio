/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FilterState } from '../types';
import { 
  Search, 
  Sparkles, 
  ChevronDown, 
  Mic, 
  LayoutGrid, 
  GalleryHorizontalEnd, 
  Sun, 
  Moon, 
  Clock, 
  Key,
  SlidersHorizontal,
  X,
  RotateCcw
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  uniqueGenders: string[];
  uniquePitches: string[];
  onOpenAiCasting: () => void;
  onOpenNarrativeStudio: () => void;
  onOpenApiKeyModal: () => void;
  activeProvider?: 'gemini' | 'nvidia';
  viewMode: 'carousel' | 'grid';
  onViewModeChange: (mode: 'carousel' | 'grid') => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  onFilterChange, 
  uniqueGenders, 
  uniquePitches,
  onOpenAiCasting,
  onOpenNarrativeStudio,
  onOpenApiKeyModal,
  activeProvider = 'gemini',
  viewMode,
  onViewModeChange,
  isDarkMode,
  toggleTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, gender: e.target.value });
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, pitch: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({ gender: 'All', pitch: 'All', search: '' });
  };

  const hasActiveFilters = filters.gender !== 'All' || filters.pitch !== 'All' || filters.search.trim() !== '';

  return (
    <div className="relative z-50 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16">
        <div className="flex items-center justify-between h-full gap-2">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center shadow-md shadow-zinc-900/10 shrink-0">
              <Mic size={16} className="text-white dark:text-zinc-900" />
            </div>
            <h1 className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-zinc-900 dark:text-white font-display whitespace-nowrap">
              <span className="hidden sm:inline">Gemini Voice Library</span>
              <span className="sm:hidden font-semibold">Gemini Voice</span>
            </h1>
          </div>

          {/* Desktop Navigation & Actions (Visible on md and up) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Texto Narrativo */}
            <button 
              onClick={onOpenNarrativeStudio}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Texto narrativo de 60 a 90 segundos em Português Brasil"
            >
              <Clock size={14} className="text-emerald-200" />
              <span>Texto Narrativo (60-90s)</span>
            </button>

            {/* AI Casting */}
            <button 
              onClick={onOpenAiCasting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-500 text-white rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Sparkles size={14} className="text-indigo-300 dark:text-indigo-100" />
              <span>AI Casting</span>
            </button>

            {/* API Config */}
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-full text-xs font-semibold border border-zinc-200 dark:border-zinc-700 transition-all shrink-0"
              title="Configurar chave de API Gemini ou NVIDIA"
            >
              <Key size={13} className="text-indigo-500" />
              <span>API:</span>
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded shadow-2xs">
                {activeProvider === 'nvidia' ? 'NVIDIA' : 'Gemini'}
              </span>
            </button>
          </div>

          {/* Desktop Right Side: Search, Filters, View & Theme */}
          <div className="hidden md:flex items-center gap-2 justify-end">
            {/* Search Input */}
            <div className="relative group w-40 lg:w-56 transition-all">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder="Buscar vozes..."
                value={filters.search}
                onChange={handleSearchChange}
                className="block w-full pl-8 pr-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 border-transparent focus:bg-white dark:focus:bg-zinc-900 border focus:border-indigo-300 dark:focus:border-indigo-600 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1.5 shrink-0">
              <div className="relative">
                <select
                  value={filters.gender}
                  onChange={handleGenderChange}
                  className="appearance-none bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 py-1.5 pl-2.5 pr-6 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="All">Gênero: Todos</option>
                  {uniqueGenders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-zinc-400">
                  <ChevronDown size={11} />
                </div>
              </div>

              <div className="relative">
                <select
                  value={filters.pitch}
                  onChange={handlePitchChange}
                  className="appearance-none bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 py-1.5 pl-2.5 pr-6 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="All">Tom: Todos</option>
                  {uniquePitches.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-zinc-400">
                  <ChevronDown size={11} />
                </div>
              </div>
            </div>

            {/* View Mode */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => onViewModeChange('carousel')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'carousel' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-600'}`}
                title="Visualização 3D"
              >
                <GalleryHorizontalEnd size={14} />
              </button>
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-600'}`}
                title="Grade de Vozes"
              >
                <LayoutGrid size={14} />
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              title={isDarkMode ? "Tema Claro" : "Tema Escuro"}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>

          {/* MOBILE ONLY: Minimal, clean, spacious action row (< md) */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Texto Narrativo (Compact pill on mobile) */}
            <button 
              onClick={onOpenNarrativeStudio}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95 whitespace-nowrap"
              title="Texto Narrativo (60 a 90 segundos)"
            >
              <Clock size={13} className="text-emerald-200" />
              <span>60-90s</span>
            </button>

            {/* AI Casting (Compact) */}
            <button 
              onClick={onOpenAiCasting}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95"
              title="AI Casting Director"
            >
              <Sparkles size={13} className="text-indigo-300" />
              <span>Casting</span>
            </button>

            {/* Mobile Drawer / Filter Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl border transition-all ${
                isMobileMenuOpen || hasActiveFilters
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
              }`}
              aria-label="Abrir menu de opções e filtros"
              title="Mais opções e filtros"
            >
              {isMobileMenuOpen ? (
                <X size={16} />
              ) : (
                <div className="relative">
                  <SlidersHorizontal size={16} />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE EXPANDABLE MENU: Clean, organized dropdown when requested */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-4 space-y-3.5 shadow-xl animate-slide-down">
          
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, tom ou estilo..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-8 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {filters.search && (
              <button 
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Gênero
              </label>
              <select
                value={filters.gender}
                onChange={handleGenderChange}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 py-2 px-2.5 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="All">Todos os Gêneros</option>
                {uniqueGenders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Tom de Voz
              </label>
              <select
                value={filters.pitch}
                onChange={handlePitchChange}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 py-2 px-2.5 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="All">Todos os Tons</option>
                {uniquePitches.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Controls: API, View Mode, Theme */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
            
            {/* API Config Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenApiKeyModal();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
            >
              <Key size={13} className="text-indigo-500" />
              <span>Chaves de API</span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-1 py-0.2 rounded">
                {activeProvider === 'nvidia' ? 'NVIDIA' : 'Gemini'}
              </span>
            </button>

            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => onViewModeChange('carousel')}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    viewMode === 'carousel' 
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' 
                      : 'text-zinc-400'
                  }`}
                >
                  <GalleryHorizontalEnd size={14} />
                </button>
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' 
                      : 'text-zinc-400'
                  }`}
                >
                  <LayoutGrid size={14} />
                </button>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
                title={isDarkMode ? "Tema Claro" : "Tema Escuro"}
              >
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </div>

          {/* Clear filters if active */}
          {hasActiveFilters && (
            <div className="pt-1 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw size={12} /> Limpar todos os filtros
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default FilterBar;
