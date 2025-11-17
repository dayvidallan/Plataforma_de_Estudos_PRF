# 📋 Instruções para Próxima Conta - FiscoMEI

**Para:** Desenvolvedor que vai continuar o projeto com mais créditos  
**De:** Conta anterior (Dayvid Duarte)  
**Data:** 17 de Novembro de 2025  
**Projeto:** FiscoMEI - Plataforma de Estudos PRF

---

## 🎯 O que você precisa fazer

Você recebeu um **projeto parcialmente desenvolvido** que precisa de 5 fases de implementação. Tudo está documentado e pronto para começar.

### 📁 Arquivos Importantes

1. **`REQUISITOS_PROXIMAS_FASES.md`** ← **LEIA ISSO PRIMEIRO**
   - Especificação completa de todas as 5 fases
   - Requisitos funcionais detalhados
   - Exemplos de código
   - Checklist de implementação
   - Fluxo de dados

2. **`todo.md`**
   - Status atual do projeto
   - O que já foi feito
   - O que falta fazer

3. **Código do projeto**
   - `/client/src/pages/CoursePage.tsx` - Página principal
   - `/server/routers.ts` - APIs tRPC
   - `/server/db.ts` - Queries do banco
   - `/drizzle/schema.ts` - Estrutura do banco

---

## 🚀 Como Começar

### Passo 1: Entender o Projeto Atual
```bash
# Leia estes arquivos nesta ordem:
1. INSTRUCOES_PARA_PROXIMA_CONTA.md (este arquivo)
2. REQUISITOS_PROXIMAS_FASES.md (especificação completa)
3. todo.md (status atual)
```

### Passo 2: Revisar o Checkpoint Anterior
- **Versão:** `43514dd9`
- **Status:** Plataforma funcional com checkboxes, upload e comentários
- **O que funciona:**
  - ✅ Autenticação multiusuário
  - ✅ Estrutura de Rodadas → Missões → Tópicos
  - ✅ Checkboxes de progresso por tópico
  - ✅ Upload de arquivos por missão
  - ✅ Sistema de comentários
  - ✅ Barra de progresso por missão

### Passo 3: Entender a Estrutura do Banco
```
users (id, openId, name, email, role: admin|user)
  ↓
rounds (id, name, description, order)
  ↓
missions (id, roundId, name, description, order)
  ↓
topics (id, missionId, name, description, order)
  ↓
userProgress (userId, topicId, completed)
comments (userId, missionId, content)
attachments (missionId, uploadedBy) ← SERÁ MUDADO PARA topicId
```

### Passo 4: Começar a Implementação

**Recomendação de ordem:**

1. **Fase 1 (Permissões de Admin)** - 3-4 dias
   - Criar procedures de CRUD
   - Criar UI de admin panel
   - Testar permissões

2. **Fase 2 (Anexos por Tópico)** - 2-3 dias
   - Migrar dados de attachments
   - Atualizar procedures
   - Atualizar UI

3. **Fase 3 (Progresso por Rodada)** - 2 dias
   - Implementar cálculo de progresso
   - Adicionar barra visual
   - Testar com múltiplos tópicos

4. **Fase 4 (Atualizações em Tempo Real)** - 2-3 dias
   - Implementar otimistic updates
   - Configurar React Query
   - Testar sem refresh

5. **Fase 5 (UI de Gerenciamento)** - 2-3 dias
   - Criar admin panel completo
   - Adicionar validações
   - Testar fluxo completo

**Total estimado:** 11-17 dias de trabalho

---

## 📊 Checklist Rápido

### Antes de Começar
- [ ] Ler `REQUISITOS_PROXIMAS_FASES.md` completamente
- [ ] Entender a estrutura do banco de dados
- [ ] Revisar o código atual em `CoursePage.tsx` e `routers.ts`
- [ ] Fazer um teste local do projeto

### Fase 1
- [ ] Criar `adminProcedure` helper (se não existir)
- [ ] Implementar 9 procedures de CRUD
- [ ] Criar UI de admin panel
- [ ] Testar permissões

### Fase 2
- [ ] Criar migration para mover attachments
- [ ] Atualizar procedures de attachments
- [ ] Atualizar rota `/api/upload`
- [ ] Testar upload por tópico

### Fase 3
- [ ] Implementar `getRoundProgress`
- [ ] Atualizar UI para mostrar progresso por rodada
- [ ] Testar cálculo com múltiplos tópicos

### Fase 4
- [ ] Implementar otimistic updates
- [ ] Configurar invalidations
- [ ] Testar sem refresh

### Fase 5
- [ ] Criar página de admin
- [ ] Implementar forms
- [ ] Testar fluxo completo

---

## 🔑 Pontos-Chave

### 1. Sistema Multiusuário
- Cada usuário tem seu próprio progresso
- Apenas admins podem fazer upload
- Comentários são isolados por usuário
- Arquivos são compartilhados entre todos

### 2. Progresso por Rodada (não por missão)
```
Antes:  Progresso da Missão = (Tópicos concluídos / Total da missão) × 100%
Depois: Progresso da Rodada = (Tópicos concluídos / Total da rodada) × 100%
```

### 3. Anexos por Tópico (não por missão)
```
Antes:  Missão → Anexos
Depois: Tópico → Anexos
```

### 4. Atualizações em Tempo Real
- Checkbox deve atualizar imediatamente
- Comentário deve aparecer sem refresh
- Barra de progresso deve atualizar automaticamente

---

## 🛠️ Tecnologias Usadas

- **Frontend:** React 19 + Tailwind 4 + shadcn/ui
- **Backend:** Express 4 + tRPC 11
- **Banco:** MySQL/TiDB
- **ORM:** Drizzle
- **Auth:** Manus OAuth

---

## 📞 Dúvidas?

Se tiver dúvidas sobre os requisitos, consulte:
1. `REQUISITOS_PROXIMAS_FASES.md` - Especificação técnica
2. Código atual em `/client` e `/server`
3. Schema em `/drizzle/schema.ts`

---

## ✅ Quando Terminar

1. Fazer um checkpoint com descrição das mudanças
2. Testar todas as 5 fases
3. Documentar qualquer desvio dos requisitos
4. Deixar o projeto pronto para produção

---

**Boa sorte! 🚀**

Você tem todo o conhecimento que precisa no arquivo `REQUISITOS_PROXIMAS_FASES.md`.
