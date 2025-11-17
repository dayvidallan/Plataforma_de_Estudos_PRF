# 📚 FiscoMEI - Plataforma de Estudos PRF

Plataforma completa de estudos para o concurso da Polícia Rodoviária Federal (PRF) com sistema multiusuário, rastreamento de progresso e gerenciamento de conteúdo.

## ✨ Funcionalidades Atuais

- ✅ **Autenticação Multiusuário** - Sistema de login com OAuth
- ✅ **Estrutura de Conteúdo** - Rodadas → Missões → Tópicos
- ✅ **Rastreamento de Progresso** - Checkboxes de conclusão por tópico
- ✅ **Upload de Arquivos** - Anexos por missão com armazenamento em S3
- ✅ **Sistema de Comentários** - Discussões por missão
- ✅ **Barra de Progresso** - Visualização de avanço por missão
- ✅ **Permissões de Admin** - Controle de acesso baseado em roles

## 🚀 Próximas Fases (Em Desenvolvimento)

Veja `REQUISITOS_PROXIMAS_FASES.md` para detalhes completos.

### Fase 1: Permissões de Admin - CRUD de Conteúdo
- Criar, editar e excluir rodadas
- Criar, editar e excluir missões
- Criar, editar e excluir tópicos

### Fase 2: Anexos por Tópico
- Mover upload de arquivos de missão para tópico
- Gerenciamento de anexos por tópico

### Fase 3: Progresso por Rodada
- Calcular progresso com base na rodada inteira
- Barra de progresso visual por rodada

### Fase 4: Atualizações em Tempo Real
- Atualização imediata de checkboxes
- Atualização imediata de comentários
- Sem necessidade de refresh

### Fase 5: UI de Gerenciamento
- Admin panel completo
- Formulários de CRUD
- Validações e feedback visual

## 🛠️ Tecnologias

- **Frontend:** React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend:** Express 4 + tRPC 11
- **Banco de Dados:** MySQL/TiDB
- **ORM:** Drizzle
- **Autenticação:** Manus OAuth
- **Armazenamento:** S3

## 📋 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e configurações
│   │   └── App.tsx        # Componente principal
│   └── public/            # Arquivos estáticos
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # Definição de procedures tRPC
│   ├── db.ts              # Queries do banco de dados
│   └── _core/             # Configurações internas
├── drizzle/               # Migrações e schema do banco
├── REQUISITOS_PROXIMAS_FASES.md    # Especificação técnica
├── INSTRUCOES_PARA_PROXIMA_CONTA.md # Guia de implementação
└── package.json           # Dependências do projeto
```

## 🚀 Como Começar

### Pré-requisitos
- Node.js 22+
- pnpm
- Conta Manus com créditos

### Instalação

```bash
# Clonar repositório
git clone https://github.com/dayvidallan/Plataforma_de_Estudos_PRF.git
cd Plataforma_de_Estudos_PRF

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
# (Copie as variáveis fornecidas pelo Manus)

# Iniciar servidor de desenvolvimento
pnpm dev
```

## 📖 Documentação

- **`REQUISITOS_PROXIMAS_FASES.md`** - Especificação técnica completa com requisitos funcionais, exemplos de código e checklist
- **`INSTRUCOES_PARA_PROXIMA_CONTA.md`** - Guia passo a passo para continuar o desenvolvimento
- **`todo.md`** - Status atual do projeto e tarefas pendentes

## 🔄 Fluxo de Dados

```
Usuário
  ↓
Login (OAuth)
  ↓
Dashboard (Rodadas)
  ↓
Expandir Rodada (Missões)
  ↓
Expandir Missão (Tópicos)
  ↓
Marcar Checkbox (Progresso)
  ↓
Adicionar Comentário
  ↓
Upload de Arquivo (Admin)
```

## 👥 Permissões

| Ação | Admin | Usuário |
|------|-------|---------|
| Visualizar conteúdo | ✅ | ✅ |
| Marcar progresso | ✅ | ✅ |
| Comentar | ✅ | ✅ |
| Upload de arquivos | ✅ | ❌ |
| CRUD de rodadas | ✅ | ❌ |
| CRUD de missões | ✅ | ❌ |
| CRUD de tópicos | ✅ | ❌ |

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Executar seed do banco
pnpm exec node seed-db.mjs
```

## 📊 Status do Projeto

**Versão Atual:** 43514dd9  
**Status:** Em desenvolvimento  
**Próxima Fase:** Permissões de Admin - CRUD de Conteúdo

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Leia `REQUISITOS_PROXIMAS_FASES.md`
2. Siga a ordem de implementação recomendada
3. Faça commits descritivos
4. Crie pull requests com descrição clara

## 📞 Suporte

Para dúvidas sobre o desenvolvimento, consulte:
- `REQUISITOS_PROXIMAS_FASES.md` - Especificação técnica
- `INSTRUCOES_PARA_PROXIMA_CONTA.md` - Guia de implementação
- Código-fonte em `/client` e `/server`

## 📄 Licença

Este projeto é privado. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para o concurso da PRF**
