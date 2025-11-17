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
});

export type AppRouter = typeof appRouter;
