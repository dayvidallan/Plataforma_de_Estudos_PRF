# FiscoMEI - Requisitos para Próximas Fases de Desenvolvimento

**Data:** 17 de Novembro de 2025  
**Status:** Aguardando implementação por conta com mais créditos  
**Versão Atual:** 8a4de2e6

---

## 📋 Resumo Executivo

O sistema atual implementa uma plataforma de estudos para concurso PRF com:
- ✅ Autenticação multiusuário (admin/user)
- ✅ Estrutura de Rodadas → Missões → Tópicos
- ✅ Checkboxes de progresso por tópico
- ✅ Upload de arquivos por missão
- ✅ Sistema de comentários por missão
- ✅ Barra de progresso por missão

**Próximas fases requerem:**
- ❌ Permissões de admin para CRUD de rodadas, missões e tópicos
- ❌ Anexos por tópico (não mais por missão)
- ❌ Progresso calculado por RODADA (não por missão)
- ❌ Barra de progresso visual por rodada
- ❌ Atualizações em tempo real (sem refresh necessário)

---

## 🎯 Fase 1: Permissões de Admin - CRUD de Conteúdo

### Objetivo
Permitir que administradores criem, editem e excluam rodadas, missões e tópicos.

### Requisitos Funcionais

#### 1.1 Criar Rodada
- **Endpoint:** `POST /api/trpc/course.createRound`
- **Permissão:** Admin only
- **Entrada:**
  ```typescript
  {
    name: string;           // Ex: "Rodada 1 - PRF"
    description?: string;
    order: number;          // Ordem de exibição
  }
  ```
- **Saída:** `{ id: number; name: string; ... }`
- **Validações:**
  - Usuário deve ser admin
  - Nome é obrigatório
  - Order deve ser único

#### 1.2 Editar Rodada
- **Endpoint:** `PUT /api/trpc/course.updateRound`
- **Permissão:** Admin only
- **Entrada:**
  ```typescript
  {
    id: number;
    name?: string;
    description?: string;
    order?: number;
  }
  ```

#### 1.3 Excluir Rodada
- **Endpoint:** `DELETE /api/trpc/course.deleteRound`
- **Permissão:** Admin only
- **Entrada:** `{ id: number }`
- **Comportamento:** Excluir rodada e todas as missões/tópicos associados (cascade)

#### 1.4 Criar Missão
- **Endpoint:** `POST /api/trpc/course.createMission`
- **Permissão:** Admin only
- **Entrada:**
  ```typescript
  {
    roundId: number;
    name: string;
    description?: string;
    order: number;
  }
  ```

#### 1.5 Editar Missão
- **Endpoint:** `PUT /api/trpc/course.updateMission`
- **Permissão:** Admin only
- **Entrada:**
  ```typescript
  {
    id: number;
    name?: string;
    description?: string;
    order?: number;
  }
  ```

#### 1.6 Excluir Missão
- **Endpoint:** `DELETE /api/trpc/course.deleteMission`
- **Permissão:** Admin only
- **Comportamento:** Excluir missão e todos os tópicos associados

#### 1.7 Criar Tópico
- **Endpoint:** `POST /api/trpc/course.createTopic`
- **Permissão:** Admin only
- **Entrada:**
  ```typescript
  {
    missionId: number;
    name: string;
    description?: string;
    order: number;
  }
  ```

#### 1.8 Editar Tópico
- **Endpoint:** `PUT /api/trpc/course.updateTopic`
- **Permissão:** Admin only

#### 1.9 Excluir Tópico
- **Endpoint:** `DELETE /api/trpc/course.deleteTopic`
- **Permissão:** Admin only

### Mudanças no Banco de Dados
Nenhuma mudança necessária - estrutura já existe.

### Mudanças no Frontend
- Adicionar UI de gerenciamento (admin panel)
- Mostrar botões de editar/excluir apenas para admins
- Formulários para criar/editar rodadas, missões e tópicos

---

## 🎯 Fase 2: Anexos por Tópico (não mais por Missão)

### Objetivo
Mover upload de arquivos de Missão para Tópico.

### Mudanças no Banco de Dados

