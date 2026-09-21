/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Clock, 
  Sparkles, 
  Play, 
  Square, 
  RotateCcw, 
  Copy, 
  Check, 
  X, 
  Volume2, 
  Loader2, 
  Sliders, 
  BookOpen, 
  Mic2, 
  Download, 
  AlertTriangle,
  Flame,
  Coffee,
  Tv,
  Radio,
  Key,
  ChevronDown,
  ChevronUp,
  Cpu,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Voice } from '../types';
import { 
  generateNarrativeText, 
  getActiveApiKey, 
  getSavedApiConfig, 
  saveApiConfig, 
  testApiConnection, 
  ApiConfig,
  ApiProvider 
} from '../services/aiService';
import AudioVisualizer from './AudioVisualizer';
import { GoogleGenAI, Modality } from "@google/genai";

interface NarrativeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: Voice[];
  onOpenApiKeyModal: () => void;
}

const PRESET_EXAMPLES = [
  {
    duration: 60,
    label: "60s • Documentário Natureza",
    topic: "A riqueza das águas e florestas do Brasil profundo",
    style: "Documentário / Cinema",
    text: "Nas primeiras horas da alvorada, a névoa suave se dissipa sobre as copas centenárias da floresta tropical. Aqui, onde os rios desenham veias de pura vida sobre a terra fértil, cada folha guarda um mistério milenar. Os cantos dos pássaros rompem o silêncio matinal, anunciando que mais um ciclo se inicia na maior biodiversidade do nosso planeta. Proteger esse santuário verde não é apenas preservar árvores e animais; é garantir o ar que respiramos, o equilíbrio das chuvas e o amanhã de todas as próximas gerações. Amazônia viva: o coração pulsante que sustenta a esperança do Brasil."
  },
  {
    duration: 70,
    label: "70s • Inovação e Futuro",
    topic: "A revolução da inteligência artificial transformando o trabalho e a vida humana",
    style: "Comercial / Publicitário",
    text: "O futuro não é um lugar distante onde vamos chegar; ele é aquilo que construímos juntos a cada decisão tomada hoje. Em um mundo que gira em velocidade recorde, a tecnologia não pode ser uma barreira de complexidade, mas sim a ponte mais humana para as suas conquistas. Nossas soluções de inteligência artificial foram desenhadas para entender o seu ritmo natural: antecipando desafios antes que eles apareçam, simplificando tarefas repetitivas e devolvendo a você aquilo que nenhuma máquina é capaz de criar: a sua criatividade, o seu foco estratégico e o seu tempo livre com quem você ama. Conecte-se agora à nova era da produtividade inteligente."
  },
  {
    duration: 80,
    label: "80s • História e Superação",
    topic: "A jornada inspiradora de um jovem empreendedor do interior do Brasil",
    style: "Storytelling / Histórias",
    text: "No começo de qualquer grande jornada, tudo o que você tem é uma ideia simples rabiscada no papel e uma vontade imensa de fazer dar certo. Foram incontáveis madrugadas silenciosas, portas que não se abriram de primeira e aquela incerteza inevitável que bate no peito quando o caminho parece incerto. Mas o brasileiro traz no sangue uma perseverança luminosa: a gente aprende a criar caminhos onde ninguém antes pisou. Cada erro ensinou uma lição preciosa; cada recomeço forjou uma coragem ainda mais sólida. E hoje, olhando para o impacto de cada vida transformada ao longo dessa caminhada, fica a certeza de que sonhar grande não é vaidade: é o único jeito de reinventar o próprio destino. Acredite no seu potencial."
  },
  {
    duration: 90,
    label: "90s • Crônica de Vida e Sonhos",
    topic: "Reflexão sobre raízes, passagem do tempo e as vitórias silenciosas de quem nunca desiste",
    style: "Storytelling / Histórias",
    text: "Quem olha para a linha de chegada de uma vitória raramente enxerga a poeira e o suor deixados nos primeiros passos da estrada. Lembra de quando era só um sonho tímido guardado no peito? Havia o cansaço do dia a dia, as dúvidas que teimavam em aparecer e aquela voz distante tentando te convencer a ficar na zona de conforto. Só que a coragem não é a ausência do medo; é a decisão consciente de seguir em frente mesmo com o coração acelerado. Você caiu, levantou, ajustou a rota e descobriu uma força que nem sabia que existia. Hoje, ao respirar fundo e contemplar a paisagem lá de cima, você compreende que a grande conquista nunca foi apenas a medalha ou o aplauso, mas a pessoa resiliente e generosa que você se tornou durante a escalada. Celebre cada cicatriz. O seu sonho é real, e esta é apenas a primeira página de um capítulo memorável."
  }
];

