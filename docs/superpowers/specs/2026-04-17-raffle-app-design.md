# Little Tiger v2 — App de Sorteio com CSV

## Visão Geral

App web para realizar sorteios a partir de dados importados de CSV (Google Forms). O usuário sobe um CSV ou cola uma URL pública do Google Sheets, seleciona os campos que deseja manter (ex: nome e email), cadastra uma lista de prêmios, e realiza sorteios com animação visual.

## Stack Tecnológica

- **Framework**: Next.js 14+ (App Router)
- **Estilo**: Tailwind CSS
- **Parsing CSV**: papaparse
- **Estado**: React useState (em memória, sem persistência)
- **Deploy**: qualquer plataforma que suporte Next.js (Vercel, etc.)

## Arquitetura

### Estrutura do App

Página única (`/`) com um componente `Wizard` que gerencia 4 etapas sequenciais. Todo o estado vive no componente raiz via `useState` — não há banco de dados. Dados são descartados ao fechar o navegador.

### API Route

Uma API route do Next.js (`/api/fetch-csv`) serve como proxy para buscar CSV de URLs públicas do Google Sheets, evitando problemas de CORS no browser. Recebe a URL do Sheets, converte para formato CSV export, faz o fetch server-side, e retorna o conteúdo CSV.

### Modelo de Dados (em memória)

```typescript
// Dados parseados do CSV
type RawData = Record<string, string>[];

// Campos selecionados pelo usuário
type SelectedFields = string[];

// Participante filtrado
type Participant = Record<string, string>;

// Prêmio
interface Prize {
  id: string;
  name: string;
  winner?: Participant;
}

// Estado global do wizard
interface AppState {
  step: 1 | 2 | 3 | 4;
  rawData: RawData;
  headers: string[];
  selectedFields: SelectedFields;
  participants: Participant[];
  prizes: Prize[];
  currentPrizeIndex: number;
  remainingParticipants: Participant[];
}
```

## Fluxo do Usuário (4 Etapas)

### Step 1 — Importação de Dados

- Área de drag & drop para upload de arquivo `.csv`
- Campo de texto para colar URL pública do Google Sheets
- Ao receber o CSV (upload ou URL), faz parse com `papaparse`
- Exibe preview das primeiras 5 linhas em tabela
- Auto-detecta headers (primeira linha do CSV)
- Se o arquivo tiver erros de parse, mostra mensagem de erro clara
- Botão "Próximo" só habilita após CSV carregado e parseado com sucesso

**Google Sheets URL**: o app aceita URLs no formato `https://docs.google.com/spreadsheets/d/{ID}/...` e converte internamente para o formato de export CSV (`/export?format=csv`). O fetch é feito via API route server-side para evitar CORS.

### Step 2 — Seleção de Campos

- Mostra todos os campos detectados (headers do CSV) como checkboxes
- Preview em tabela atualiza em tempo real mostrando apenas colunas selecionadas
- Exibe contagem total de participantes: "42 participantes carregados"
- Obrigatório selecionar pelo menos 1 campo para avançar
- Botão "Voltar" disponível para trocar o CSV

### Step 3 — Cadastro de Prêmios

- Input de texto + botão "Adicionar" para criar prêmios
- Lista de prêmios criados com botão de remover (ícone de lixeira)
- Botões de seta (↑ ↓) para reordenar prêmios (a ordem define a sequência do sorteio)
- Exibe resumo: "3 prêmios para 42 participantes"
- Obrigatório ter pelo menos 1 prêmio para avançar
- Botão "Voltar" disponível

### Step 4 — Sorteio

- Mostra o prêmio atual sendo sorteado em destaque
- Botão "Sortear!" inicia a animação
- **Animação tipo slot machine**: nomes passam rapidamente (intervalos de ~80ms), desaceleram gradualmente (intervalos crescentes), até parar no ganhador selecionado
- Ganhador exibido com destaque visual (escala maior, cor diferente, efeito de celebração)
- Ganhador é removido automaticamente do pool de participantes (cada pessoa só ganha uma vez)
- Botão "Próximo prêmio" avança para o próximo sorteio
- Ao final de todos os prêmios, exibe resumo completo em tabela: Prêmio → Ganhador (com todos os campos selecionados)

## Componentes Principais

```
app/
├── page.tsx                    # Página principal, gerencia estado do wizard
├── api/fetch-csv/route.ts      # API route proxy para Google Sheets
├── components/
│   ├── Wizard.tsx              # Container do wizard com barra de progresso
│   ├── StepImport.tsx          # Step 1: upload/URL + preview
│   ├── StepSelectFields.tsx    # Step 2: checkboxes de campos + preview filtrado
│   ├── StepPrizes.tsx          # Step 3: CRUD de prêmios
│   ├── StepRaffle.tsx          # Step 4: sorteio com animação
│   ├── FileDropZone.tsx        # Componente de drag & drop
│   ├── DataPreview.tsx         # Tabela de preview do CSV
│   └── SlotMachineAnimation.tsx # Animação do sorteio
```

## Regras de Negócio

1. Cada participante só pode ganhar **um** prêmio
2. Ganhadores são removidos do pool após cada sorteio
3. Se o número de prêmios for maior que o de participantes, avisa o usuário no Step 3
4. Headers do CSV são tratados como nomes dos campos
5. Linhas vazias no CSV são ignoradas
6. O campo exibido durante a animação do sorteio é o primeiro campo selecionado pelo usuário

## Considerações Técnicas

- **Encoding**: suportar UTF-8 (padrão do Google Forms/Sheets)
- **CSV delimiter**: papaparse auto-detecta (vírgula, ponto-e-vírgula, tab)
- **Performance**: para CSVs grandes (1000+ linhas), o preview mostra apenas 5 linhas mas o sorteio funciona com todos
- **Responsividade**: layout responsivo com Tailwind, funciona em mobile e desktop
- **Acessibilidade**: botões com labels claros, feedback visual para estados de loading/erro