#### Modificar tabela `attachments`
```sql
ALTER TABLE attachments 
DROP COLUMN missionId,
ADD COLUMN topicId INT NOT NULL AFTER id;

ALTER TABLE attachments 
ADD CONSTRAINT fk_attachments_topics 
FOREIGN KEY (topicId) REFERENCES topics(id) ON DELETE CASCADE;
```

### Requisitos Funcionais

#### 2.1 Upload de Arquivo por Tópico
- **Endpoint:** `POST /api/upload`
- **Permissão:** Admin only
- **FormData:**
  ```
  file: File
  topicId: number
  ```
- **Comportamento:**
  - Validar que usuário é admin
  - Fazer upload para S3
  - Registrar no banco com `topicId` e `uploadedBy`

#### 2.2 Listar Anexos por Tópico
- **Endpoint:** `GET /api/trpc/course.getAttachmentsByTopicId`
- **Permissão:** Public
- **Entrada:** `{ topicId: number }`
- **Saída:** Array de attachments com informações do uploader

#### 2.3 Excluir Anexo
- **Endpoint:** `DELETE /api/trpc/course.deleteAttachment`
- **Permissão:** Admin only
- **Entrada:** `{ id: number }`

### Mudanças no Frontend
- Mover seção de upload para dentro de cada tópico (não mais em missão)
- Mostrar anexos abaixo dos checkboxes de tópico
- Apenas admins veem botão de upload

---

## 🎯 Fase 3: Progresso por Rodada (não por Missão)

### Objetivo
Calcular progresso com base na rodada inteira, não em missões individuais.

### Lógica de Cálculo

**Antes (por missão):**
```
Progresso da Missão = (Tópicos concluídos / Total de tópicos da missão) × 100%
```

**Depois (por rodada):**
```
Progresso da Rodada = (Tópicos concluídos em toda a rodada / Total de tópicos da rodada) × 100%

Exemplo:
- Rodada 1 tem 3 missões
- Missão 1: 5 tópicos
- Missão 2: 8 tópicos
- Missão 3: 7 tópicos
- Total: 20 tópicos

Se usuário marcou 10 tópicos:
Progresso = (10 / 20) × 100% = 50%
```

### Mudanças no Banco de Dados
Nenhuma mudança necessária - `userProgress` já rastreia por tópico.

### Requisitos Funcionais

#### 3.1 Calcular Progresso da Rodada
- **Endpoint:** `GET /api/trpc/course.getRoundProgress`
- **Permissão:** Protected (usuário autenticado)
- **Entrada:** `{ roundId: number }`
- **Saída:**
  ```typescript
  {
    roundId: number;
    totalTopics: number;
    completedTopics: number;
    percentage: number;  // 0-100
  }
  ```

#### 3.2 Listar Progresso de Todas as Rodadas
- **Endpoint:** `GET /api/trpc/course.getAllRoundsProgress`
- **Permissão:** Protected
- **Saída:** Array de `getRoundProgress` para cada rodada

### Mudanças no Frontend
- Remover barra de progresso de missão
- Adicionar barra de progresso de rodada (abaixo do nome da rodada)
- Atualizar cálculo de progresso para usar rodada

---

## 🎯 Fase 4: Atualizações em Tempo Real

### Objetivo
Eliminar necessidade de refresh ao marcar checkboxes ou adicionar comentários.

### Requisitos Funcionais

#### 4.1 Atualizar Checkbox em Tempo Real
- **Implementação:** Usar `onSuccess` do React Query para atualizar cache
- **Comportamento:**
  1. Usuário clica checkbox
  2. Requisição é enviada (otimistic update)
  3. Checkbox muda imediatamente
  4. Barra de progresso atualiza imediatamente
  5. Servidor confirma (sem refresh necessário)

#### 4.2 Atualizar Comentários em Tempo Real
- **Implementação:** Usar `onSuccess` para invalidar e refetch automático
- **Comportamento:**
  1. Usuário digita comentário
  2. Clica "Enviar"
  3. Comentário aparece na lista imediatamente
  4. Servidor confirma
  5. Sem refresh necessário

#### 4.3 Otimistic Updates
- **Checkbox:** Atualizar UI antes de confirmar no servidor
- **Comentário:** Mostrar comentário com status "enviando..." até confirmação

### Mudanças no Frontend

