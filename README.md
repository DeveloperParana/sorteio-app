# 🎯 Sorteio App

App web para realizar sorteios a partir de dados importados de CSV (Google Forms/Sheets). Importe participantes, selecione campos, cadastre prêmios e sorteie ganhadores com animação!

## ✨ Funcionalidades

- **📥 Importar CSV** — upload de arquivo ou URL pública do Google Sheets
- **✅ Selecionar campos** — escolha quais colunas manter (ex: nome, email)
- **🏆 Cadastrar prêmios** — crie e reordene a lista de prêmios
- **🎲 Sortear** — animação tipo slot machine com nomes girando antes de revelar o ganhador
- Cada pessoa só ganha **uma vez** (removida do pool após sorteio)
- Resumo completo ao final: prêmio → ganhador

## 🚀 Como usar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📋 Fluxo

1. **Importar** → Suba um `.csv` ou cole a URL de uma planilha Google (publicada na web)
2. **Campos** → Selecione quais colunas quer manter
3. **Prêmios** → Cadastre os prêmios na ordem do sorteio
4. **Sortear** → Clique em "Sortear!" e veja a animação revelar o ganhador

## 🛠️ Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Papa Parse](https://www.papaparse.com/) (parsing de CSV)
- TypeScript

## 📂 Estrutura

```
src/
├── app/
│   ├── page.tsx                 # Página principal (wizard)
│   └── api/fetch-csv/route.ts   # Proxy para Google Sheets
├── components/
│   ├── Wizard.tsx               # Barra de progresso + container
│   ├── StepImport.tsx           # Step 1: upload/URL
│   ├── StepSelectFields.tsx     # Step 2: seleção de campos
│   ├── StepPrizes.tsx           # Step 3: cadastro de prêmios
│   ├── StepRaffle.tsx           # Step 4: sorteio + resultados
│   ├── FileDropZone.tsx         # Drag & drop de arquivo
│   ├── DataPreview.tsx          # Preview em tabela
│   └── SlotMachineAnimation.tsx # Animação do sorteio
└── lib/
    ├── types.ts                 # Tipos TypeScript
    ├── csv-parser.ts            # Parsing de CSV
    └── sheets-url.ts            # Conversão de URL do Sheets
```

## 🧪 Testes

```bash
npm test
```

## 📝 Licença

MIT
