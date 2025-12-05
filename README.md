# Calculadora de Imposto sobre Ganho de Capital - Desafio Nubank

Aplicação CLI para calcular imposto sobre ganho de capital em operações de ações.

## Sobre

Esta é uma solução para o desafio técnico que calcula impostos sobre operações no mercado de ações de acordo com as regras fiscais brasileiras:
- 20% de imposto sobre ganhos de capital
- Isenção de imposto para operações ≤ R$ 20.000
- Cálculo de preço médio ponderado
- Mecanismo de dedução de prejuízos

## Como Executar

### Opção 1: Usando Node.js (Local)

**Pré-requisitos:**
- Node.js 20+
- npm 9+

**Passos:**
```bash
# Instalar dependências
npm install

# Compilar o projeto
npm run build

# Executar com arquivo de entrada
npm start < input.txt

# Ou executar interativamente
npm start
```

**Modo interativo:**
```bash
npm start
[{"operation":"buy", "unit-cost":10.00, "quantity": 100}]
[{"operation":"sell", "unit-cost":15.00, "quantity": 50}]

# Pressione Enter após cada linha
# Digite uma linha vazia para sair
```

---

### Opção 2: Usando Docker

**Construir a imagem:**
```bash
docker build -t nu-test .
```

**Executar com arquivo de entrada:**
```bash
docker run -i nu-test < input.txt
```

---

## Formato de Entrada

Cada linha contém um array JSON de operações:

```json
[
  {"operation":"buy", "unit-cost":10.00, "quantity": 100},
  {"operation":"sell", "unit-cost":20.00, "quantity": 50}
]
```

## Formato de Saída

Para cada linha de entrada, retorna um array JSON com os resultados de impostos:

```json
[{"tax":0},{"tax":1000}]
```

---

## Exemplos

### Caso #1: Vendas com isenção
```bash
echo '[{"operation":"buy", "unit-cost":10.00, "quantity": 100},{"operation":"sell", "unit-cost":15.00, "quantity": 50}]' | npm start
```
**Saída:** `[{"tax":0},{"tax":0}]`

### Caso #2: Lucro e prejuízo
```bash
echo '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":20.00, "quantity": 5000}]' | npm start
```
**Saída:** `[{"tax":0},{"tax":10000}]`

### Caso #3: Dedução de prejuízo
```bash
echo '[{"operation":"buy", "unit-cost":10.00, "quantity": 10000},{"operation":"sell", "unit-cost":5.00, "quantity": 5000},{"operation":"sell", "unit-cost":20.00, "quantity": 3000}]' | npm start
```
**Saída:** `[{"tax":0},{"tax":0},{"tax":1000}]`

---

## Testes

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage
```

**Cobertura de Testes:**
- 40 testes no total (unitários + integração + e2e)
- 100% de cobertura de código
- Todos os 9 casos da especificação validados

---

## Estrutura do Projeto

```
src/
├── domain/
│   ├── models.ts           # Definições de tipos
│   ├── utils.ts            # Funções auxiliares puras
│   └── tax-calculator.ts   # Lógica principal de cálculo de impostos
├── processor.ts            # Processador de operações
└── index.ts                # Ponto de entrada CLI (stdin/stdout)

tests/
├── unit/                   # Testes unitários da lógica de domínio
├── integration/            # Testes de integração (9 casos da spec)
└── e2e/                    # Testes end-to-end do CLI
```

---

## Decisões Técnicas

### Arquitetura
- **Clean Architecture**: Lógica de domínio separada do processamento de I/O
- **Funções puras**: Lógica de cálculo de impostos sem estado e testável
- **Sem dependências externas**: Apenas módulos built-in do Node.js para runtime

### Stack Tecnológico
- **TypeScript 5.9+**: Type safety com modo strict
- **Node.js 20+**: Ambiente de execução
- **Vitest**: Framework de testes
- **Docker**: Build containerizado

### Escolhas de Design
- **Gerenciamento de estado**: Estado em memória por linha de entrada (sem persistência)
- **Zero dependências de runtime**: Apenas built-ins do Node.js (`readline`, `JSON`)
- **Multi-stage Docker build**: Otimizado para tamanho mínimo de imagem

---

## Desenvolvimento

```bash
# Executar em modo dev (sem necessidade de build)
npm run dev < input.txt

# Executar testes em modo watch
npm run test:watch

# Fazer lint do código
npm run lint

# Formatar código
npm run format
```

---
