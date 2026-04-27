# Revisão da base de código — tarefas sugeridas

## 1) Tarefa de **erro de digitação / texto**
**Título:** Padronizar mensagens de erro em PT-BR e corrigir texto "policy de delete"

**Problema observado:**
Há mensagens expostas ao usuário com mistura de idiomas, por exemplo "Verifique a policy de delete.", o que soa como erro de digitação/termo incorreto no contexto do app em português.

**Arquivos com exemplo:**
- `src/app/features/clients/api/deleteClient.jsx`
- `src/app/features/services/api/deleteService.jsx`
- `src/app/features/staff/api/deleteStaff.jsx`
- `src/app/features/appointments/deleteAppointment.jsx`
- `src/app/features/staffAvailability/api/deleteStaffAvailability.jsx`

**Sugestão de correção:**
Trocar por texto consistente, ex.: "Verifique a política de exclusão." (ou "permissão de exclusão").

---

## 2) Tarefa de **correção de bug**
**Título:** Tornar `getAppointmentErrorMessage` resiliente a variações de caixa e formato

**Problema observado:**
O mapeamento de erros depende de `includes(...)` com strings exatas. Se a mensagem vier com maiúsculas, prefixos, ou variações mínimas, cai no fallback e mostra mensagem técnica.

**Arquivo:**
- `src/app/features/appointments/utils/getAppointmentErrorMessage.js`

**Sugestão de correção:**
- Normalizar para minúsculas (`rawMessage.toLowerCase()`) antes de comparar.
- Considerar mapear por códigos/identificadores de erro quando possível (em vez de string livre).
- Adicionar casos de fallback mais amigáveis ao usuário.

---

## 3) Tarefa de **ajuste de comentário/discrepância de documentação**
**Título:** Limpar código comentado e alinhar documentação do projeto com scripts reais

**Problema observado:**
- Há bloco grande de JSX comentado e import não usado no `Sidebar` (logo), sugerindo implementação desativada sem explicação.
- `README.md` está vazio, sem instruções de setup, execução e lint, apesar dos scripts definidos no `package.json`.

**Arquivos:**
- `src/app/components/common/Sidebar.jsx`
- `README.md`
- `package.json`

**Sugestão de correção:**
- Remover código morto/comentado ou registrar comentário objetivo do motivo.
- Preencher README com: requisitos, variáveis de ambiente Supabase, `npm install`, `npm run dev`, `npm run lint`, `npm run build`.

---

## 4) Tarefa de **melhoria de teste**
**Título:** Adicionar testes unitários para utilitários de agendamento e regressões de mensagem

**Problema observado:**
O projeto não possui script de teste no `package.json`, e utilitários críticos de data/erro não têm cobertura.

**Arquivos-alvo iniciais:**
- `src/app/features/appointments/utils/getAppointmentErrorMessage.js`
- `src/app/features/appointments/utils/toUtcIsoFromLocalDateTime.js`
- `package.json` (adicionar script `test`)

**Sugestão de melhoria:**
- Configurar Vitest + Testing Library (mínimo viável).
- Criar testes para:
  - mapeamento de cada erro conhecido;
  - variações de caixa (maiúsc./minúsc.) no texto de erro;
  - entradas inválidas (`null`, string inválida) no parser de data;
  - comportamento esperado para conversão local -> UTC.
