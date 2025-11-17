import { eq, desc, and, inArray } from "drizzle-orm";
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

// Queries para Rodadas
export async function getRounds() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(rounds).orderBy(rounds.order);
  return result;
}

export async function getRoundById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(rounds).where(eq(rounds.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Queries para Missões
export async function getMissionsByRoundId(roundId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(missions).where(eq(missions.roundId, roundId)).orderBy(missions.order);
  return result;
}

export async function getMissionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(missions).where(eq(missions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Queries para Tópicos
export async function getTopicsByMissionId(missionId: number) {
  const db = await getDb();
  if (!db) {
    console.warn('[Database] Cannot get topics: database not available');
    return [];
  }
  console.log(`[Database] Fetching topics for missionId: ${missionId}`);
  const result = await db.select().from(topics).where(eq(topics.missionId, missionId)).orderBy(topics.order);
  console.log(`[Database] Found ${result.length} topics for missionId ${missionId}`);
  return result;
}

export async function getTopicById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Queries para Progresso do Usuário
export async function getUserProgress(userId: number, topicId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userProgress).where(and(eq(userProgress.userId, userId), eq(userProgress.topicId, topicId))).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserProgressByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  return result;
}

// Queries para Anexos (deprecated - use getAttachmentsByMissionId instead)
export async function getAttachmentsByRoundId(roundId: number) {
  const db = await getDb();
  if (!db) return [];
  // Return empty array since attachments are now associated with missions
  return [];
}

export async function getAttachmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(attachments).where(eq(attachments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Queries para Comentarios
export async function getCommentsByMissionId(missionId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(comments).where(eq(comments.missionId, missionId)).orderBy(desc(comments.createdAt));
  return result;
}

export async function createComment(missionId: number, userId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(comments).values({ missionId, userId, content });
  return result;
}

// Queries para Anexos de Tópico
export async function getAttachmentsByTopicId(topicId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(attachments).where(eq(attachments.topicId, topicId)).orderBy(desc(attachments.createdAt));
  return result;
}

// Deprecated: use getAttachmentsByTopicId instead
export async function getAttachmentsByMissionId(missionId: number) {
  const db = await getDb();
  if (!db) return [];
  // Return empty array since attachments are now associated with topics
  return [];
}

export async function insertAttachment(data: {
  topicId: number;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  fileKey: string;
  mimeType?: string;
  uploadedBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(attachments).values({
    topicId: data.topicId,
    fileName: data.fileName,
    fileSize: data.fileSize,
    fileUrl: data.fileUrl,
    fileKey: data.fileKey,
    mimeType: data.mimeType,
    uploadedBy: data.uploadedBy || 1, // Default to user 1 if not provided
  });
  return result;
}

// Função para calcular progresso por rodada
export async function getRoundProgress(userId: number, roundId: number) {
  const db = await getDb();
  if (!db) return { totalTopics: 0, completedTopics: 0, percentage: 0 };
  
  // Get all topics in the round
  const roundMissions = await db.select().from(missions).where(eq(missions.roundId, roundId));
  const missionIds = roundMissions.map(m => m.id);
  
  if (missionIds.length === 0) {
    return { totalTopics: 0, completedTopics: 0, percentage: 0 };
  }
  
  // Get all topics for these missions
  const allTopics = await db.select().from(topics).where(
    inArray(topics.missionId, missionIds)
  );
  
  const totalTopics = allTopics.length;
  
  if (totalTopics === 0) {
    return { totalTopics: 0, completedTopics: 0, percentage: 0 };
  }
  
  // Get completed topics for this user
  const completedProgress = await db.select().from(userProgress).where(
    and(
      eq(userProgress.userId, userId),
      eq(userProgress.completed, 1),
      inArray(userProgress.topicId, allTopics.map(t => t.id))
    )
  );
  
  const completedTopics = completedProgress.length;
  const percentage = Math.round((completedTopics / totalTopics) * 100);
  
  return { totalTopics, completedTopics, percentage };
}
