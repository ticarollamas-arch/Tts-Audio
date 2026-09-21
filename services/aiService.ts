/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from "@google/genai";

export type ApiProvider = 'gemini' | 'nvidia';

export interface ApiConfig {
  provider: ApiProvider;
  geminiKey: string;
  nvidiaKey: string;
  nvidiaModel: string;
}

const STORAGE_KEY = 'voice_library_api_config';

export function getSavedApiConfig(): ApiConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        provider: parsed.provider || 'gemini',
        geminiKey: parsed.geminiKey || '',
        nvidiaKey: parsed.nvidiaKey || '',
        nvidiaModel: parsed.nvidiaModel || 'meta/llama-3.3-70b-instruct'
      };
    }
  } catch (e) {
    console.error("Failed to load API config from localStorage", e);
  }

  const envKey = (typeof process !== 'undefined' && (process.env?.API_KEY || process.env?.GEMINI_API_KEY)) || '';
  return {
    provider: 'gemini',
    geminiKey: envKey,
    nvidiaKey: '',
    nvidiaModel: 'meta/llama-3.3-70b-instruct'
  };
}

export function saveApiConfig(config: ApiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save API config to localStorage", e);
  }
}

export function getActiveApiKey(): { provider: ApiProvider; key: string; model: string } {
  const config = getSavedApiConfig();
  const envKey = (typeof process !== 'undefined' && (process.env?.API_KEY || process.env?.GEMINI_API_KEY)) || '';

  if (config.provider === 'nvidia') {
    return {
      provider: 'nvidia',
      key: config.nvidiaKey.trim(),
      model: config.nvidiaModel || 'meta/llama-3.3-70b-instruct'
    };
  }

  return {
    provider: 'gemini',
    key: config.geminiKey.trim() || envKey,
    model: 'gemini-3.8-flash'
  };
}

export async function testApiConnection(provider: ApiProvider, key: string, nvidiaModel?: string): Promise<{ success: boolean; message: string }> {
  if (!key.trim()) {
    return { success: false, message: 'Chave de API não informada.' };
  }

  if (provider === 'gemini') {
    try {
      const ai = new GoogleGenAI({ apiKey: key.trim() });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Diga "Conexão OK" em português.',
      });
      if (response.text) {
        return { success: true, message: 'Conexão com Gemini estabelecida com sucesso!' };
      }
      return { success: false, message: 'Nenhuma resposta retornada pela API Gemini.' };
    } catch (err: any) {
      return { success: false, message: `Erro Gemini: ${err?.message || 'Falha na autenticação'}` };
    }
  }

  if (provider === 'nvidia') {
    try {
      const model = nvidiaModel || 'meta/llama-3.3-70b-instruct';
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Diga apenas "Conexão NVIDIA OK".' }],
          max_tokens: 32,
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, message: `Erro NVIDIA (${res.status}): ${errJson?.error?.message || res.statusText}` };
      }

      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        return { success: true, message: 'Conexão com NVIDIA NIM estabelecida com sucesso!' };
      }
      return { success: false, message: 'Resposta vazia da API NVIDIA.' };
    } catch (err: any) {
      return { success: false, message: `Erro de rede NVIDIA: ${err?.message || 'Falha ao conectar'}` };
    }
  }

  return { success: false, message: 'Provedor desconhecido.' };
}

export interface NarrativeGenerationParams {
  topic: string;
  durationSeconds: number; // 60 to 90
  style: string;
  tone: string;
}

export async function generateNarrativeText(params: NarrativeGenerationParams): Promise<string> {
  const { provider, key, model } = getActiveApiKey();
  const { topic, durationSeconds, style, tone } = params;

  // Em Português do Brasil, a velocidade média de narração é de aproximadamente 2.2 a 2.4 palavras por segundo (130-145 palavras por minuto).
  const wordsPerSecond = 2.3;
  const targetWords = Math.max(120, Math.round(durationSeconds * wordsPerSecond));
  const minWords = Math.max(100, Math.round(targetWords * 0.88));
  const maxWords = Math.round(targetWords * 1.12);

  const prompt = `
Você é um roteirista e diretor de voz brasileiro profissional de alto nível.
Crie um TEXTO NARRATIVO em PORTUGUÊS DO BRASIL (pt-BR) projetado com precisão cronometrada para ser falado em EXATAMENTE ${durationSeconds} segundos (intervalo de 60 a 90 segundos).

Parâmetros:
- Duração exata desejada da locução: ${durationSeconds} segundos
- Quantidade recomendada de palavras: entre ${minWords} e ${maxWords} palavras (média de ${targetWords} palavras)
- Estilo narrativo: ${style}
- Tom de voz: ${tone}
- Tema / Assunto: "${topic}"

Instruções cruciais:
1. O texto deve soar completamente natural, envolvente e idiomático no Português do Brasil contemporâneo.
2. Como se trata de uma narração longa (${durationSeconds}s), construa uma introdução envolvente, desenvolvimento fluido e um encerramento marcante.
3. Não inclua títulos, metadados, indicações de palco, rubricas ou notas do diretor no texto final.
4. Forneça APENAS o texto puro pronto para ser lido pelo locutor.
5. Ajuste a pontuação (vírgulas, reticências, pausas respiratórias) para conduzir o ritmo perfeito da fala para preencher os ${durationSeconds} segundos.
`;

  if (provider === 'nvidia' && key) {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Você é um roteirista e diretor de locução profissional especializado em roteiros em Português do Brasil com cronometragem milimétrica.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro na API NVIDIA (${res.status})`);
    }

    const data = await res.json();
    const generated = data?.choices?.[0]?.message?.content?.trim();
    if (!generated) throw new Error('Nenhum texto gerado pela NVIDIA NIM.');
    return generated.replace(/^["']|["']$/g, '');
  }

  // Padrão: Gemini
  const activeGeminiKey = key || (typeof process !== 'undefined' ? (process.env?.API_KEY || process.env?.GEMINI_API_KEY) : '');
  if (!activeGeminiKey) {
    throw new Error('Chave da API Gemini não configurada. Por favor, insira sua chave no menu de configurações.');
  }

  const ai = new GoogleGenAI({ apiKey: activeGeminiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });

  const output = response.text?.trim();
  if (!output) throw new Error('Nenhum texto gerado pelo Gemini.');
  return output.replace(/^["']|["']$/g, '');
}
