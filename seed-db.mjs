import mysql from 'mysql2/promise';
import fs from 'fs';

const courseData = JSON.parse(fs.readFileSync('./estrutura_curso.json', 'utf-8'));
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const connection = await mysql.createConnection(dbUrl);

try {
  // Clear existing data
  await connection.query('DELETE FROM userProgress');
  await connection.query('DELETE FROM attachments');
  await connection.query('DELETE FROM topics');
  await connection.query('DELETE FROM missions');
  await connection.query('DELETE FROM rounds');

  let roundOrder = 1;

  for (const round of courseData) {
    // Insert round
    const [roundResult] = await connection.query(
      'INSERT INTO rounds (name, description, `order`) VALUES (?, ?, ?)',
      [round.nome, '', roundOrder]
    );
    const roundId = roundResult.insertId;
    console.log(`Inserted round: ${round.nome} (ID: ${roundId})`);

    let missionOrder = 1;
    for (const mission of round.missoes) {
      // Insert mission
      const [missionResult] = await connection.query(
        'INSERT INTO missions (roundId, name, description, `order`) VALUES (?, ?, ?, ?)',
        [roundId, mission.nome, '', missionOrder]
      );
      const missionId = missionResult.insertId;
      console.log(`  Inserted mission: ${mission.nome} (ID: ${missionId})`);

      let topicOrder = 1;
      for (const topic of mission.topicos) {
        // Insert topic
        await connection.query(
          'INSERT INTO topics (missionId, name, description, `order`) VALUES (?, ?, ?, ?)',
          [missionId, topic.nome, '', topicOrder]
        );
        topicOrder++;
      }

      missionOrder++;
    }

    roundOrder++;
  }

  console.log('Database seeded successfully!');
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
} finally {
  await connection.end();
}
