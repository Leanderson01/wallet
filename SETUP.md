# Wallet App - Setup Instructions

## Etapa 1: Configuração Base do Convex - Completa

### Schema criado
O schema completo foi criado em `convex/schema.ts` com as seguintes tabelas:
- `fixedExpenses` - Despesas fixas mensais
- `variableExpenses` - Gastos variáveis
- `incomes` - Receitas/recebimentos
- `goals` - Metas mensais de economia
- `incomeSettings` - Configuração dos recebimentos mensais (3x por mês)

### Autenticação configurada
- Clerk instalado (`@clerk/nextjs`)
- ClerkProvider configurado no layout
- Middleware do Clerk criado para proteger rotas

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Como obter as variáveis:

1. **Convex URL**: Execute `npx convex dev` no terminal e siga as instruções para criar/configurar seu projeto Convex. A URL será fornecida.

2. **Clerk Keys**: 
   - Crie uma conta em [clerk.com](https://clerk.com)
   - Crie um novo aplicativo
   - Copie as chaves da dashboard do Clerk

## Próximos Passos

Após configurar as variáveis de ambiente:

1. Execute `npx convex dev` para iniciar o desenvolvimento do Convex e gerar os tipos TypeScript automaticamente
2. Execute `pnpm dev` para iniciar o servidor Next.js

## Estrutura do Schema

Cada tabela está configurada com:
- Índices para queries eficientes por `userId`
- Validação de tipos usando `v` (convex/values)
- Campos de timestamp para auditoria

Os tipos TypeScript serão gerados automaticamente em `convex/_generated/` após executar `npx convex dev`.