**Exemplo para Checkbox:**
```typescript
const toggleProgressMutation = trpc.course.toggleTopicProgress.useMutation({
  onMutate: async (variables) => {
    // Atualizar cache imediatamente
    await trpc.useUtils().course.getUserProgress.cancel();
    const previousProgress = trpc.useUtils().course.getUserProgress.getData();
    
    // Otimistic update
    trpc.useUtils().course.getUserProgress.setData(
      undefined,
      (old) => [...(old || []), { topicId: variables.topicId, completed: 1 }]
    );
    
    return { previousProgress };
  },
  onError: (err, variables, context) => {
    // Reverter se erro
    if (context?.previousProgress) {
      trpc.useUtils().course.getUserProgress.setData(undefined, context.previousProgress);
    }
  },
  onSuccess: () => {
    // Refetch para sincronizar
    void trpc.useUtils().course.getUserProgress.invalidate();
    void trpc.useUtils().course.getRoundProgress.invalidate();
  },
});
```

**Exemplo para Comentário:**
```typescript
const addCommentMutation = trpc.course.addComment.useMutation({
  onMutate: async (variables) => {
    await trpc.useUtils().course.getCommentsByMissionId.cancel();
    const previousComments = trpc.useUtils().course.getCommentsByMissionId.getData();
    
    // Otimistic update com status "enviando"
    const tempComment = {
      id: -1,
      missionId: variables.missionId,
      userId: user?.id || 0,
      content: variables.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'sending' // Custom field
    };
    
    trpc.useUtils().course.getCommentsByMissionId.setData(
      { missionId: variables.missionId },
      (old) => [...(old || []), tempComment]
    );
    
    return { previousComments };
  },
  onSuccess: () => {
    void trpc.useUtils().course.getCommentsByMissionId.invalidate();
  },
});
```

---

## 🎯 Fase 5: UI de Gerenciamento (Admin Panel)

### Objetivo
Criar interface para admins gerenciarem conteúdo.

### Requisitos Funcionais

#### 5.1 Dashboard de Admin
- Listar todas as rodadas
- Botões para criar, editar, excluir rodada
- Expandir rodada para ver missões
- Botões para criar, editar, excluir missão
- Expandir missão para ver tópicos
- Botões para criar, editar, excluir tópico

#### 5.2 Formulário de Criar/Editar Rodada
- Campos: nome, descrição, ordem
- Validação de campos obrigatórios
- Feedback de sucesso/erro

#### 5.3 Formulário de Criar/Editar Missão
- Campos: roundId (select), nome, descrição, ordem
- Validação de campos obrigatórios

#### 5.4 Formulário de Criar/Editar Tópico
- Campos: missionId (select), nome, descrição, ordem
- Validação de campos obrigatórios

#### 5.5 Upload de Arquivo por Tópico
- Mostrar apenas para admins
- Drag-and-drop ou file input
- Progresso de upload
- Lista de arquivos com opção de deletar

---

## 📊 Estrutura de Dados Atualizada

### Tabelas Existentes (sem mudanças)
```
users (id, openId, name, email, role: admin|user, ...)
rounds (id, name, description, order, ...)
missions (id, roundId, name, description, order, ...)
topics (id, missionId, name, description, order, ...)
userProgress (id, userId, topicId, completed, completedAt, ...)
comments (id, missionId, userId, content, ...)
```

### Tabela Modificada
```
attachments (
  id,
  topicId (mudado de missionId),
  fileName,
  fileUrl,
  fileKey,
  fileSize,
  mimeType,
  uploadedBy (userId),
  createdAt,
  updatedAt
)
```

---

## 🔄 Fluxo de Dados Atualizado

### Visualizar Rodada com Progresso
```
1. Usuário clica em "Rodada 1"
2. Frontend chama:
   - getRounds() → lista todas rodadas
   - getMissionsByRoundId(60004) → lista missões
   - getRoundProgress(60004) → calcula progresso
3. Exibir:
   - Nome da rodada
   - Barra de progresso (ex: 45%)
   - Lista de missões
4. Usuário expande missão:
   - getTopicsByMissionId(60054) → lista tópicos
   - getUserProgress() → marca quais completados
5. Exibir:
   - Checkboxes de tópicos
   - Anexos de cada tópico
   - Comentários
```

