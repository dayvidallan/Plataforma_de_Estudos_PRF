import { drizzle } from 'drizzle-orm/mysql2';
import { rounds, missions, topics, users } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar rodadas
  const roundsData = [
    { name: 'Rodada 1 - Fundamentos', description: 'Conceitos básicos de PRF', order: 1 },
    { name: 'Rodada 2 - Intermediário', description: 'Tópicos mais avançados', order: 2 },
    { name: 'Rodada 3 - Avançado', description: 'Preparação final', order: 3 },
  ];

  const createdRounds = [];
  for (const round of roundsData) {
    const result = await db.insert(rounds).values(round);
    createdRounds.push({ ...round, id: result.insertId });
    console.log(`✓ Rodada criada: ${round.name}`);
  }

  // Criar missões para cada rodada
  const missionsData = [
    { roundId: createdRounds[0].id, name: 'Missão 1.1 - Introdução', description: 'Primeiros passos', order: 1 },
    { roundId: createdRounds[0].id, name: 'Missão 1.2 - Conceitos', description: 'Aprender conceitos', order: 2 },
    { roundId: createdRounds[1].id, name: 'Missão 2.1 - Prática', description: 'Exercícios práticos', order: 1 },
    { roundId: createdRounds[1].id, name: 'Missão 2.2 - Casos', description: 'Casos de uso', order: 2 },
    { roundId: createdRounds[2].id, name: 'Missão 3.1 - Revisão', description: 'Revisão geral', order: 1 },
  ];

  const createdMissions = [];
  for (const mission of missionsData) {
    const result = await db.insert(missions).values(mission);
    createdMissions.push({ ...mission, id: result.insertId });
    console.log(`✓ Missão criada: ${mission.name}`);
  }

  // Criar tópicos para cada missão
  const topicsData = [
    { missionId: createdMissions[0].id, name: 'Tópico 1: O que é PRF?', description: 'Definição e contexto', order: 1 },
    { missionId: createdMissions[0].id, name: 'Tópico 2: História', description: 'Histórico da PRF', order: 2 },
    { missionId: createdMissions[1].id, name: 'Tópico 3: Estrutura', description: 'Estrutura organizacional', order: 1 },
    { missionId: createdMissions[1].id, name: 'Tópico 4: Competências', description: 'Áreas de competência', order: 2 },
    { missionId: createdMissions[2].id, name: 'Tópico 5: Exercício 1', description: 'Primeiro exercício', order: 1 },
    { missionId: createdMissions[2].id, name: 'Tópico 6: Exercício 2', description: 'Segundo exercício', order: 2 },
    { missionId: createdMissions[3].id, name: 'Tópico 7: Caso 1', description: 'Primeiro caso', order: 1 },
    { missionId: createdMissions[3].id, name: 'Tópico 8: Caso 2', description: 'Segundo caso', order: 2 },
    { missionId: createdMissions[4].id, name: 'Tópico 9: Revisão Final', description: 'Revisão de todos os tópicos', order: 1 },
  ];

  for (const topic of topicsData) {
    await db.insert(topics).values(topic);
    console.log(`✓ Tópico criado: ${topic.name}`);
  }

  console.log('✅ Seed concluído com sucesso!');
}

seed().catch(err => {
  console.error('❌ Erro ao fazer seed:', err);
  process.exit(1);
});
