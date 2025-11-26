import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  course: router({
    // Rodadas
    getRounds: publicProcedure.query(async () => {
      const { getRounds } = await import("../server/db");
      return getRounds();
    }),
    getRoundById: publicProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return { id: (val as { id: unknown }).id as number };
      }
      throw new Error('Invalid input');
    }).query(async ({ input }) => {
      const { getRoundById } = await import("../server/db");
      return getRoundById(input.id);
    }),

    // Missões
    getMissionsByRoundId: publicProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'roundId' in val) {
        return { roundId: (val as { roundId: unknown }).roundId as number };
      }
      throw new Error('Invalid input');
    }).query(async ({ input }) => {
      const { getMissionsByRoundId } = await import("../server/db");
      return getMissionsByRoundId(input.roundId);
    }),

    // Tópicos
    getTopicsByMissionId: publicProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'missionId' in val) {
        return { missionId: (val as { missionId: unknown }).missionId as number };
      }
      throw new Error('Invalid input');
    }).query(async ({ input }) => {
      const { getTopicsByMissionId } = await import("../server/db");
      return getTopicsByMissionId(input.missionId);
    }),

    // Progresso do Usuário
    getUserProgress: protectedProcedure.query(async ({ ctx }) => {
      const { getUserProgressByUserId } = await import("../server/db");
      return getUserProgressByUserId(ctx.user.id);
    }),

    toggleTopicProgress: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'topicId' in val) {
        return { topicId: (val as { topicId: unknown }).topicId as number };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../server/db");
      const { userProgress } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const existing = await db.select().from(userProgress).where(
        and(
          eq(userProgress.userId, ctx.user.id),
          eq(userProgress.topicId, input.topicId)
        )
      ).limit(1);

      if (existing.length > 0) {
        // Toggle completed status
        const newStatus = existing[0].completed === 1 ? 0 : 1;
        await db.update(userProgress)
          .set({ completed: newStatus, completedAt: newStatus === 1 ? new Date() : null })
          .where(
            and(
              eq(userProgress.userId, ctx.user.id),
              eq(userProgress.topicId, input.topicId)
            )
          );
        return { completed: newStatus === 1 };
      } else {
        // Create new progress entry
        await db.insert(userProgress).values({
          userId: ctx.user.id,
          topicId: input.topicId,
          completed: 1,
          completedAt: new Date(),
        });
        return { completed: true };
      }
    }),

    // Anexos
    getAttachmentsByRoundId: publicProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'roundId' in val) {
        return { roundId: (val as { roundId: unknown }).roundId as number };
      }
      throw new Error('Invalid input');
    }).query(async ({ input }) => {
      const { getAttachmentsByRoundId } = await import("../server/db");
      return getAttachmentsByRoundId(input.roundId);
    }),

    getAttachmentsByMissionId: publicProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'missionId' in val) {
        return { missionId: (val as { missionId: unknown }).missionId as number };
      }
      throw new Error('Invalid input');
    }).query(async ({ input }) => {
      const { getAttachmentsByMissionId } = await import("../server/db");
      return getAttachmentsByMissionId(input.missionId);
    }),

    getAttachmentsByTopicId: publicProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'topicId' in val) {
        return { topicId: (val as { topicId: unknown }).topicId as number };
      }
      throw new Error('Invalid input');
    }).query(async ({ input }) => {
      const { getAttachmentsByTopicId } = await import("../server/db");
      return getAttachmentsByTopicId(input.topicId);
    }),

    getRoundProgress: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'roundId' in val) {
        return { roundId: (val as { roundId: unknown }).roundId as number };
      }
      throw new Error('Invalid input');
    }).query(async ({ ctx, input }) => {
      const { getRoundProgress } = await import("../server/db");
      return getRoundProgress(ctx.user.id, input.roundId);
    }),

    // Comentários
    getCommentsByMissionId: publicProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'missionId' in val) {
        return { missionId: (val as { missionId: unknown }).missionId as number };
      }
      throw new Error('Invalid input');
    }).query(async ({ input }) => {
      const { getCommentsByMissionId } = await import("../server/db");
      return getCommentsByMissionId(input.missionId);
    }),

    addComment: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'missionId' in val && 'content' in val) {
        return {
          missionId: (val as { missionId: unknown }).missionId as number,
          content: (val as { content: unknown }).content as string,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      const { getDb } = await import("../server/db");
      const { comments } = await import("../drizzle/schema");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.insert(comments).values({
        missionId: input.missionId,
        userId: ctx.user.id,
        content: input.content,
      });

      return { success: true };
    }),
  }),

  admin: router({
    // Criar Rodada
    createRound: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'name' in val) {
        return {
          name: (val as { name: unknown }).name as string,
          description: (val as { description?: unknown }).description as string | undefined,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { getDb } = await import("../server/db");
      const { rounds } = await import("../drizzle/schema");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.insert(rounds).values({
        name: input.name,
        description: input.description || null,
        order: 0,
      });

      return { success: true, id: result[0].insertId };
    }),

    // Deletar Rodada
    deleteRound: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'roundId' in val) {
        return { roundId: (val as { roundId: unknown }).roundId as number };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { getDb } = await import("../server/db");
      const { rounds } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(rounds).where(eq(rounds.id, input.roundId));
      return { success: true };
    }),

    // Criar Missão
    createMission: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'roundId' in val && 'name' in val) {
        return {
          roundId: (val as { roundId: unknown }).roundId as number,
          name: (val as { name: unknown }).name as string,
          description: (val as { description?: unknown }).description as string | undefined,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { getDb } = await import("../server/db");
      const { missions } = await import("../drizzle/schema");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.insert(missions).values({
        roundId: input.roundId,
        name: input.name,
        description: input.description || null,
        order: 0,
      });

      return { success: true, id: result[0].insertId };
    }),

    // Deletar Missão
    deleteMission: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'missionId' in val) {
        return { missionId: (val as { missionId: unknown }).missionId as number };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { getDb } = await import("../server/db");
      const { missions } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(missions).where(eq(missions.id, input.missionId));
      return { success: true };
    }),

    // Criar Tópico
    createTopic: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'missionId' in val && 'name' in val) {
        return {
          missionId: (val as { missionId: unknown }).missionId as number,
          name: (val as { name: unknown }).name as string,
          description: (val as { description?: unknown }).description as string | undefined,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { getDb } = await import("../server/db");
      const { topics } = await import("../drizzle/schema");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db.insert(topics).values({
        missionId: input.missionId,
        name: input.name,
        description: input.description || null,
        order: 0,
      });

      return { success: true, id: result[0].insertId };
    }),

    // Deletar Tópico
    deleteTopic: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'topicId' in val) {
        return { topicId: (val as { topicId: unknown }).topicId as number };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { getDb } = await import("../server/db");
      const { topics } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(topics).where(eq(topics.id, input.topicId));
      return { success: true };
    }),
    // Listar Usuários
    getUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { getDb } = await import("../server/db");
      const { users } = await import("../drizzle/schema");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      return await db.select().from(users);
    }),

    // Criar Usuário
    createUser: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'email' in val && 'name' in val && 'password' in val) {
        return {
          email: (val as { email: unknown }).email as string,
          name: (val as { name: unknown }).name as string,
          password: (val as { password: unknown }).password as string,
          role: (val as { role?: unknown }).role as 'admin' | 'user' | undefined,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { getDb } = await import("../server/db");
      const { users } = await import("../drizzle/schema");
      const bcrypt = await import("bcryptjs");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const result = await db.insert(users).values({
        email: input.email,
        name: input.name,
        password: hashedPassword,
        role: input.role || 'user',
        openId: `temp-${Date.now()}`,
      });

      return { success: true, id: result[0].insertId };
    }),

    // Editar Usuário
    updateUser: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return {
          id: (val as { id: unknown }).id as number,
          name: (val as { name?: unknown }).name as string | undefined,
          password: (val as { password?: unknown }).password as string | undefined,
          role: (val as { role?: unknown }).role as 'admin' | 'user' | undefined,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { getDb } = await import("../server/db");
      const { users } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      const bcrypt = await import("bcryptjs");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const updateData: Record<string, unknown> = {};
      if (input.name) updateData.name = input.name;
      if (input.role) updateData.role = input.role;
      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 10);
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields to update');
      }

      await db.update(users)
        .set(updateData)
        .where(eq(users.id, input.id));
      return { success: true };
    }),

    // Deletar Usuário
    deleteUser: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'userId' in val) {
        return { userId: (val as { userId: unknown }).userId as number };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Unauthorized');
      const { getDb } = await import("../server/db");
      const { users } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(users).where(eq(users.id, input.userId));
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
