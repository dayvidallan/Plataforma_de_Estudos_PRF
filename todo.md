# FiscoMEI - Plataforma de Estudos PRF - TODO

## Fase 1: Estrutura de Dados e Modelos
- [x] Mapear estrutura completa do curso (Rodadas, Missões, Tópicos)
- [x] Gerar JSON estruturado com dados do curso
- [x] Definir schema Drizzle para Rodadas, Missões, Tópicos, Anexos, Comentários
- [x] Criar procedures tRPC para CRUD de Rodadas, Missões, Tópicos
- [x] Criar procedures tRPC para upload e gerenciamento de anexos
- [x] Criar procedures tRPC para comentários

## Fase 2: Interface de Usuário
- [x] Criar layout principal com sidebar para navegação
- [x] Implementar página de listagem de Rodadas
- [x] Implementar página de detalhes da Rodada com Missões
- [x] Implementar página de detalhes da Missão com Tópicos
- [x] Implementar funcionalidade de checkbox para marcar tópicos como concluídos
- [x] Implementar visualização de anexos por Missão
- [x] Implementar sistema de comentários por Missão
- [x] Implementar barra de progresso por Missão
- [x] Implementar componente de upload de anexos por Missão (UI + backend)

## Fase 3: Funcionalidades Avançadas
- [x] Implementar autenticação de usuários
- [x] Implementar sistema de permissões (admin vs usuário)
- [x] Implementar persistência de progresso do usuário
- [ ] Implementar busca e filtro de Rodadas/Missões/Tópicos
- [ ] Implementar exportação de progresso
- [ ] Melhorias visuais na interface (tema similar ao Ouse Passar)
- [ ] Estatísticas de estudo

## Fase 4: Testes e Deploy
- [x] Testar checkboxes de progresso
- [x] Testar listagem de comentários
- [x] Testar listagem de anexos
- [x] Testar upload de anexos
- [ ] Testar sincronização de dados em tempo real
- [ ] Deploy da aplicação
- [ ] Documentação final

## Notas
- Estrutura do curso: 16 Rodadas + Revisão (17 módulos principais)
- Total de Missões: ~168 (variável por Rodada)
- Total de Tópicos: ~1000+ (variável por Missão)
- Funcionalidades principais: Checkbox de progresso, Upload de anexos por Rodada


## Bugs a Corrigir

- [x] Tópicos aparecem nas missões com checkboxes funcionais
- [x] Upload de arquivos implementado com rota /api/upload
- [x] Testar sincronização de dados após correções

## Problemas Reportados

- [x] Checkboxes de tópicos estão visíveis e funcionando corretamente
- [x] Verificar layout e posicionamento dos checkboxes - RESOLVIDO


## Novo Problema Identificado

- [ ] Checkboxes não aparecem em TODAS as missões - aparecem apenas em algumas missões que têm tópicos
- [ ] Corrigir layout para exibir checkboxes em cada missão quando expandida


## Sistema Multiusuário - Novo Requisito

- [ ] Implementar permissões de admin para upload de arquivos
- [ ] Garantir que arquivos sejam visíveis para todos os usuários
- [ ] Isolar progresso (checkboxes) por usuário
- [ ] Isolar comentários por usuário
- [ ] Testar com múltiplos usuários (admin + usuários comuns)
- [ ] Adicionar indicador visual de permissões na UI


---

## 📌 DOCUMENTO TÉCNICO CRIADO

**Arquivo:** `REQUISITOS_PROXIMAS_FASES.md`

Este documento contém:
- ✅ Descrição detalhada de todas as 5 fases
- ✅ Requisitos funcionais por fase
- ✅ Mudanças no banco de dados
- ✅ Exemplos de código
- ✅ Checklist de implementação
- ✅ Fluxo de dados atualizado

**Use este documento para:**
- Passar para outra conta com mais créditos
- Guiar o desenvolvimento das próximas fases
- Comunicar requisitos para a equipe
- Acompanhar progresso de implementação

**Status:** Pronto para implementação
**Versão do Projeto:** 8a4de2e6
