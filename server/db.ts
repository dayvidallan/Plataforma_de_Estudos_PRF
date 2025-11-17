import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, rounds, missions, topics, userProgress, attachments, comments } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// FASE 1: CRUD de Rodadas
// ============================================================================

export async function getRounds() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rounds).orderBy(rounds.order);
}

export async function getRoundById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(rounds).where(eq(rounds.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createRound(data: { name: string; description?: string; order: number }) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(rounds).values(data);
}

export async function updateRound(id: number, data: { name?: string; description?: string; order?: number }) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.order !== undefined) updateData.order = data.order;
  return db.update(rounds).set(updateData).where(eq(rounds.id, id));
}

export async function deleteRound(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const missionsToDelete = await db.select().from(missions).where(eq(missions.roundId, id));
  for (const mission of missionsToDelete) {
    await db.delete(topics).where(eq(topics.missionId, mission.id));
  }
  await db.delete(missions).where(eq(missions.roundId, id));
  return db.delete(rounds).where(eq(rounds.id, id));
}

// ============================================================================
// FASE 1: CRUD de Missões
// ============================================================================

export async function getMissionsByRoundId(roundId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(missions).where(eq(missions.roundId, roundId)).orderBy(missions.order);
}

export async function getMissionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createMission(data: { roundId: number; name: string; description?: string; order: number }) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(missions).values(data);
}

export async function updateMission(id: number, data: { name?: string; description?: string; order?: number }) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.order !== undefined) updateData.order = data.order;
  return db.update(missions).set(updateData).where(eq(missions.id, id));
}

export async function deleteMission(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(topics).where(eq(topics.missionId, id));
  return db.delete(missions).where(eq(missions.id, id));
}

// ============================================================================
// FASE 1: CRUD de Tópicos
// ============================================================================

export async function getTopicsByMissionId(missionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(topics).where(eq(topics.missionId, missionId)).orderBy(topics.order);
}

export async function getTopicById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTopic(data: { missionId: number; name: string; description?: string; order: number }) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(topics).values(data);
}

export async function updateTopic(id: number, data: { name?: string; description?: string; order?: number }) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.order !== undefined) updateData.order = data.order;
  return db.update(topics).set(updateData).where(eq(topics.id, id));
}

export async function deleteTopic(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(topics).where(eq(topics.id, id));
}

// ============================================================================
// FASE 2: Anexos por Tópico
// ============================================================================

export async function getAttachmentsByTopicId(topicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attachments).where(eq(attachments.topicId, topicId)).orderBy(desc(attachments.createdAt));
}

export async function deleteAttachment(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.delete(attachments).where(eq(attachments.id, id));
}

// ============================================================================
// FASE 3: Progresso do Usuário
// ============================================================================

export async function getUserProgress(userId: number, topicId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userProgress).where(and(eq(userProgress.userId, userId), eq(userProgress.topicId, topicId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserProgressByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userProgress).where(eq(userProgress.userId, userId));
}

export async function getRoundProgress(userId: number, roundId: number) {
  const db = await getDb();
  if (!db) return null;

  const missionsInRound = await db.select().from(missions).where(eq(missions.roundId, roundId));
  const missionIds = missionsInRound.map(m => m.id);
  
  if (missionIds.length === 0) {
    return { roundId, totalTopics: 0, completedTopics: 0, percentage: 0 };
  }

  const topicsInRound = await db.select().from(topics).where(sql`${topics.missionId} IN (${sql.raw(missionIds.join(','))})`);
  const totalTopics = topicsInRound.length;
  const topicIds = topicsInRound.map(t => t.id);

  if (topicIds.length === 0) {
    return { roundId, totalTopics: 0, completedTopics: 0, percentage: 0 };
  }

  const completedProgress = await db.select().from(userProgress).where(
    and(
      eq(userProgress.userId, userId),
      sql`${userProgress.topicId} IN (${sql.raw(topicIds.join(','))})`,
      eq(userProgress.completed, 1)
    )
  );


  const completedTopics = completedProgress.length;
  const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return { roundId, totalTopics, completedTopics, percentage };
}

export async function getAllRoundsProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const allRounds = await db.select().from(rounds).orderBy(rounds.order);
  const progress = await Promise.all(allRounds.map(round => getRoundProgress(userId, round.id)));
  return progress.filter(p => p !== null);
}

// ============================================================================
// Comentários
// ============================================================================

export async function getCommentsByMissionId(missionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comments).where(eq(comments.missionId, missionId)).orderBy(desc(comments.createdAt));
}

export async function createComment(missionId: number, userId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(comments).values({ missionId, userId, content });
}
