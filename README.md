# 🤖 VAPI Dashboard

Monitor de agentes em tempo real — otimizado para TV e telas grandes.

Mostra todos os seus assistentes VAPI de múltiplas organizações, com avatares animados que "falam" quando estão em chamada.

---

## 🚀 Como usar

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure suas organizações

Copie o arquivo de exemplo e edite com suas API keys:

```bash
cp orgs.config.example.js orgs.config.js
```

Edite `orgs.config.js`:

```js
module.exports = [
  {
    name: "Nome da Org",
    apiKey: "sk-vapi-sua-chave-aqui",
    color: "#6366f1"   // opcional — cor accent do avatar
  },
  // ... adicione todas as suas organizações
]
```

> ⚠️ **Nunca** faça commit do `orgs.config.js` — ele contém suas API keys.

### 3. Inicie em modo desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:5173**

---

## 📺 Usar na TV

### Opção A — Build para produção (recomendado para TV)

```bash
npm run build
npm start
```

Acesse no navegador da TV: `http://IP_DO_COMPUTADOR:3001`

### Opção B — Modo desenvolvimento com acesso na rede

```bash
# Em vite.config.js, adicione host: true no server:
# server: { host: true, port: 5173, proxy: ... }
npm run dev
```

---

## 🔄 Como funciona

- O **servidor Express** (`server.js`) faz as chamadas à API do VAPI usando suas chaves privadas (as chaves nunca chegam ao browser).
- O **React frontend** consulta o servidor a cada **15 segundos** e atualiza o dashboard.
- Agentes **em chamada** aparecem primeiro na grade, com avatar animado falando e anel verde pulsante.
- O **avatar SVG** tem animação de:
  - Boca abrindo/fechando quando em chamada
  - Olhos piscando quando idle
  - Headset aparecendo quando em chamada
  - Ondas sonoras ao lado quando falando

---

## 📁 Estrutura

```
vapi-dashboard/
├── server.js              # Backend Express (proxy VAPI)
├── orgs.config.js         # SUA CONFIGURAÇÃO (não versionar!)
├── orgs.config.example.js # Exemplo de configuração
├── src/
│   ├── App.jsx            # Componente principal
│   ├── index.css          # Estilos (tema dark para TV)
│   ├── components/
│   │   ├── Avatar.jsx     # Avatar SVG animado
│   │   ├── AssistantCard.jsx  # Card de cada agente
│   │   └── Header.jsx     # Cabeçalho com estatísticas
│   └── hooks/
│       └── useVapiMonitor.js  # Hook de polling da API
└── vite.config.js
```

---

## 🛠️ Requisitos

- Node.js 18+
- npm 8+
- API keys do VAPI (uma por organização — obtenha em https://dashboard.vapi.ai/org/api-keys)
