import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from '@trpc/server';

const adminProcedure = publicProcedure.use(async (opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Você precisa estar autenticado',
    });
  }
  if (opts.ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Você não tem permissão para realizar esta ação',
    });
  }
  return opts.next({ ctx: { ...opts.ctx, user: opts.ctx.user } });
});

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
    createRound: adminProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'name' in val && 'order' in val) {
        return {
          name: (val as { name: unknown }).name as string,
          description: (val as { description?: unknown }).description as string | undefined,
          order: (val as { order: unknown }).order as number,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ input }) => {
      const { createRound } = await import("../server/db");
      return createRound(input);
    }),
    updateRound: adminProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return {
          id: (val as { id: unknown }).id as number,
          name: (val as { name?: unknown }).name as string | undefined,
          description: (val as { description?: unknown }).description as string | undefined,
          order: (val as { order?: unknown }).order as number | undefined,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ input }) => {
      const { updateRound } = await import("../server/db");
      const { id, ...data } = input;
      return updateRound(id, data);
    }),
    deleteRound: adminProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return { id: (val as { id: unknown }).id as number };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ input }) => {
      const { deleteRound } = await import("../server/db");
      return deleteRound(input.id);
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
    createMission: adminProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'roundId' in val && 'name' in val && 'order' in val) {
        return {
          roundId: (val as { roundId: unknown }).roundId as number,
          name: (val as { name: unknown }).name as string,
          description: (val as { description?: unknown }).description as string | undefined,
          order: (val as { order: unknown }).order as number,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ input }) => {
      const { createMission } = await import("../server/db");
      return createMission(input);
    }),
    updateMission: adminProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return {
          id: (val as { id: unknown }).id as number,
          name: (val as { name?: unknown }).name as string | undefined,
          description: (val as { description?: unknown }).description as string | undefined,
          order: (val as { order?: unknown }).order as number | undefined,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ input }) => {
      const { updateMission } = await import("../server/db");
      const { id, ...data } = input;
      return updateMission(id, data);
    }),
    deleteMission: adminProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return { id: (val as { id: unknown }).id as number };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ input }) => {
      const { deleteMission } = await import("../server/db");
      return deleteMission(input.id);
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
    createTopic: adminProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'missionId' in val && 'name' in val && 'order' in val) {
        return {
          missionId: (val as { missionId: unknown }).missionId as number,
          name: (val as { name: unknown }).name as string,
          description: (val as { description?: unknown }).description as string | undefined,
          order: (val as { order: unknown }).order as number,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ input }) => {
      const { createTopic } = await import("../server/db");
      return createTopic(input);
    }),
    updateTopic: adminProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return {
          id: (val as { id: unknown }).id as number,
          name: (val as { name?: unknown }).name as string | undefined,
          description: (val as { description?: unknown }).description as string | undefined,
          order: (val as { order?: unknown }).order as number | undefined,
        };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ input }) => {
      const { updateTopic } = await import("../server/db");
      const { id, ...data } = input;
      return updateTopic(id, data);
    }),
    deleteTopic: adminProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return { id: (val as { id: unknown }).id as number };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ input }) => {
      const { deleteTopic } = await import("../server/db");
      return deleteTopic(input.id);
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
    getAttachmentsByTopicId: publicProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'topicId' in val) {
        return { topicId: (val as { topicId: unknown }).topicId as number };
      }
      throw new Error('Invalid input');
    }).query(async ({ input }) => {
      const { getAttachmentsByTopicId } = await import("../server/db");
      return getAttachmentsByTopicId(input.topicId);
    }),
    deleteAttachment: adminProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'id' in val) {
        return { id: (val as { id: unknown }).id as number };
      }
      throw new Error('Invalid input');
    }).mutation(async ({ input }) => {
      const { deleteAttachment } = await import("../server/db");
      return deleteAttachment(input.id);
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
      const { createComment } = await import("../server/db");
      await createComment(input.missionId, ctx.user.id, input.content);
      return { success: true };
    }),

    // Progresso por Rodada
    getRoundProgress: protectedProcedure.input((val: unknown) => {
      if (typeof val === 'object' && val !== null && 'roundId' in val) {
        return { roundId: (val as { roundId: unknown }).roundId as number };
      }
      throw new Error('Invalid input');
    }).query(async ({ ctx, input }) => {
      const { getRoundProgress } = await import("../server/db");
      return getRoundProgress(ctx.user.id, input.roundId);
    }),
    getAllRoundsProgress: protectedProcedure.query(async ({ ctx }) => {
      const { getAllRoundsProgress } = await import("../server/db");
      return getAllRoundsProgress(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