### Marcar Checkbox
```
1. Usuário clica checkbox de tópico
2. Frontend:
   - Otimistic update (marca imediatamente)
   - Envia toggleTopicProgress(topicId)
3. Backend:
   - Verifica se usuário autenticado
   - Insere/atualiza userProgress
   - Retorna novo status
4. Frontend:
   - Recebe confirmação
   - Invalida getRoundProgress
   - Barra de progresso atualiza automaticamente
```

### Adicionar Comentário
```
1. Usuário digita e clica "Enviar"
2. Frontend:
   - Otimistic update (mostra comentário com "enviando...")
   - Envia addComment(missionId, content)
3. Backend:
   - Verifica se usuário autenticado
   - Insere comment com userId
   - Retorna comment com id real
4. Frontend:
   - Recebe confirmação
   - Remove status "enviando"
   - Comentário fica permanente
```

---

## 🛠️ Checklist de Implementação

### Fase 1: Permissões de Admin
- [ ] Criar `adminProcedure` helper (já existe em template)
- [ ] Implementar `createRound` procedure
- [ ] Implementar `updateRound` procedure
- [ ] Implementar `deleteRound` procedure
- [ ] Implementar `createMission` procedure
- [ ] Implementar `updateMission` procedure
- [ ] Implementar `deleteMission` procedure
- [ ] Implementar `createTopic` procedure
- [ ] Implementar `updateTopic` procedure
- [ ] Implementar `deleteTopic` procedure
- [ ] Criar UI de admin panel
- [ ] Testar permissões

### Fase 2: Anexos por Tópico
- [ ] Migrar dados: missionId → topicId em attachments
- [ ] Implementar `getAttachmentsByTopicId` procedure
- [ ] Implementar `deleteAttachment` procedure
- [ ] Atualizar rota `/api/upload` para usar topicId
- [ ] Atualizar UI para mostrar anexos em tópicos
- [ ] Testar upload por tópico

### Fase 3: Progresso por Rodada
- [ ] Implementar `getRoundProgress` procedure
- [ ] Implementar `getAllRoundsProgress` procedure
- [ ] Atualizar frontend para calcular progresso por rodada
- [ ] Adicionar barra de progresso visual por rodada
- [ ] Testar cálculo com múltiplos tópicos

### Fase 4: Atualizações em Tempo Real
- [ ] Implementar otimistic updates para checkbox
- [ ] Implementar otimistic updates para comentário
- [ ] Configurar React Query invalidations
- [ ] Testar sem refresh
- [ ] Testar rollback em caso de erro

### Fase 5: UI de Gerenciamento
- [ ] Criar página de admin panel
- [ ] Implementar CRUD forms
- [ ] Adicionar validações
- [ ] Adicionar feedback visual
- [ ] Testar fluxo completo

---

## 📝 Notas Técnicas

### Considerações de Performance
- Usar `invalidate` seletivamente para evitar refetch desnecessário
- Implementar paginação se houver muitos tópicos
- Cache de progresso por rodada (não refetch a cada checkbox)

### Considerações de Segurança
- Validar `role === 'admin'` em TODOS os procedures de CRUD
- Validar que `uploadedBy` é o usuário autenticado
- Não permitir que usuário comum veja/modifique progresso de outros

### Considerações de UX
- Mostrar loading state durante upload
- Mostrar toast de sucesso/erro
- Desabilitar botões durante requisição
- Confirmar antes de deletar

---

## 🚀 Próximos Passos

1. **Revisar requisitos** com o usuário
2. **Criar migration** para mover attachments de missionId para topicId
3. **Implementar Fase 1** (CRUD de conteúdo)
4. **Implementar Fase 2** (Anexos por tópico)
5. **Implementar Fase 3** (Progresso por rodada)
6. **Implementar Fase 4** (Atualizações em tempo real)
7. **Implementar Fase 5** (UI de gerenciamento)
8. **Testes e QA** completos
9. **Deploy** para produção

---

## 📞 Contato

Para dúvidas sobre estes requisitos, consulte o documento original ou a conta do Manus que iniciou o projeto.

**Versão do Projeto:** 8a4de2e6  
**Última Atualização:** 17 de Novembro de 2025
