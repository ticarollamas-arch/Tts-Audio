# Gemini Voice Library

Uma aplicação moderna e intuitiva para exploração, audição e casting inteligente de vozes com Inteligência Artificial para Text-to-Speech (TTS), com estúdio integrado de geração de roteiros narrativos (60 a 90 segundos) em Português do Brasil.

---

## 🌟 Funcionalidades

- **Biblioteca Interativa de Vozes**: Navegue pelas vozes em visualização Carrossel 3D imersivo ou Grade completa, com reprodução e visualizador de áudio em tempo real.
- **AI Casting**: Descreva o tom, emoção, gênero ou projeto desejado e receba recomendações precisas de vozes correspondentes.
- **Estúdio de Texto Narrativo (60-90s)**: Gere narrativas, histórias e roteiros cronometrados para 60 a 90 segundos de locução natural em Português do Brasil (PT-BR).
- **Suporte Multi-Provedor**:
  - **Google Gemini**: Geração de roteiros, recomendações de casting e síntese de áudio TTS via modelo Gemini Flash.
  - **NVIDIA NIM**: Integração com modelos Llama 3.3 70B Instruct para criação de textos e roteiros.
- **Filtros Avançados**: Filtre vozes por gênero (Masculino, Feminino), tom/pitch (Grave, Médio, Agudo) e busca instantânea.
- **Tema Claro / Escuro**: Alternância elegante entre modo claro e escuro.
- **Interface Responsiva**: Otimizada para desktop, tablets e smartphones.

---

## 🚀 Tecnologias Utilizadas

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide React** (Ícones)
- **@google/genai** SDK

---

## 📦 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm, yarn ou bun

### Instalação

1. Clone este repositório:
```bash
git clone https://github.com/seu-usuario/gemini-voice-library.git
cd gemini-voice-library
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra no seu navegador:
```
http://localhost:3000
```

---

## 🔑 Configuração de Chaves de API

A aplicação permite configurar suas chaves de API diretamente na interface ou via arquivo de ambiente:

- **Chave Gemini**: Obtenha sua chave no console Gemini e configure no modal de chaves na interface ou no arquivo `.env`:
  ```env
  GEMINI_API_KEY=sua_chave_aqui
  ```
- **Chave NVIDIA NIM (Opcional)**: Caso prefira utilizar a API da NVIDIA para geração de narrativas, adicione sua chave através do botão **API** no cabeçalho da aplicação.

---

## 🛠️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor local de desenvolvimento.
- `npm run build`: Compila a aplicação para produção na pasta `dist/`.
- `npm run preview`: Executa o servidor de pré-visualização do pacote de produção.

---

## 📄 Licença

Distribuído sob a licença Apache-2.0.
