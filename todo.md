# Plano de Ação — Aplicação de Planejamento Financeiro com IA (Groq SDK)

## 1. Visão Geral do Projeto
A aplicação será um planejador/carteira digital inteligente. Ela integrará o SDK do Groq para ser capaz de:
- Registrar despesas fixas e variáveis.
- Marcar gastos fixos como pagos.
- Receber novos gastos variáveis via chat com IA.
- Atualizar automaticamente saldos, metas e limites mensais.
- Informar ao usuário quanto ainda pode gastar e quanto já economizou.

O objetivo é entregar clareza financeira, controle diário e acompanhamento da meta de economia mensal.

---

## 2. Histórias de Usuário (User Stories)

### **2.1. Cadastro e Gestão de Despesas Fixas**
**Como usuário**, quero cadastrar meus gastos fixos (carro, seguro, academia, etc.) **para que** o sistema calcule automaticamente meus compromissos mensais.

**Como usuário**, quero marcar um gasto fixo como pago **para que** meu saldo disponível atual seja atualizado.

### **2.2. Recebimentos Mensais**
**Como usuário**, recebo três vezes ao mês e quero que o sistema registre automaticamente esses depósitos **para que** eu consiga acompanhar minha evolução financeira entre cada recebimento.

### **2.3. Gastos Variáveis no Chat**
**Como usuário**, quero informar meus gastos variáveis pelo chat usando IA **para que** o sistema entenda, categorize e atualize meus limites de gasto.

Exemplo:
> "Gastei 85 reais hoje com comida."

### **2.4. Visão de Progresso da Economia**
**Como usuário**, quero acompanhar quanto já economizei no mês e quanto ainda falta para atingir minha meta de R$5.000 **para que** eu me mantenha motivado e disciplinado.

### **2.5. Visão de Saldo Atual**
**Como usuário**, quero ver de forma clara quanto posso gastar até o próximo recebimento **para que** eu não comprometa meu orçamento.

### **2.6. Relatórios Semanais/Mensais**
**Como usuário**, quero visualizar gráficos simples (não obrigatórios na primeira versão) **para que** eu entenda meus padrões de consumo.

---

## 3. Estrutura de Dados

### **3.1. Dados Fixos**
- Nome do gasto
- Valor
- Categoria (transporte, saúde, lazer, etc.)
- Status (pago / não pago)
- Data sugerida de pagamento

### **3.2. Receitas**
- Valor
- Data (05, 15, 30/31)

### **3.3. Gastos Variáveis**
- Valor
- Categoria (IA pode sugerir)
- Descrição
- Data

### **3.4. Dados Derivados**
Calculados automaticamente:
- **Saldo disponível atual**
- **Total de gastos fixos pagos / a pagar**
- **Total gasto no mês**
- **Limite variável disponível** (receita - fixos - variável registrado)
- **Economia atual do mês**
- **Projeção de economia até o fim do mês**

---

## 4. Fluxos Principais da Aplicação

### **4.1. Fluxo de Configuração Inicial**
1. Usuário cria conta ou abre o app.
2. App já tem uma lista padrão com os gastos fixos dele (pré-configurados).
3. O usuário pode editar valores ou adicionar novos.
4. O sistema registra automaticamente as datas de recebimento.

### **4.2. Fluxo de Marcar Gasto Fixo como Pago**
1. O usuário acessa a lista de gastos fixos.
2. Clica em um item e marca como “pago”.
3. O sistema diminui o saldo disponível.
4. O sistema mostra mensagem: *“Você ainda pode gastar R$X até o dia 15.”*

### **4.3. Fluxo de Registrar Gasto Variável via Chat**
1. Usuário envia mensagem para o chatbot.
2. O Groq processa o texto e extrai:
   - valor
   - categoria sugerida
   - descrição
3. O sistema registra gasto e recalcula saldo disponível e economia.
4. Chat retorna um feedback como:
   > *“Registrado! Agora você ainda pode gastar R$1.245 até o próximo recebimento.”*

### **4.4. Fluxo de Acompanhamento Financeiro**
1. Tela mostra:
   - saldo disponível
   - economia acumulada
   - progresso da meta mensal
   - próximos recebimentos

---

## 5. UX (Sem UI)

### **5.1. Navegação Simples e Direta**
- **Tela Inicial:** mostrar o essencial (saldo, economia, próximos recebimentos).
- **Aba Fixos:** lista clara e editável, com indicadores visuais de pago/não pago.
- **Aba Variáveis:** lista cronológica + filtros por categoria.
- **Aba Chat:** interface estilo WhatsApp/Telegram.
- **Aba Metas:** mostra progresso da meta mensal.

### **5.2. Princípios de UX Aplicados**
- **Visibilidade imediata do mais importante** (saldo e economia).
- **Zero atrito para registrar gasto variável** — o chat resolve tudo.
- **Feedback instantâneo do sistema** após cada ação.
- **Consistência**: tudo segue o mesmo padrão de linguagem e visual.
- **Previsibilidade**: sempre mostrar o que ainda pode ser gasto.

---

## 6. Integração com Groq — Estratégia Técnica

### **6.1. Funções da IA**
- Interpretação de gastos informados pelo usuário.
- Sugestão automática de categoria.
- Respostas humanas e informativas sobre o estado financeiro.
- Geração de relatórios em texto.

### **6.2. Prompts Base para o Chat**
Trechos essenciais:
- "Sempre responda com clareza quanto o usuário ainda pode gastar."
- "Sempre classifique gastos variáveis em categorias predefinidas."
- "Sempre atualize os cálculos com base nos dados do usuário."

### **6.3. Estrutura do Backend**
- `/fixed-expenses`
- `/variable-expenses`
- `/income`
- `/chat-groq`
- `/summary`
- `/goals`

### **6.4. Fluxo da IA**
1. Usuário manda texto.
2. Backend envia para Groq SDK.
3. IA retorna JSON com dados extraídos:
   ```json
   {
     "valor": 85,
     "categoria": "alimentação",
     "descricao": "lanche no shopping"
   }
   ```
4. Backend grava no banco.
5. Retorna mensagem útil ao chat.

---

## 7. Como Programar de Forma Linear

### **Passo 1 — Definir JSON dos dados fixos e estrutura base**
### **Passo 2 — Definir endpoints REST**
### **Passo 3 — Criar lógica de cálculo financeiro**
### **Passo 4 — Criar fluxo do chatbot com IA**
### **Passo 5 — Criar telas com navegação simples**
### **Passo 6 — Testar cenários reais do mês**
### **Passo 7 — Ajustar mensagens e UX com base no uso**

---

## 8. Regras Financeiras Embutidas (Baseadas nas Melhores Práticas)
- Fixos devem ser priorizados nos primeiros recebimentos.
- Variáveis devem ser limitados com base no saldo.
- Economia é sempre separada antes (meta de R$5.000).
- Todo gasto deduz imediatamente o saldo disponível.
- Chat sempre orienta o usuário a manter o limite.

---

## 9. Escopo Inicial (MVP)
### **Obrigatório:**
- Tela inicial com saldo + economia
- Cadastro de fixos
- Marcar fixos como pagos
- Registro variável via chat com IA
- Cálculo de saldo disponível

### **Opcional (versão 2):**
- Gráficos
- Exportar relatórios
- Notificações inteligentes

---

Se quiser, posso agora gerar **o arquivo real em .md para download**, ou ajudar a transformar isso em tasks de desenvolvimento (Kanban).

