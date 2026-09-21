/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Key, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  ExternalLink, 
  Cpu, 
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { 
  ApiConfig, 
  getSavedApiConfig, 
  saveApiConfig, 
  testApiConnection,
  ApiProvider 
} from '../services/aiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const NVIDIA_MODELS = [
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct (Recomendado)' },
  { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'NVIDIA Llama 3.1 Nemotron 70B' },
  { id: 'mistralai/mistral-large-2-instruct', name: 'Mistral Large 2 Instruct' },
  { id: 'deepseek-ai/deepseek-r1', name: 'DeepSeek R1 (NVIDIA NIM)' },
];

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [config, setConfig] = useState<ApiConfig>(getSavedApiConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getSavedApiConfig());
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const key = config.provider === 'gemini' ? config.geminiKey : config.nvidiaKey;
    const model = config.provider === 'nvidia' ? config.nvidiaModel : undefined;
    
    const res = await testApiConnection(config.provider, key, model);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = () => {
    saveApiConfig(config);
    setSavedSuccess(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-slide-up"
        ref={modalRef}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <Key size={20} />
            </div>
            <div>
              <h2 id="api-modal-title" className="text-lg font-bold text-zinc-900 dark:text-white">
                Configuração de API
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Insira sua chave do Google Gemini ou NVIDIA NIM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Provider Switch Tabs */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => {
                setConfig(prev => ({ ...prev, provider: 'gemini' }));
                setTestResult(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                config.provider === 'gemini'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Sparkles size={15} />
              <span>Google Gemini</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setConfig(prev => ({ ...prev, provider: 'nvidia' }));
                setTestResult(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                config.provider === 'nvidia'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Cpu size={15} />
              <span>NVIDIA NIM</span>
            </button>
          </div>

          {/* Gemini Settings */}
          {config.provider === 'gemini' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2">
                  Chave de API Gemini
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={config.geminiKey}
                    onChange={(e) => setConfig({ ...config, geminiKey: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Usada para o Casting, TTS e geração de roteiros narrativos.</span>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    Obter chave Gemini <ExternalLink size={12} />
                  </a>
                </p>
              </div>

              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <span>
                  Sua chave fica armazenada com segurança localmente no seu navegador e é enviada diretamente aos serviços de IA.
                </span>
              </div>
            </div>
          )}

          {/* NVIDIA Settings */}
          {config.provider === 'nvidia' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2">
                  Chave de API NVIDIA (NVIDIA NIM)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="nvapi-..."
                    value={config.nvidiaKey}
                    onChange={(e) => setConfig({ ...config, nvidiaKey: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Endpoints hospedados em integrate.api.nvidia.com</span>
                  <a 
                    href="https://build.nvidia.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    Obter chave NVIDIA <ExternalLink size={12} />
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2">
                  Modelo NVIDIA NIM
                </label>
                <select
                  value={config.nvidiaModel}
                  onChange={(e) => setConfig({ ...config, nvidiaModel: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {NVIDIA_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <Cpu size={16} className="shrink-0 mt-0.5" />
                <span>
                  O modelo NVIDIA NIM será utilizado para gerar textos narrativos de 1 a 90 segundos em Português do Brasil com altíssima qualidade de redação.
                </span>
              </div>
            </div>
          )}

          {/* Test Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-300'
              }`}
            >
              {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
              <span className="flex-1">{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || (config.provider === 'gemini' ? !config.geminiKey : !config.nvidiaKey)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {testing ? (
              <Loader2 size={14} className="animate-spin text-indigo-500" />
            ) : (
              <RefreshCw size={14} />
            )}
            <span>Testar Conexão</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              {savedSuccess ? <Check size={14} /> : null}
              <span>{savedSuccess ? 'Salvo!' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