const STYLES = [
  { id: 'Comercial / Publicitário', label: 'Comercial / Publicidade', icon: Tv },
  { id: 'Documentário / Cinema', label: 'Documentário / Cinema', icon: Radio },
  { id: 'Storytelling / Histórias', label: 'Storytelling / Histórias', icon: BookOpen },
  { id: 'Redes Sociais / Reels', label: 'Redes Sociais / Reels', icon: Flame },
  { id: 'Meditação / Reflexão', label: 'Meditação / Reflexão', icon: Coffee },
];

export const NarrativeStudioModal: React.FC<NarrativeStudioModalProps> = ({
  isOpen,
  onClose,
  voices,
  onOpenApiKeyModal
}) => {
  // Duration state: strictly 60 to 90 seconds
  const [duration, setDuration] = useState<number>(60);
  const [style, setStyle] = useState<string>('Documentário / Cinema');
  const [pace, setPace] = useState<'calmo' | 'normal' | 'dinamico'>('normal');
  const [topicPrompt, setTopicPrompt] = useState<string>('');
  const [narrativeText, setNarrativeText] = useState<string>(PRESET_EXAMPLES[0].text);
  const [selectedVoice, setSelectedVoice] = useState<string>(voices[0]?.name || 'Aoede');

  // Inline API Key Panel State
  const [showInlineApiKey, setShowInlineApiKey] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(getSavedApiConfig());
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [copied, setCopied] = useState(false);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Pace speed factor in words per second
  const wordsPerSecond = useMemo(() => {
    switch (pace) {
      case 'calmo': return 2.0;      // 120 words/min
      case 'dinamico': return 2.65;   // 160 words/min
      default: return 2.33;          // 140 words/min (standard Brazilian Portuguese)
    }
  }, [pace]);

  // Target words calculated based on duration and pace
  const targetWords = useMemo(() => {
    return Math.round(duration * wordsPerSecond);
  }, [duration, wordsPerSecond]);

  // Current text metrics
  const wordCount = useMemo(() => {
    const trimmed = narrativeText.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [narrativeText]);

  // Estimated reading duration in seconds
  const estimatedSeconds = useMemo(() => {
    if (wordCount === 0) return 0;
    return Math.round(wordCount / wordsPerSecond);
  }, [wordCount, wordsPerSecond]);

  // Duration difference status
  const durationStatus = useMemo(() => {
    const diff = estimatedSeconds - duration;
    if (Math.abs(diff) <= 4) {
      return { status: 'ideal', label: 'Duração exata para o tempo alvo', color: 'text-emerald-600 dark:text-emerald-400' };
    } else if (diff < 0) {
      return { status: 'short', label: `Texto curto (${Math.abs(diff)}s abaixo de ${duration}s)`, color: 'text-amber-600 dark:text-amber-400' };
    } else {
      return { status: 'long', label: `Texto longo (${diff}s acima de ${duration}s)`, color: 'text-rose-600 dark:text-rose-400' };
    }
  }, [estimatedSeconds, duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

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

  const stopPlayback = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const handleSaveInlineKey = () => {
    saveApiConfig(apiConfig);
    setKeySavedMessage(true);
    setTimeout(() => setKeySavedMessage(false), 2000);
  };

  const handleTestInlineKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    const key = apiConfig.provider === 'gemini' ? apiConfig.geminiKey : apiConfig.nvidiaKey;
    const model = apiConfig.provider === 'nvidia' ? apiConfig.nvidiaModel : undefined;
    const res = await testApiConnection(apiConfig.provider, key, model);
    setTestResult(res);
    setIsTestingKey(false);
  };

  const handleGenerateScript = async () => {
    if (!topicPrompt.trim()) {
      setGenError('Por favor, informe um tema ou ideia para a narração.');
      return;
    }

    setIsGenerating(true);
    setGenError(null);
    stopPlayback();

    try {
      const generated = await generateNarrativeText({
        topic: topicPrompt,
        durationSeconds: duration,
        style,
        tone: pace === 'calmo' ? 'pausado, reflexivo e solene' : pace === 'dinamico' ? 'enérgico e contagiante' : 'envolvente, seguro e expressivo'
      });
      setNarrativeText(generated);
    } catch (err: any) {
      setGenError(err?.message || 'Falha ao gerar roteiro narrativo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadPreset = (preset: typeof PRESET_EXAMPLES[0]) => {
    stopPlayback();
    setDuration(preset.duration);
    setStyle(preset.style);
    setTopicPrompt(preset.topic);
    setNarrativeText(preset.text);
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (!narrativeText.trim()) return;

    setIsSynthesizing(true);
    setPlaybackTime(0);

    const active = getActiveApiKey();

    // 1. Try Gemini TTS if active key is available
    if (active.provider === 'gemini' && active.key) {
      try {
        const ai = new GoogleGenAI({ apiKey: active.key });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-pro-preview-tts",
          contents: { 
            parts: [{ 
              text: `Leia esta narração em Português do Brasil com ritmo equilibrado, tom ${style}: ${narrativeText}` 
            }] 
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
            },
          },
        });

        const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioBase64) {
          if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          } else if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
          }

          const binaryString = atob(audioBase64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);

          const dataInt16 = new Int16Array(bytes.buffer);
          const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
          const channelData = buffer.getChannelData(0);
          for (let i = 0; i < dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
          }

          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);

          source.onended = () => {
            stopPlayback();
          };

          sourceNodeRef.current = source;
          source.start();
          setIsPlaying(true);
          setIsSynthesizing(false);

          const startTime = Date.now();
          timerRef.current = window.setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            if (elapsed >= buffer.duration) {
              stopPlayback();
            } else {
              setPlaybackTime(elapsed);
            }
          }, 100);

          return;
        }
      } catch (err) {
        console.warn("Gemini TTS playback fallback:", err);
      }
    }

    // 2. High quality fallback: Browser SpeechSynthesis in pt-BR
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(narrativeText);
      utterance.lang = 'pt-BR';

      const voicesList = window.speechSynthesis.getVoices();
      const ptBrVoice = voicesList.find(v => v.lang === 'pt-BR' || v.lang.startsWith('pt')) || null;
      if (ptBrVoice) utterance.voice = ptBrVoice;

      utterance.rate = pace === 'calmo' ? 0.9 : pace === 'dinamico' ? 1.15 : 1.0;
      utterance.pitch = selectedVoice === 'Zephyr' || selectedVoice === 'Leda' ? 1.08 : selectedVoice === 'Charon' || selectedVoice === 'Fenrir' ? 0.88 : 1.0;

      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setPlaybackTime((Date.now() - startTime) / 1000);
      }, 100);

      utterance.onend = () => stopPlayback();
      utterance.onerror = () => stopPlayback();

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsSynthesizing(false);
    } else {
      setIsSynthesizing(false);
      alert('Seu navegador não suporta síntese de voz.');
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(narrativeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const content = `ROTEIRO NARRATIVO (${duration}s - Português Brasil)\nEstilo: ${style}\nTempo Estimado: ${estimatedSeconds}s | Palavras: ${wordCount}\n\n${narrativeText}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narracao_${duration}s_pt_br.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-4 bg-zinc-950/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="narrative-studio-title"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[92vh] bg-white dark:bg-zinc-900 sm:rounded-3xl border-0 sm:border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden shadow-2xl animate-slide-up"
      >
        {/* Header - Spacious and wrap-safe on mobile */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Clock size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 id="narrative-studio-title" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                  Texto Narrativo
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                  60s a 90s • PT-BR
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate">
                Roteiros completos calibrados para locuções de 60 a 90 segundos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {/* Toggle Inline API Key Settings */}
            <button
              onClick={() => setShowInlineApiKey(!showInlineApiKey)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                showInlineApiKey
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
              title="Configurar chave de API Gemini / NVIDIA"
            >
              <Key size={13} className="text-indigo-500 shrink-0" />
              <span className="hidden sm:inline">Chave API:</span>
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                {apiConfig.provider === 'nvidia' ? 'NVIDIA' : 'Gemini'}
              </span>
              {showInlineApiKey ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 custom-scrollbar">

          {/* INLINE API KEY CONFIGURATION ACCORDION (NVIDIA / GEMINI) */}
          {showInlineApiKey && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-700/60 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-100">
                  <Key size={15} className="text-indigo-500" />
                  <span>Configurar Chave de API (NVIDIA ou Gemini)</span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setApiConfig(prev => ({ ...prev, provider: 'gemini' }))}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      apiConfig.provider === 'gemini'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Google Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => setApiConfig(prev => ({ ...prev, provider: 'nvidia' }))}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      apiConfig.provider === 'nvidia'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    NVIDIA NIM
                  </button>
                </div>
              </div>

              {/* Input for Gemini Key */}
              {apiConfig.provider === 'gemini' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Chave de API Gemini
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={apiConfig.geminiKey}
                      onChange={(e) => setApiConfig({ ...apiConfig, geminiKey: e.target.value })}
                      className="flex-1 px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1"
                    >
                      Obter chave <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Input for NVIDIA Key */}
              {apiConfig.provider === 'nvidia' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Chave de API NVIDIA (NVIDIA NIM)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="password"
                        placeholder="nvapi-..."
                        value={apiConfig.nvidiaKey}
                        onChange={(e) => setApiConfig({ ...apiConfig, nvidiaKey: e.target.value })}
                        className="flex-1 px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <a
                        href="https://build.nvidia.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1"
                      >
                        Obter chave <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Modelo NVIDIA NIM
                    </label>
                    <select
                      value={apiConfig.nvidiaModel}
                      onChange={(e) => setApiConfig({ ...apiConfig, nvidiaModel: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="meta/llama-3.3-70b-instruct">meta/llama-3.3-70b-instruct (Recomendado)</option>
                      <option value="nvidia/llama-3.1-nemotron-70b-instruct">nvidia/llama-3.1-nemotron-70b-instruct</option>
                      <option value="mistralai/mistral-large-2-instruct">mistralai/mistral-large-2-instruct</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Actions & Feedback for API config */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50">
                <button
                  type="button"
                  onClick={handleTestInlineKey}
                  disabled={isTestingKey}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  {isTestingKey ? <Loader2 size={13} className="animate-spin text-indigo-500" /> : <RefreshCw size={13} />}
                  <span>Testar Conexão</span>
                </button>

                <div className="flex items-center gap-2">
                  {keySavedMessage && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check size={14} /> Salvo com sucesso!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveInlineKey}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    Salvar Chave
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}>
                  {testResult.success ? <Check size={15} /> : <AlertTriangle size={15} />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          {/* DURATION SLIDER & PRESETS (60s a 90s) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sliders size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                    Duração da Narração:
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-base sm:text-lg">
                    {duration} segundos
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Ideal para ~{targetWords} palavras faladas em ritmo {pace}
                </p>
              </div>

              {/* Cadence pace toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
                <span className="text-[10px] uppercase font-bold text-zinc-400 px-1.5">Ritmo:</span>
                {(['calmo', 'normal', 'dinamico'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPace(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      pace === p 
                        ? 'bg-zinc-900 dark:bg-emerald-600 text-white shadow-xs' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 60 to 90 seconds */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <span>60s (Mínimo)</span>
                <span>70s</span>
                <span>80s</span>
                <span>90s (Máximo)</span>
              </div>
              <input
                type="range"
                min={60}
                max={90}
                step={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Presets - Generously spaced, wraps naturally on mobile */}
            <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Exemplos Prontos (60s a 90s):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_EXAMPLES.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => loadPreset(preset)}
                    className={`p-2.5 rounded-xl text-left text-xs transition-all border ${
                      duration === preset.duration && narrativeText === preset.text
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-500 font-bold shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs leading-normal">{preset.label}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-1">{preset.style}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* AI GENERATOR BOX */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-zinc-900 dark:to-zinc-900 border border-indigo-100 dark:border-indigo-900/40 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={15} />
                <span>Gerar Roteiro Narrativo com IA ({duration}s)</span>
              </div>

              {/* Style selector: 2-columns on mobile, flex row on desktop to avoid cramped text */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
                {STYLES.map(s => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`flex items-center justify-center sm:justify-start gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all text-center sm:text-left ${
                        style === s.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon size={12} className="shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt input and button stack nicely on mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={topicPrompt}
                onChange={(e) => setTopicPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateScript();
                }}
                placeholder="Ex: Documentário sobre a preservação das baleias no litoral da Bahia..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isGenerating}
              />
              <button
                type="button"
                onClick={handleGenerateScript}
                disabled={isGenerating || !topicPrompt.trim()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition-all shrink-0"
              >
                {isGenerating ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                <span>{isGenerating ? 'Criando Roteiro...' : `Gerar Narração (${duration}s)`}</span>
              </button>
            </div>

            {genError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
                <AlertTriangle size={14} className="shrink-0" /> {genError}
              </p>
            )}
          </div>

          {/* TEXTAREA & LIVE METRICS (NO SQUEEZED WORDS) */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                  Texto da Narração (PT-BR)
                </span>
                <span className="text-zinc-400">
                  {wordCount} palavras • {narrativeText.length} caracteres
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`font-semibold flex items-center gap-1 text-xs ${durationStatus.color}`}>
                  {durationStatus.status === 'ideal' ? <Check size={14} /> : <Clock size={14} />}
                  <span>{durationStatus.label} (~{estimatedSeconds}s estimados)</span>
                </span>
              </div>
            </div>

            {/* Textarea with ample line height and clean wrapping */}
            <textarea
              value={narrativeText}
              onChange={(e) => setNarrativeText(e.target.value)}
              rows={7}
              placeholder="Digite ou cole aqui o seu texto narrativo de 60 a 90 segundos em Português do Brasil..."
              className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/95 text-zinc-900 dark:text-white text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner resize-y transition-all font-sans whitespace-pre-wrap break-words"
            />
          </div>

          {/* AUDIO PLAYER & SIK-DESIGNED ACTIONS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Voice selector */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <Mic2 size={16} />
                </div>
                <div className="flex-1 sm:flex-initial">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Voz de Locução
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    disabled={isPlaying || isSynthesizing}
                    className="w-full sm:w-auto bg-zinc-800 text-white text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.analysis.gender} • {v.pitch})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main Play/Stop Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                <button
                  onClick={handleTogglePlay}
                  disabled={isSynthesizing || !narrativeText.trim()}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 transform active:scale-95 ${
                    isPlaying 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                  } ${isSynthesizing ? 'opacity-75 cursor-wait' : ''}`}
                >
                  {isSynthesizing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : isPlaying ? (
                    <Square size={16} className="fill-current" />
                  ) : (
                    <Play size={16} className="fill-current ml-0.5" />
                  )}
                  <span>
                    {isSynthesizing ? 'Sintetizando...' : isPlaying ? 'Parar Locução' : `Ouvir Narração (${duration}s)`}
                  </span>
                </button>

                {isPlaying && (
                  <button
                    onClick={() => {
                      stopPlayback();
                      setTimeout(handleTogglePlay, 200);
                    }}
                    className="p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    title="Reiniciar Narração"
                  >
                    <RotateCcw size={15} />
                  </button>
                )}
              </div>

              {/* Actions: Copy & Download */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                  title="Copiar texto narrativo"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                  title="Baixar roteiro como .txt"
                >
                  <Download size={13} />
                  <span>Baixar .txt</span>
                </button>
              </div>

            </div>

            {/* Visualizer & Progress bar */}
            <div className="relative h-14 bg-zinc-950/80 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
              {isPlaying ? (
                <div className="w-full h-full">
                  <AudioVisualizer isPlaying={true} color="#10b981" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium px-2 text-center">
                  <Volume2 size={15} className="shrink-0" />
                  <span>Toque em "Ouvir Narração" para testar o ritmo da voz em {duration} segundos</span>
                </div>
              )}

              {isPlaying && (
                <div className="absolute top-2 right-3 text-[11px] font-mono text-emerald-400 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                  {playbackTime.toFixed(1)}s / {duration}s
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span>Intervalo: <strong>60s a 90s</strong></span>
            <span>•</span>
            <span className="hidden sm:inline">Cronometragem métrica para locução</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

export default NarrativeStudioModal;
